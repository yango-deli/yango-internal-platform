import { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import type { AdapterAccount } from "next-auth/adapters";

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

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

const NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? "https://supplier-promo-simulation.vercel.app";

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: patchedAdapter as any,
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          redirect_uri: `${NEXTAUTH_URL}/api/auth/callback/azure-ad`,
          scope: "openid profile email User.Read Mail.Read Tasks.ReadWrite Calendars.Read Files.Read.All Sites.Read.All Presence.Read Team.ReadBasic.All User.Read.All Directory.Read.All",
        },
      },
    }),
  ],
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

      if (adminEmails.includes(user.email.toLowerCase())) {
        try {
          await prisma.user.update({
            where: { email: user.email },
            data: { role: Role.admin },
          });
        } catch {
          // User may not exist yet on first login
        }
      }

      return true;
    },

    async jwt({ token, account, trigger }) {
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
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
};
