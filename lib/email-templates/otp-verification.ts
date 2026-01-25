export function otpVerificationTemplate(otp: string, name?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 24px; text-align: center;">
              <div style="display: inline-block; width: 48px; height: 48px; background-color: #ff480e; border-radius: 8px; margin-bottom: 16px;">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 14V24L30 30" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="24" cy="24" r="10" stroke="white" stroke-width="3"/>
                </svg>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #0e0e0e; line-height: 1.3;">
                Verify Your Email
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 24px;">
              ${name ? `<p style="margin: 0 0 16px; font-size: 16px; color: #0e0e0e; line-height: 1.6;">Hi ${name},</p>` : ''}
              <p style="margin: 0 0 24px; font-size: 16px; color: #666666; line-height: 1.6;">
                Welcome to AIVOX! To complete your signup, please use the verification code below:
              </p>
            </td>
          </tr>

          <!-- OTP Code -->
          <tr>
            <td style="padding: 0 40px 32px;" align="center">
              <div style="display: inline-block; background-color: #f5f5f5; border: 2px solid #e0e0e0; border-radius: 8px; padding: 24px 48px;">
                <p style="margin: 0; font-size: 32px; font-weight: 700; color: #ff480e; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${otp}
                </p>
              </div>
            </td>
          </tr>

          <!-- Info -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6; text-align: center;">
                This code will expire in <strong>5 minutes</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 40px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #999999; line-height: 1.5;">
                If you didn't request this code, you can safely ignore this email.
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999; line-height: 1.5;">
                © ${new Date().getFullYear()} AIVOX. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
