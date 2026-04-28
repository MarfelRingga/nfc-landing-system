export const getWelcomeEmailTemplate = (name: string) => {
  return `
    <div style="margin:0;padding:0;background:#f4f3ee;min-height:100vh;">
      <table width="100%" cellpadding="0" cellspacing="0" 
        style="font-family:Inter,Arial,sans-serif;background:#f4f3ee;min-height:100vh;">
        
        <tr>
          <td align="center" valign="top">

            <!-- FULL CONTAINER -->
            <table width="100%" cellpadding="0" cellspacing="0" 
              style="max-width:600px;padding:40px 32px;text-align:left;">

              <!-- Header -->
              <tr>
                <td style="font-size:18px;font-weight:600;color:#1a1a1a;">
                  Rifelo
                </td>
              </tr>

              <tr><td height="40"></td></tr>

              <!-- Title -->
              <tr>
                <td style="font-size:24px;font-weight:600;color:#1a1a1a;letter-spacing:-0.5px;">
                  Your Rifelo is ready.
                </td>
              </tr>

              <tr><td height="16"></td></tr>

              <!-- Body -->
              <tr>
                <td style="font-size:16px;color:#444;line-height:1.6;">
                  Hi ${name},
                  <br/><br/>
                  You can now set up your profile and start sharing your identity instantly.
                  <br/><br/>
                  It only takes a minute.
                </td>
              </tr>

              <tr><td height="32"></td></tr>

              <!-- CTA -->
              <tr>
                <td>
                  <a href="https://rifelo.id"
                     style="display:inline-block;padding:14px 28px;
                     background:#1a1a1a;color:#ffffff;
                     text-decoration:none;border-radius:999px;
                     font-size:15px;font-weight:500;">
                    Set up your profile
                  </a>
                </td>
              </tr>

              <tr><td height="48"></td></tr>

              <!-- Footer -->
              <tr>
                <td style="font-size:14px;color:#777;">
                  Need help? Just reply to this email.
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>
    </div>
  `;
};

