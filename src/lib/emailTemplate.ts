export const getWelcomeEmailTemplate = (name: string) => {
  return `
    <div style="margin:0;padding:0;background-color:#f4f3ee;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" 
        style="background-color:#f4f3ee;font-family:-apple-system,BlinkMacSystemFont,'Inter',Arial,sans-serif;width:100%;">
        
        <tr>
          <td align="center" style="padding: 40px 16px;">

            <!-- Main Card -->
            <table cellpadding="0" cellspacing="0" border="0" 
              style="max-width:560px;width:100%;background-color:#ffffff;border-radius:24px;border:1px solid #e5e5e5;box-shadow:0 8px 24px rgba(0,0,0,0.04);overflow:hidden;">
              
              <tr>
                <td style="padding:48px 40px;text-align:left;">
                  
                  <!-- Logo/Header -->
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="font-size:22px;font-weight:700;color:#1a1a1a;letter-spacing:-0.5px;">
                        Rifelo
                      </td>
                    </tr>
                  </table>

                  <div style="height:32px;"></div>

                  <!-- Title -->
                  <h1 style="margin:0;font-size:26px;font-weight:600;color:#1a1a1a;letter-spacing:-0.5px;line-height:1.2;">
                    Your Rifelo is ready.
                  </h1>

                  <div style="height:16px;"></div>

                  <!-- Body -->
                  <p style="margin:0;font-size:16px;color:#4a4a4a;line-height:1.6;">
                    Hi ${name},
                  </p>
                  <p style="margin:12px 0 0;font-size:16px;color:#4a4a4a;line-height:1.6;">
                    You can now set up your profile and start sharing your identity instantly. It only takes a minute.
                  </p>

                  <div style="height:36px;"></div>

                  <!-- CTA Button -->
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td>
                        <a href="https://rifelo.id"
                           style="display:inline-block;padding:16px 32px;background-color:#1a1a1a;color:#ffffff;text-decoration:none;border-radius:99px;font-size:15px;font-weight:500;text-align:center;">
                          Set up your profile
                        </a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>
              
              <!-- Footer Section (inside the card but different bg) -->
              <tr>
                <td style="background-color:#faf9f7;padding:32px 40px;border-top:1px solid #f0f0f0;">
                  <p style="margin:0;font-size:14px;color:#737373;line-height:1.5;">
                    Need help? Just reply to this email, we're here for you.
                  </p>
                </td>
              </tr>

            </table>

            <!-- Bottom Disclaimer -->
            <table cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
              <tr>
                <td style="padding:24px 0;text-align:center;">
                  <p style="margin:0;font-size:13px;color:#9ca3af;">
                    © ${new Date().getFullYear()} Rifelo. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    </div>
  `;
};

