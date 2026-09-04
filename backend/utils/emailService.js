import "dotenv/config";
import { Resend } from "resend";

// Secure Transactional Email Dispatcher Service with Resend & Sandbox Fallback

/**
 * Dispatches real Email OTP via Resend API or Dev Sandbox
 *
 * @param {string} recipientEmail - Target email address
 * @param {string} otp - 6-digit cryptographic verification code
 * @returns {Promise<{ success: boolean, id?: string, isSandbox?: boolean, provider?: string, error?: string, message?: string }>}
 */
export const sendEmailOTP = async (recipientEmail, otp) => {
    console.log('RESEND_API_KEY loaded:', process.env.RESEND_API_KEY ? 'YES (' + process.env.RESEND_API_KEY.trim().length + ' chars)' : 'NO - UNDEFINED');
    try {
        const cleanEmail = recipientEmail.trim().toLowerCase();
        const maskedEmail = cleanEmail.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(Math.max(b.length - 2, 2)) + c);

        const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c1317; color: #e9edef; padding: 24px; margin: 0; }
            .card { max-width: 520px; margin: 0 auto; background: #111b21; border: 1px solid #222e35; border-radius: 20px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .header { text-align: center; margin-bottom: 24px; }
            .logo-title { font-size: 26px; font-weight: 800; color: #00a884; letter-spacing: -0.5px; }
            .subtitle { color: #8696a0; font-size: 13px; margin-top: 4px; }
            .greeting { font-size: 15px; line-height: 1.6; color: #d1d7db; }
            .otp-box { background: #202c33; border: 2px dashed #00a884; border-radius: 14px; text-align: center; padding: 24px; margin: 24px 0; }
            .otp-code { font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #ffffff; font-family: 'Courier New', Courier, monospace; }
            .validity { font-size: 12px; color: #00a884; margin: 10px 0 0 0; font-weight: 600; }
            .security-note { font-size: 12px; color: #8696a0; line-height: 1.5; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 8px; }
            .footer { font-size: 11px; color: #8696a0; text-align: center; margin-top: 28px; border-top: 1px solid #222e35; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div class="logo-title">Aryavarta Chat 🚀</div>
              <p class="subtitle">Email Security & Verification</p>
            </div>
            <p class="greeting">Hello,</p>
            <p class="greeting">Thank you for joining Aryavarta. Please use the following 6-digit code to verify your email address:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <p class="validity">⏱️ Valid for 5 minutes • Single Use Only</p>
            </div>
            <div class="security-note">
              🔒 <strong>Security Warning:</strong> Never share this code with anyone. Aryavarta staff will never ask for your verification code or password.
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Aryavarta Chat Application. All rights reserved.
            </div>
          </div>
        </body>
        </html>
        `;

        // =====================================================================
        // 1. RESEND API DISPATCH
        // =====================================================================
        if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== "") {
            const resend = new Resend(process.env.RESEND_API_KEY.trim());
            const fromEmail = process.env.EMAIL_FROM || "Aryavarta <onboarding@resend.dev>";

            console.log(`[Email Gateway] Dispatching Resend email to ${maskedEmail} from ${fromEmail}...`);

            const { data, error } = await resend.emails.send({
                from: fromEmail,
                to: [cleanEmail],
                subject: "Your Aryavarta Email Verification Code",
                html: htmlBody
            });

            console.log('Resend response:', JSON.stringify({ data, error }));

            if (error) {
                console.error("Resend error:", error);
                let errorExplanation = error.message || "Failed to send email via Resend.";

                if (error.message?.includes("domain is not verified")) {
                    errorExplanation = "Resend error: Domain unverified. In test mode, set EMAIL_FROM=onboarding@resend.dev to test with your Resend account email.";
                } else if (error.message?.includes("API key")) {
                    errorExplanation = "Resend error: Invalid RESEND_API_KEY. Please verify your API key in .env.";
                }

                return {
                    success: false,
                    provider: "resend",
                    error: errorExplanation
                };
            }

            console.log(`[Email Gateway] ✅ Resend email dispatched to ${maskedEmail} (Message ID: ${data?.id})`);
            return {
                success: true,
                provider: "resend",
                id: data?.id,
                message: "Verification code sent to your email address."
            };
        }

        // =====================================================================
        // 2. DEV / SANDBOX MODE (When RESEND_API_KEY is not configured)
        // =====================================================================
        if (process.env.NODE_ENV === "production") {
            console.error(`[Email Gateway Error] No email provider configured in production for ${maskedEmail}`);
            return {
                success: false,
                provider: "none",
                error: "Email service is currently unavailable. Please contact support."
            };
        }

        // Terminal console logging ONLY (Never sent over HTTP/API to browser)
        console.log("\n============================================================");
        console.log("✉️ [EMAIL DEV / SANDBOX MODE ACTIVE - SERVER TERMINAL ONLY]");
        console.log(`📧 Recipient Email : ${cleanEmail}`);
        console.log(`🔑 6-Digit Email OTP: >>> ${otp} <<< (Valid for 5 mins)`);
        console.log("ℹ️ Note: This code is NEVER exposed to the frontend/network API.");
        console.log("ℹ️ To send REAL emails, add RESEND_API_KEY to .env");
        console.log("============================================================\n");

        return {
            success: true,
            isSandbox: true,
            provider: "sandbox",
            message: "Verification code sent. [Dev Mode: Check server terminal for OTP]"
        };
    } catch (error) {
        console.error("[Email Gateway Exception] Failed to send email:", error.message);
        return {
            success: false,
            error: `Email delivery exception: ${error.message}`
        };
    }
};

export default sendEmailOTP;
