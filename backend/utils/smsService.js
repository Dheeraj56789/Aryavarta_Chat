import "dotenv/config";

// Production-Grade Multi-Provider Real SMS Service with Sandbox Fallback & Detailed Error Diagnostics

/**
 * Normalizes phone numbers to standard E.164 international format.
 */
export const normalizeToE164 = (phone) => {
    if (!phone) return "";
    let clean = phone.trim().replace(/[\s\-()]/g, "");
    if (!clean.startsWith("+")) {
        // If 10 digits and starts with 6,7,8,9, assume India +91
        if (/^[6-9]\d{9}$/.test(clean)) {
            clean = `+91${clean}`;
        } else if (/^\d{10}$/.test(clean)) {
            clean = `+1${clean}`;
        } else {
            clean = `+${clean}`;
        }
    }
    return clean;
};

/**
 * Dispatches real SMS OTP via configured SMS Gateway:
 * - Twilio Programmable SMS API (Custom OTP in MongoDB, global delivery, free trial credit)
 * - Twilio Verify Service (Automated telecom verification)
 * - Fast2SMS API (Indian Quick SMS/OTP Gateway)
 * - 2Factor.in API (Dedicated Indian SMS OTP Gateway)
 * - MSG91 OTP API (Indian Telecom Route)
 * - Custom SMS Gateway Webhook
 * - Developer Sandbox / Fallback mode with prominent console logging
 */
