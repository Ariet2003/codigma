import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { question, contactType, contact } = await request.json();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // true для порта 465, false для других портов
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      tls: {
        // Не проверяем сертификат
        rejectUnauthorized: false
      }
    });

    // Проверяем соединение
    await transporter.verify().catch((err) => {
      console.error("Verification error:", err);
      throw new Error("Failed to verify email configuration");
    });

    const mailOptions = {
      from: process.env.EMAIL_SERVER_USER,
      to: process.env.EMAIL_SERVER_USER,
      subject: "Новый вопрос в службу поддержки Codigma",
      html: `
        <h2>Новый вопрос от пользователя</h2>
        <p><strong>Вопрос:</strong><br>${question}</p>
        <p><strong>Способ связи:</strong> ${contactType}</p>
        <p><strong>Контакт:</strong> ${contact}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Support email error:", error);
    return NextResponse.json(
      { error: "Failed to send support email" },
      { status: 500 }
    );
  }
} 