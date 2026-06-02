import { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
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

    async jwt({ token, trigger }) {
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
      return session;
    },
  },
};
