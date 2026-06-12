import { NextResponse } from "next/server";
import { Resend } from "resend";
import { siteConfig } from "@/lib/config";

export async function GET() {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const to = siteConfig.email;

  if (!key) {
    return NextResponse.json({
      status: "error",
      message: "RESEND_API_KEY is not set",
      env_check: {
        RESEND_API_KEY: "MISSING",
        RESEND_FROM_EMAIL: from,
        ADMIN_EMAIL: to,
      },
    });
  }

  try {
    const resend = new Resend(key);
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: "Test Email dari Clothing Store",
      html: "<h2>Test berhasil!</h2><p>Email system berfungsi.</p>",
    });

    if (error) {
      return NextResponse.json({
        status: "resend_error",
        error,
        env_check: {
          RESEND_API_KEY: `set (${key.slice(0, 8)}...)`,
          RESEND_FROM_EMAIL: from,
          ADMIN_EMAIL: to,
        },
      });
    }

    return NextResponse.json({
      status: "sent",
      data,
      env_check: {
        RESEND_API_KEY: `set (${key.slice(0, 8)}...)`,
        RESEND_FROM_EMAIL: from,
        ADMIN_EMAIL: to,
      },
    });
  } catch (err) {
    return NextResponse.json({
      status: "exception",
      message: String(err),
      env_check: {
        RESEND_API_KEY: `set (${key.slice(0, 8)}...)`,
        RESEND_FROM_EMAIL: from,
        ADMIN_EMAIL: to,
      },
    });
  }
}
