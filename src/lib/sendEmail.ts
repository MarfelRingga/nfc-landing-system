import nodemailer from 'nodemailer';

export const sendWelcomeEmail = async (toEmail: string, name: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL || 'hello@rifelo.id',
        pass: process.env.SMTP_PASSWORD, // Use Zoho App Password
      },
    });

    const { getWelcomeEmailTemplate } = await import('./emailTemplate');
    const htmlContent = getWelcomeEmailTemplate(name);

    const mailOptions = {
      from: `"Rifelo" <${process.env.SMTP_EMAIL || 'hello@rifelo.id'}>`,
      to: toEmail,
      subject: 'Welcome to Rifelo! 🎉',
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent: ', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email: ', error);
    return { success: false, error };
  }
};
