import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false, // true для 465, false для других портов
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?email=${encodeURIComponent(email)}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Подтверждение email</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background: #4E7AFF;
            border-radius: 8px 8px 0 0;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: white;
            text-decoration: none;
          }
          .content {
            background: #ffffff;
            padding: 30px;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .code {
            text-align: center;
            font-size: 32px;
            letter-spacing: 8px;
            font-weight: bold;
            color: #4E7AFF;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 20px;
          }
          .note {
            font-size: 14px;
            color: #666;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">CODIGMA</div>
          </div>
          <div class="content">
            <h2>Подтверждение email</h2>
            <p>Здравствуйте!</p>
            <p>Спасибо за регистрацию в Codigma. Для подтверждения вашего email используйте следующий код:</p>
            <div class="code">${token}</div>
            <p>Если вы не регистрировались в Codigma, просто проигнорируйте это письмо.</p>
            <div class="note">
              <p>Код действителен в течение 1 часа.</p>
            </div>
          </div>
          <div class="footer">
            <p>Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
            <p>&copy; ${new Date().getFullYear()} Codigma. Все права защищены.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Подтверждение email | Codigma",
      html,
    });

    console.log("Verification email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

export async function sendPasswordResetEmail(email: string, token: string) {
  try {
    console.log('Отправка письма для сброса пароля на:', email);
    console.log('Код сброса:', token);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_SERVER_USER,
      to: email,
      subject: "Сброс пароля | Codigma",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; margin-bottom: 24px;">Сброс пароля</h1>
          <p style="color: #666; margin-bottom: 24px;">
            Вы запросили сброс пароля. Для создания нового пароля, пожалуйста, введите следующий код:
          </p>
          <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #4E7AFF;">${token}</span>
          </div>
          <p style="color: #666; margin-bottom: 24px;">
            Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.
          </p>
          <p style="color: #999; font-size: 14px;">
            С уважением,<br />
            Команда Codigma
          </p>
        </div>
      `,
    })

    console.log('Письмо отправлено:', info.messageId);
    return true;
  } catch (error) {
    console.error('Ошибка при отправке письма:', error);
    throw error;
  }
} 