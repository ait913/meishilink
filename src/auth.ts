import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Nodemailer from "next-auth/providers/nodemailer";

import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

const isTestMode = process.env.AUTH_TEST_MODE === "true";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Nodemailer({
      server: process.env.EMAIL_SERVER_HOST
        ? {
            host: process.env.EMAIL_SERVER_HOST,
            port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
            auth: {
              user: process.env.EMAIL_SERVER_USER ?? "",
              pass: process.env.EMAIL_SERVER_PASSWORD ?? "",
            },
          }
        : {
            host: "127.0.0.1",
            port: 587,
            auth: {
              user: "",
              pass: "",
            },
          },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url }: { identifier: string; url: string }) {
        if (!process.env.EMAIL_SERVER_HOST) {
          console.log(`[MagicLink] to=${identifier} url=${url}`);
          return;
        }
      },
    }),
    ...(isTestMode
      ? [
          Credentials({
            id: "test-credentials",
            name: "Test",
            credentials: {
              email: { label: "email", type: "email" },
            },
            async authorize(credentials: Record<string, unknown> | undefined) {
              if (!isTestMode) {
                return null;
              }
              const email = String(credentials?.email ?? "");
              if (!email) {
                return null;
              }
              const user = await prisma.user.upsert({
                where: { email },
                update: { emailVerified: new Date() },
                create: { email, emailVerified: new Date() },
              });
              return {
                id: user.id,
                email: user.email ?? "",
                name: user.name ?? null,
              };
            },
          }),
        ]
      : []),
  ],
});
