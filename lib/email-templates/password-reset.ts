export function passwordResetTemplate(otp: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
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
                  <path d="M18 22V20C18 16.6863 20.6863 14 24 14C27.3137 14 30 16.6863 30 20V22" stroke="white" stroke-width="3" stroke-linecap="round"/>
                  <rect x="16" y="22" width="16" height="10" rx="2" stroke="white" stroke-width="3"/>
                </svg>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #0e0e0e; line-height: 1.3;">
                Reset Your Password
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #666666; line-height: 1.6;">
                We received a request to reset your password. Use the verification code below to proceed:
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
                This code will expire in <strong>10 minutes</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 40px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #999999; line-height: 1.5;">
                If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
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
