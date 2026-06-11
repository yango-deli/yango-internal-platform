import { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import type { AdapterAccount } from "next-auth/adapters";

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Email-only login (no Azure AD), enabled with ENABLE_DEV_LOGIN=true.
// TEMPORARY: also honored in production so the CRM can be tested on a deployed
// environment before real Azure AD SSO is wired up on the final domain.
// SECURITY: anyone who knows the URL can sign in while this is on — keep it set
// only on test deployments and remove ENABLE_DEV_LOGIN before going live.
export const devLoginEnabled = process.env.ENABLE_DEV_LOGIN === "true";

export const azureConfigured =
  !!process.env.AZURE_AD_CLIENT_ID &&
  !!process.env.AZURE_AD_CLIENT_SECRET &&
  !!process.env.AZURE_AD_TENANT_ID;

const providers: NextAuthOptions["providers"] = [];

if (azureConfigured) {
  providers.push(
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "openid profile email User.Read Mail.Read Tasks.ReadWrite Calendars.Read",
        },
      },
    })
  );
}

if (devLoginEnabled) {
  providers.push(
    CredentialsProvider({
      id: "dev-login",
      name: "Dev Login",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        if (!email) return null;
        const name =
          credentials?.name?.trim() ||
          email.split("@")[0].replace(/[._-]+/g, " ");
        const isAdmin = adminEmails.includes(email);
        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            name,
            role: isAdmin ? Role.admin : Role.viewer,
            emailVerified: new Date(),
          },
        });
        return { id: user.id, email: user.email, name: user.name };
      },
    })
  );
}

// Azure AD returns extra fields (ext_expires_in, etc.) that Prisma rejects.
// Patch linkAccount to only pass fields the schema knows about.
const baseAdapter = PrismaAdapter(prisma);
const patchedAdapter = {
  ...baseAdapter,
  linkAccount: (account: AdapterAccount) => {
    const { userId, type, provider, providerAccountId, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state } = account;
    return prisma.account.create({
      data: { userId, type, provider, providerAccountId, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state },
    });
  },
};

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: patchedAdapter as any,
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      // Elevate to admin if listed in ADMIN_EMAILS
      if (adminEmails.includes(user.email.toLowerCase())) {
        try {
          await prisma.user.update({
            where: { email: user.email },
            data: { role: Role.admin },
          });
        } catch {
          // User may not exist yet on very first login — adapter creates it
          // next jwt callback will handle the elevation
        }
      }

      return true;
    },

    async jwt({ token, account, trigger }) {
      // Persist Graph-capable access token from Azure AD on initial sign-in
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      if (trigger === "signIn" || !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          select: { id: true, role: true, isActive: true },
        });

        if (dbUser) {
          if (!dbUser.isActive) {
            return { ...token, error: "AccountDisabled" };
          }

          // Auto-elevate admin on first login
          if (
            adminEmails.includes((token.email ?? "").toLowerCase()) &&
            dbUser.role !== Role.admin
          ) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { role: Role.admin },
            });
            token.role = Role.admin;
          } else {
            token.role = dbUser.role;
          }

          token.userId = dbUser.id;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token.error === "AccountDisabled") {
        return { ...session, error: "AccountDisabled" };
      }
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.userId as string;
      }
      // Expose accessToken for Microsoft Graph calls from client widgets
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
};
