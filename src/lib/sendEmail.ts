import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';

async function getSettingValue(id: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('id', id)
      .single();
    if (error) return null;
    return data?.value || null;
  } catch (err) {
    console.error(`Error getting setting ${id}:`, err);
    return null;
  }
}

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

    const customSubject = await getSettingValue('email_welcome_subject');
    const customBody = await getSettingValue('email_welcome_body');

    const { getWelcomeEmailTemplate } = await import('./emailTemplate');
    const htmlContent = getWelcomeEmailTemplate(name, customBody || undefined);

    const mailOptions = {
      from: `"Rifelo" <${process.env.SMTP_EMAIL || 'hello@rifelo.id'}>`,
      to: toEmail,
      subject: customSubject || 'Welcome to Rifelo! 🎉',
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

export const sendSubscribeEmail = async (toEmail: string) => {
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

    const customSubject = await getSettingValue('email_subscribe_subject');
    const customBody = await getSettingValue('email_subscribe_body');

    const { getSubscribeEmailTemplate } = await import('./emailTemplate');
    const htmlContent = getSubscribeEmailTemplate(toEmail, customBody || undefined);

    const mailOptions = {
       from: `"Rifelo" <${process.env.SMTP_EMAIL || 'hello@rifelo.id'}>`,
       to: toEmail,
       subject: customSubject || 'Welcome to Rifelo Updates! 🚀',
       html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Subscribe email sent: ', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending subscribe email: ', error);
    return { success: false, error };
  }
};

