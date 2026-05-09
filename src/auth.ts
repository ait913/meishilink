import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Nodemailer from "next-auth/providers/nodemailer";
import { Resend } from "resend";

import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

const isTestMode =
  process.env.AUTH_TEST_MODE === "true" && process.env.NODE_ENV !== "production";

const resendApiKey = process.env.RESEND_API_KEY ?? "";
const fromAddress = process.env.EMAIL_FROM ?? "MeishiLink <onboarding@resend.dev>";

const buildMagicLinkEmail = (url: string, host: string) => {
  const safeUrl = url.replace(/&/g, "&amp;");
  return {
    text: `MeishiLink にログインするにはこのリンクを開いてください:\n\n${url}\n\n心当たりがない場合はこのメールを無視してください。`,
    html: `<!DOCTYPE html>
<html lang="ja"><head><meta charset="utf-8"><title>MeishiLink ログイン</title></head>
<body style="margin:0;padding:32px 16px;background:#f5f4ef;font-family:-apple-system,'Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif;color:#121212;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;">
    <h1 style="font-size:18px;margin:0 0 12px;">MeishiLink にログイン</h1>
    <p style="font-size:14px;line-height:1.7;margin:0 0 24px;color:#555;">下のボタンをクリックしてサインインを完了してください。リンクは 24 時間有効です。</p>
    <p style="margin:0 0 24px;"><a href="${safeUrl}" style="display:inline-block;padding:12px 20px;background:#0a0a0a;color:#fff;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;">MeishiLink にログイン</a></p>
    <p style="font-size:12px;line-height:1.6;color:#888;margin:0;">ボタンが動かない場合は次の URL を直接開いてください:<br><span style="word-break:break-all;">${safeUrl}</span></p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
    <p style="font-size:11px;color:#999;margin:0;">このメールに心当たりがない場合は無視してください。${host}</p>
  </div>
</body></html>`,
    subject: `MeishiLink ログインリンク (${host})`,
  };
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Nodemailer({
      server: { host: "smtp.resend.com", port: 465, auth: { user: "resend", pass: resendApiKey || "noop" } },
      from: fromAddress,
      async sendVerificationRequest({ identifier, url }: { identifier: string; url: string }) {
        const host = new URL(url).host;
        if (!resendApiKey) {
          console.log(`[MagicLink:dev] to=${identifier} host=${host} url=${url}`);
          return;
        }
        const resend = new Resend(resendApiKey);
        const message = buildMagicLinkEmail(url, host);
        const { error } = await resend.emails.send({
          from: fromAddress,
          to: identifier,
          subject: message.subject,
          html: message.html,
          text: message.text,
        });
        if (error) {
          console.error("[MagicLink:resend] send failed:", error);
          throw new Error(`Resend send failed: ${error.message}`);
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
