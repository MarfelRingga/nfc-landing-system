import nodemailer from 'nodemailer';

export const sendWelcomeEmail = async (toEmail: string, name: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD, // Use Gmail App Password
      },
    });

    const { getWelcomeEmailTemplate } = await import('./emailTemplate');
    const htmlContent = getWelcomeEmailTemplate(name);

    const mailOptions = {
      from: `"Rifelo Team" <${process.env.SMTP_EMAIL}>`,
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
