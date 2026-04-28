export const getWelcomeEmailTemplate = (name: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #000; margin: 0;">Welcome to Rifelo!</h1>
      </div>
      
      <p>Hi ${name},</p>
      
      <p>Welcome to Rifelo! We're thrilled to have you on board. Your account has been successfully created.</p>
      
      <p>With Rifelo, you can easily connect physical NFC tags to your digital profile, manage your circles, and share your identity seamlessly.</p>
      
      <p>If you have any questions or need help getting started, simply reply to this email.</p>
      
      <br>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="margin: 0; font-weight: bold; font-size: 16px;">The Rifelo Team</p>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #666;">Bridging Physical & Digital Worlds</p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #999;">
          <a href="https://rifelo.id" style="color: #000; text-decoration: none;">rifelo.id</a> | 
          <a href="mailto:hello@rifelo.id" style="color: #000; text-decoration: none;">hello@rifelo.id</a>
        </p>
      </div>
    </div>
  `;
};
