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

export async function sendVerificationEmail(email: string, token: string) {
  try {
    console.log('Отправка письма на:', email);
    console.log('Код верификации:', token);
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_SERVER_USER,
      to: email,
      subject: "Подтвердите ваш email | Codigma",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; margin-bottom: 24px;">Подтвердите ваш email</h1>
          <p style="color: #666; margin-bottom: 24px;">
            Спасибо за регистрацию в Codigma! Для завершения регистрации, пожалуйста, введите следующий код подтверждения:
          </p>
          <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #4E7AFF;">${token}</span>
          </div>
          <p style="color: #666; margin-bottom: 24px;">
            Если вы не регистрировались в Codigma, просто проигнорируйте это письмо.
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