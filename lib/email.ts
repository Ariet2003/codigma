import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  secure: true,
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Подтвердите ваш email",
    html: `
      <div>
        <h1>Подтверждение email</h1>
        <p>Для подтверждения вашего email адреса, пожалуйста, перейдите по ссылке:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>Ссылка действительна в течение 24 часов.</p>
      </div>
    `,
  });
}

export async function sendResetPasswordEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Сброс пароля",
    html: `
      <div>
        <h1>Сброс пароля</h1>
        <p>Вы запросили сброс пароля. Для создания нового пароля перейдите по ссылке:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Ссылка действительна в течение 1 часа.</p>
        <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
      </div>
    `,
  });
}

export async function send2FACode(email: string, code: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Код двухфакторной аутентификации",
    html: `
      <div>
        <h1>Код подтверждения</h1>
        <p>Ваш код для двухфакторной аутентификации:</p>
        <h2>${code}</h2>
        <p>Код действителен в течение 5 минут.</p>
      </div>
    `,
  });
} 