export const sendRealSMSOTP = async (phoneNumber, otp) => {
    const cleanPhone = normalizeToE164(phoneNumber);
    const maskedPhone = cleanPhone.slice(0, 4) + "****" + cleanPhone.slice(-2);

    console.log(`[SMS Service Dispatch] Target: ${maskedPhone} | FAST2SMS_API_KEY loaded: ${process.env.FAST2SMS_API_KEY ? "YES (" + process.env.FAST2SMS_API_KEY.trim().length + " chars)" : "NO - UNDEFINED"}`);

    // =========================================================================
    // 1. TWILIO PROGRAMMABLE SMS (Global, supports custom MongoDB OTP & Free Trial)
    // =========================================================================
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        try {
            const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID.trim()}:${process.env.TWILIO_AUTH_TOKEN.trim()}`).toString("base64");
            const url = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID.trim()}/Messages.json`;

            const messageBody = `Your Aryavarta verification code is ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;
            const params = new URLSearchParams({
                To: cleanPhone,
                From: process.env.TWILIO_PHONE_NUMBER.trim(),
                Body: messageBody
            });

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params.toString()
            });

            const data = await res.json();

            if (res.ok && (data.status === "queued" || data.status === "sent" || data.status === "delivered")) {
                console.log(`[SMS Service] ✅ Twilio SMS dispatched successfully to ${maskedPhone} (SID: ${data.sid})`);
                return { success: true, provider: "twilio_sms", sid: data.sid };
            } else {
                console.error(`[SMS Service Error] Twilio SMS failed:`, data);
                let errorExplanation = data.message || "Failed to send SMS via Twilio.";

                if (data.code === 21608) {
                    errorExplanation = `Twilio Trial restriction: Number ${cleanPhone} is unverified. Please verify this phone number in your Twilio Console (Phone Numbers > Verified Caller IDs) or upgrade your Twilio account.`;
                } else if (data.code === 20003) {
                    errorExplanation = "Twilio authentication failed. Please verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.";
                } else if (data.code === 21211) {
                    errorExplanation = `Twilio error: Invalid phone number format (${cleanPhone}). Must be standard E.164.`;
                } else if (data.code === 21614) {
                    errorExplanation = `Twilio error: The number ${cleanPhone} is not capable of receiving SMS messages.`;
                }

                return {
                    success: false,
                    provider: "twilio_sms",
                    providerErrorCode: data.code || "TWILIO_ERROR",
                    providerMessage: errorExplanation
                };
            }
        } catch (err) {
            console.error(`[SMS Service Exception] Twilio SMS exception:`, err.message);
            return {
                success: false,
                provider: "twilio_sms",
                providerErrorCode: "NETWORK_ERROR",
                providerMessage: `Could not connect to Twilio SMS API: ${err.message}`
            };
        }
    }

    // =========================================================================
    // 2. TWILIO VERIFY SERVICE (Provider-Managed Global Telecom Verification)
    // =========================================================================
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID) {
        try {
            const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID.trim()}:${process.env.TWILIO_AUTH_TOKEN.trim()}`).toString("base64");
            const url = `https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SERVICE_SID.trim()}/Verifications`;

            const params = new URLSearchParams({
                To: cleanPhone,
                Channel: "sms"
            });

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params.toString()
            });

            const data = await res.json();

            if (res.ok && data.status === "pending") {
                console.log(`[SMS Service] ✅ Twilio Verify dispatched SMS to ${maskedPhone} (SID: ${data.sid})`);
                return { success: true, provider: "twilio_verify", sid: data.sid };
            } else {
                console.error(`[SMS Service Error] Twilio Verify failed:`, data);
                let errorExplanation = data.message || "Failed to send SMS via Twilio Verify.";
                if (data.code === 21608) {
                    errorExplanation = `Twilio Trial restriction: Number ${cleanPhone} must be verified in Twilio Console (Verified Caller IDs).`;
                }
                return {
                    success: false,
                    provider: "twilio_verify",
                    providerErrorCode: data.code || "TWILIO_VERIFY_ERROR",
                    providerMessage: errorExplanation
                };
            }
        } catch (err) {
            console.error(`[SMS Service Exception] Twilio Verify exception:`, err.message);
            return {
                success: false,
                provider: "twilio_verify",
                providerErrorCode: "NETWORK_ERROR",
                providerMessage: `Could not connect to Twilio Verify: ${err.message}`
            };
        }
    }

    // =========================================================================
    // 3. FAST2SMS (Dedicated Indian SMS Gateway - OTP Route)
    // =========================================================================
    console.log('[SMS Service Check] Fast2SMS key exists in process.env:', Boolean(process.env.FAST2SMS_API_KEY && process.env.FAST2SMS_API_KEY.trim() !== ''));
    if (process.env.FAST2SMS_API_KEY && process.env.FAST2SMS_API_KEY.trim() !== "") {
        console.log('Attempting Fast2SMS with key length:', process.env.FAST2SMS_API_KEY.trim().length, 'and phone:', cleanPhone);
        try {
            if (!cleanPhone.startsWith("+91")) {
                return {
                    success: false,
                    provider: "fast2sms",
                    providerErrorCode: "UNSUPPORTED_COUNTRY",
                    providerMessage: "Fast2SMS only supports Indian mobile numbers (+91). For international numbers, configure Twilio in .env."
                };
            }

            const indianDigits = cleanPhone.replace("+91", "").replace(/\D/g, "");
            if (indianDigits.length !== 10) {
                return {
                    success: false,
                    provider: "fast2sms",
                    providerErrorCode: "INVALID_NUMBER",
                    providerMessage: "Fast2SMS requires a valid 10-digit Indian mobile number."
                };
            }

            console.log(`[SMS Service] Dispatching to Fast2SMS for number: ${indianDigits}...`);
            const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
                method: "POST",
                headers: {
                    authorization: process.env.FAST2SMS_API_KEY.trim(),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    variables_values: otp,
                    route: "otp",
                    numbers: indianDigits
                })
            });
            console.log('Fast2SMS HTTP status:', res.status);
            const rawResponseText = await res.clone().text();
            console.log('Fast2SMS raw response:', rawResponseText);

            const data = await res.json();

            if (data.return === true) {
                console.log(`[SMS Service] ✅ Fast2SMS dispatched SMS to ${maskedPhone} (Request ID: ${data.request_id})`);
                return { success: true, provider: "fast2sms", requestId: data.request_id };
            } else {
                console.error(`[SMS Service Error] Fast2SMS error response:`, JSON.stringify(data));
                const rawMsg = Array.isArray(data.message) ? data.message.join(", ") : (data.message || "");
                let errorExplanation = rawMsg || "Fast2SMS delivery failed.";

                if (rawMsg.toLowerCase().includes("balance") || rawMsg.toLowerCase().includes("credit")) {
                    errorExplanation = "Fast2SMS error: Insufficient wallet balance in your Fast2SMS account. Please check your wallet credits at fast2sms.com.";
                } else if (rawMsg.toLowerCase().includes("key") || rawMsg.toLowerCase().includes("auth") || rawMsg.toLowerCase().includes("user not found")) {
                    errorExplanation = "Fast2SMS error: Invalid or expired API Key. Please verify your FAST2SMS_API_KEY in .env.";
                }

                return {
                    success: false,
                    provider: "fast2sms",
                    providerErrorCode: "FAST2SMS_FAILED",
                    providerMessage: errorExplanation
                };
            }
        } catch (err) {
            console.error(`[SMS Service Exception] Fast2SMS exception:`, err.message);
            return {
                success: false,
                provider: "fast2sms",
                providerErrorCode: "NETWORK_ERROR",
                providerMessage: `Fast2SMS network exception: ${err.message}`
            };
        }
    }

    // =========================================================================
    // 4. 2FACTOR.IN (Dedicated Indian SMS Gateway - 99.9% Delivery)
    // =========================================================================
    if (process.env.TWOFACTOR_API_KEY && process.env.TWOFACTOR_API_KEY.trim() !== "") {
        try {
            const rawDigits = cleanPhone.replace("+91", "").replace(/\D/g, "");
            const url = `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY.trim()}/SMS/${rawDigits}/${otp}/Aryavarta`;

            const res = await fetch(url, { method: "GET" });
            const data = await res.json();

            if (data.Status === "Success") {
                console.log(`[SMS Service] ✅ 2Factor.in dispatched SMS to ${maskedPhone}`);
                return { success: true, provider: "2factor", sessionId: data.Details };
            } else {
                console.error(`[SMS Service Error] 2Factor.in:`, data.Details);
                return {
                    success: false,
                    provider: "2factor",
                    providerErrorCode: "TWOFACTOR_FAILED",
                    providerMessage: data.Details || "2Factor.in delivery failed."
                };
            }
        } catch (err) {
            console.error(`[SMS Service Exception] 2Factor exception:`, err.message);
            return {
                success: false,
                provider: "2factor",
                providerErrorCode: "NETWORK_ERROR",
                providerMessage: `2Factor exception: ${err.message}`
            };
        }
    }

    // =========================================================================
    // 5. MSG91 OTP API (Indian Telecom Route)
    // =========================================================================
    if (process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID) {
        try {
            const rawPhone = cleanPhone.replace("+", "");
            const url = `https://control.msg91.com/api/v5/otp?template_id=${process.env.MSG91_TEMPLATE_ID.trim()}&mobile=${rawPhone}&authkey=${process.env.MSG91_AUTH_KEY.trim()}&otp=${otp}`;

            const res = await fetch(url, { method: "POST" });
            const data = await res.json();

            if (data.type === "success") {
                console.log(`[SMS Service] ✅ MSG91 dispatched SMS to ${maskedPhone}`);
                return { success: true, provider: "msg91", messageId: data.message };
            } else {
                console.error(`[SMS Service Error] MSG91:`, data.message);
                return {
                    success: false,
                    provider: "msg91",
                    providerErrorCode: "MSG91_FAILED",
                    providerMessage: data.message || "MSG91 delivery failed."
                };
            }
        } catch (err) {
            console.error(`[SMS Service Exception] MSG91 exception:`, err.message);
            return {
                success: false,
                provider: "msg91",
                providerErrorCode: "NETWORK_ERROR",
                providerMessage: `MSG91 exception: ${err.message}`
            };
        }
    }

    // =========================================================================
    // 6. CUSTOM SMS WEBHOOK / GATEWAY URL
    // =========================================================================
    if (process.env.SMS_GATEWAY_URL && process.env.SMS_GATEWAY_URL.trim() !== "") {
        try {
            const messageBody = `Your Aryavarta verification code is ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;
            const res = await fetch(process.env.SMS_GATEWAY_URL.trim(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ to: cleanPhone, message: messageBody, otp })
            });

            if (res.ok) {
                console.log(`[SMS Service] ✅ Custom Gateway dispatched SMS to ${maskedPhone}`);
                return { success: true, provider: "custom_webhook" };
            } else {
                return {
                    success: false,
                    provider: "custom_webhook",
                    providerErrorCode: "WEBHOOK_FAILED",
                    providerMessage: `SMS Webhook returned HTTP ${res.status}`
                };
            }
        } catch (err) {
            console.error(`[SMS Service Exception] Custom Webhook:`, err.message);
            return {
                success: false,
                provider: "custom_webhook",
                providerErrorCode: "NETWORK_ERROR",
                providerMessage: `Custom Webhook exception: ${err.message}`
            };
        }
    }

    // =========================================================================
    // 7. DEV / SANDBOX MODE (Gated strictly to non-production environments)
    // =========================================================================
    if (process.env.NODE_ENV === "production") {
        console.error(`[SMS Service Error] No SMS provider configured in production for ${maskedPhone}`);
        return {
            success: false,
            provider: "none",
            providerErrorCode: "SMS_NOT_CONFIGURED",
            providerMessage: "SMS service is unavailable. Please configure SMS credentials in .env."
        };
    }

    // Terminal console logging ONLY (Never sent over HTTP/API to browser)
    console.log("\n============================================================");
    console.log("📲 [SMS DEV / SANDBOX MODE ACTIVE - SERVER TERMINAL ONLY]");
    console.log(`📱 Recipient Phone : ${cleanPhone}`);
    console.log(`🔑 6-Digit SMS OTP : >>> ${otp} <<< (Valid for 5 mins)`);
    if (process.env.ALLOW_DEV_MASTER_OTP === "true") {
        console.log("🛠️ Dev Master OTP   : 123456 (Enabled via ALLOW_DEV_MASTER_OTP=true)");
    } else {
        console.log("🔒 Master Bypass OTP: Disabled (Use the generated OTP above)");
    }
    console.log("ℹ️ Note: This code is NEVER exposed to the frontend/network API.");
    console.log("ℹ️ To send REAL SMS, add TWILIO or FAST2SMS credentials to .env");
    console.log("============================================================\n");

    return {
        success: true,
        isSandbox: true,
        provider: "sandbox",
        message: "Verification code sent. [Dev Mode: Check server terminal for OTP]"
    };
};

/**
 * Checks provider-managed verification (e.g. Twilio Verify)
 */
export const checkProviderVerification = async (phoneNumber, otp) => {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID) {
        try {
            const cleanPhone = normalizeToE164(phoneNumber);
            const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID.trim()}:${process.env.TWILIO_AUTH_TOKEN.trim()}`).toString("base64");
            const url = `https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SERVICE_SID.trim()}/VerificationCheck`;

            const params = new URLSearchParams({
                To: cleanPhone,
                Code: otp.trim()
            });

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params.toString()
            });
            const data = await res.json();

            if (res.ok && data.status === "approved" && data.valid === true) {
                return { isApproved: true };
            }
            return { isApproved: false, error: data.message || "Invalid verification code" };
        } catch (err) {
            return { isApproved: false, error: err.message };
        }
    }
    return { isApproved: null }; // Fallback to database hashed OTP
};

// Backward compatibility alias
export const sendSMS = sendRealSMSOTP;
