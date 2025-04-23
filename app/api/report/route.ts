import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.verify().catch((err) => {
      console.error("Verification error:", err);
      throw new Error("Failed to verify email configuration");
    });

    const mailOptions = {
      from: process.env.EMAIL_SERVER_USER,
      to: process.env.EMAIL_SERVER_USER,
      subject: "Сообщение о проблеме на Codigma",
      html: `
        <h2>Новое сообщение о проблеме</h2>
        <p><strong>Описание проблемы:</strong><br>${description}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Report email error:", error);
    return NextResponse.json(
      { error: "Failed to send report email" },
      { status: 500 }
    );
  }
} 