import crypto from "crypto";
import bcryptjs from "bcryptjs";
import User from "../../Models/userModels.js";
import OtpVerification from "../../Models/otpVerificationModel.js";
import jwtToken from "../../utils/jwtwebToken.js";
import { sendRealSMSOTP, checkProviderVerification } from "../../utils/smsService.js";
import { sendEmailOTP as dispatchEmailOTP } from "../../utils/emailService.js";
import { validateEmailWithMxAndDisposable } from "../../utils/emailValidator.js";
import { emitForceLogout } from "../../socket/socket.js";

// Helper regex validators
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Helper: Normalize & validate phone numbers (E.164 standard)
export const validateRealPhoneNumber = (fullPhone) => {
    if (!fullPhone) return { isValid: false, message: "Mobile phone number is required" };

    const clean = fullPhone.trim().replace(/[\s\-()]/g, "");

    // 1. India (+91)
    if (clean.startsWith("+91")) {
        const digits = clean.slice(3);
        if (!/^[6-9]\d{9}$/.test(digits)) {
            return {
                isValid: false,
                message: "Please enter a valid real 10-digit Indian mobile number (must start with 6, 7, 8, or 9)"
            };
        }
        const isProd = process.env.NODE_ENV === "production";
        if (isProd && (/^(\d)\1{9}$/.test(digits) || digits === "1234567890")) {
            return {
                isValid: false,
                message: "Please enter your real personal mobile number, not a sample or dummy number"
            };
        }
        return { isValid: true, cleanPhone: `+91${digits}` };
    }

    // 2. USA / Canada (+1)
    if (clean.startsWith("+1")) {
        const digits = clean.slice(2);
        if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(digits)) {
            return {
                isValid: false,
                message: "Please enter a valid 10-digit US/Canada mobile number"
            };
        }
        return { isValid: true, cleanPhone: `+1${digits}` };
    }

    // 3. United Kingdom (+44)
    if (clean.startsWith("+44")) {
        const digits = clean.slice(3);
        if (!/^7\d{9}$/.test(digits)) {
            return {
                isValid: false,
                message: "Please enter a valid 10-digit UK mobile number starting with 7"
            };
        }
        return { isValid: true, cleanPhone: `+44${digits}` };
    }

    // 4. UAE (+971)
    if (clean.startsWith("+971")) {
        const digits = clean.slice(4);
        if (!/^5\d{8}$/.test(digits)) {
            return {
                isValid: false,
                message: "Please enter a valid 9-digit UAE mobile number starting with 5"
            };
        }
        return { isValid: true, cleanPhone: `+971${digits}` };
    }

    // Generic international format (E.164)
    if (!/^\+[1-9]\d{9,14}$/.test(clean)) {
        return {
            isValid: false,
            message: "Please enter a valid international mobile number with country code"
        };
    }

    return { isValid: true, cleanPhone: clean };
};

// Generate cryptographically secure 6-digit numeric OTP
const generateSecureOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

// =========================================================================
// 1. PHONE OTP ENDPOINTS
// =========================================================================

// POST /api/auth/phone/send-otp
export const sendPhoneOTP = async (req, res) => {
    try {
        const { phone, purpose = "signup" } = req.body;

        const phoneValidation = validateRealPhoneNumber(phone);
        if (!phoneValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: phoneValidation.message
            });
        }
        const cleanPhone = phoneValidation.cleanPhone;

        // Check if phone number is already registered
        const existingUser = await User.findOne({ phone: cleanPhone });

        if (purpose === "signup" && existingUser) {
            return res.status(400).json({
                success: false,
                isExistingUser: true,
                message: "This phone number is already registered. Please log in."
            });
        }

        if (purpose === "login" && !existingUser) {
            return res.status(404).json({
                success: false,
                isNewUser: true,
                message: "No account found with this phone number. Please create an account."
            });
        }

        // Check 59s Resend & 10-minute Window Rate-Limiting
        const recentOtp = await OtpVerification.findOne({
            destination: cleanPhone,
            purpose
        });

        const TEN_MINUTES = 10 * 60 * 1000;
        let requestCount = 1;
        let windowStart = new Date();

        if (recentOtp) {
            if (recentOtp.last_sent_at) {
                const timeSinceLast = Date.now() - new Date(recentOtp.last_sent_at).getTime();
                if (timeSinceLast < 59 * 1000) {
                    const remaining = Math.ceil((59000 - timeSinceLast) / 1000);
                    return res.status(429).json({
                        success: false,
                        message: `Please wait ${remaining} seconds before requesting a new OTP.`
                    });
                }
            }

            // Check max 3 OTP sends per phone number per 10 minutes
            const currentWindowStart = recentOtp.window_start ? new Date(recentOtp.window_start).getTime() : new Date(recentOtp.createdAt || Date.now()).getTime();
            const windowAge = Date.now() - currentWindowStart;

            if (windowAge < TEN_MINUTES) {
                if ((recentOtp.request_count || 1) >= 3) {
                    const waitMinutes = Math.ceil((TEN_MINUTES - windowAge) / 60000);
                    return res.status(429).json({
                        success: false,
                        message: `Too many OTP requests for this phone number. Please wait ${waitMinutes} minute(s) before requesting again.`
                    });
                }
                requestCount = (recentOtp.request_count || 1) + 1;
                windowStart = new Date(currentWindowStart);
            } else {
                requestCount = 1;
                windowStart = new Date();
            }
        }

        // Generate and Hash OTP
        const otp = generateSecureOTP();
        const otp_hash = await bcryptjs.hash(otp, 10);
        const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Upsert OTP record
        await OtpVerification.findOneAndUpdate(
            { destination: cleanPhone, purpose },
            {
                destination: cleanPhone,
                destination_type: "PHONE",
                otp_hash,
                purpose,
                attempts: 0,
                request_count: requestCount,
                window_start: windowStart,
                last_sent_at: new Date(),
                expires_at,
                verified_at: null,
                verification_token: null
            },
            { upsert: true, returnDocument: "after" }
        );

        // Dispatch real SMS via configured provider (Zero plain OTP exposed)
        const smsResult = await sendRealSMSOTP(cleanPhone, otp);

        if (!smsResult.success) {
            return res.status(400).json({
                success: false,
                message: smsResult.providerMessage || "Failed to deliver SMS to your phone number.",
                providerErrorCode: smsResult.providerErrorCode || "SMS_DELIVERY_FAILED",
                providerMessage: smsResult.providerMessage
            });
        }

        return res.status(200).json({
            success: true,
            isSandbox: smsResult.isSandbox || false,
            provider: smsResult.provider,
            message: smsResult.isSandbox
                ? smsResult.message
                : "Verification code sent via SMS to your mobile phone number."
        });
    } catch (error) {
        console.error("Error in sendPhoneOTP:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error dispatching SMS verification code",
            providerErrorCode: "SERVER_ERROR"
        });
    }
};

// POST /api/auth/phone/verify-otp
export const verifyPhoneOTP = async (req, res) => {
    try {
        const { phone, otp, purpose = "signup" } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                message: "Phone number and 6-digit OTP are required"
            });
        }

        const phoneValidation = validateRealPhoneNumber(phone);
        if (!phoneValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: phoneValidation.message
            });
        }
        const cleanPhone = phoneValidation.cleanPhone;

        const record = await OtpVerification.findOne({
            destination: cleanPhone,
            purpose,
            destination_type: "PHONE"
        });

        if (!record || Date.now() > new Date(record.expires_at).getTime()) {
            return res.status(400).json({
                success: false,
                message: "OTP code has expired. Please request a new verification code."
            });
        }

        // Check failed attempts limit (max 5 tries)
        if (record.attempts >= 5) {
            await OtpVerification.deleteOne({ _id: record._id });
            return res.status(400).json({
                success: false,
                message: "Maximum OTP attempts exceeded (5/5). This code has been invalidated. Please request a new verification code."
            });
        }

        // 1. Check provider-managed verification (e.g. Twilio Verify)
        const providerCheck = await checkProviderVerification(cleanPhone, otp);
        if (providerCheck.isApproved === false) {
            return res.status(400).json({
                success: false,
                message: providerCheck.error || "Invalid OTP verification code"
            });
        }

        // 2. If not provider-managed, verify against database hashed OTP
        if (providerCheck.isApproved === null) {
            const isBcryptMatch = await bcryptjs.compare(otp.trim(), record.otp_hash);
            const isDevMasterMatch =
                process.env.NODE_ENV === "development" &&
                process.env.ALLOW_DEV_MASTER_OTP === "true" &&
                otp.trim() === "123456";
            const isMatch = isBcryptMatch || isDevMasterMatch;

            if (!isMatch) {
                record.attempts += 1;
                await record.save();
                const remaining = 5 - record.attempts;
                if (remaining <= 0) {
                    await OtpVerification.deleteOne({ _id: record._id });
                    return res.status(400).json({
                        success: false,
                        message: "Maximum verification attempts exceeded (5/5). This code has been invalidated. Please request a new OTP code."
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: `Incorrect verification code. ${remaining} attempt(s) remaining.`
                });
            }
        }

        // Generate secure one-time verification token
        const verification_token = crypto.randomBytes(32).toString("hex");
        record.verified_at = new Date();
        record.verification_token = verification_token;
        await record.save();

        return res.status(200).json({
            success: true,
            phone_token: verification_token,
            message: "Phone number verified successfully! ✅"
        });
    } catch (error) {
        console.error("Error in verifyPhoneOTP:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error during phone verification"
        });
    }
};

// =========================================================================
// 2. EMAIL OTP ENDPOINTS
// =========================================================================

// POST /api/auth/email/send-otp
export const sendEmailOTP = async (req, res) => {
    try {
        const { email, purpose = "signup" } = req.body;

        // 1. Strict Validation: Syntax, Disposable Domain Blocking, and DNS MX Resolution
        const emailValidation = await validateEmailWithMxAndDisposable(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: emailValidation.message
            });
        }
        const cleanEmail = emailValidation.cleanEmail;

        // 2. Pre-flight Check: Prevent fake / duplicate accounts (1 Email = 1 Account)
        const existingUser = await User.findOne({ email: cleanEmail });

        if (purpose === "signup" && existingUser) {
            return res.status(400).json({
                success: false,
                isExistingUser: true,
                message: "This email address is already registered. Please log in instead."
            });
        }

        if (purpose === "login" && !existingUser) {
            return res.status(404).json({
                success: false,
                isNewUser: true,
                message: "No account found with this email address. Please create an account."
            });
        }

        // 3. Multi-Tier Rate Limiting: 59-Second Cooldown + 10-Minute Sliding Window (Max 3 sends)
        const recentOtp = await OtpVerification.findOne({
            destination: cleanEmail,
            purpose
        });

        const TEN_MINUTES = 10 * 60 * 1000;
        let requestCount = 1;
        let windowStart = new Date();

        if (recentOtp) {
            if (recentOtp.last_sent_at) {
                const timeSinceLast = Date.now() - new Date(recentOtp.last_sent_at).getTime();
                if (timeSinceLast < 59 * 1000) {
                    const remaining = Math.ceil((59000 - timeSinceLast) / 1000);
                    return res.status(429).json({
                        success: false,
                        message: `Please wait ${remaining} seconds before requesting a new OTP.`
                    });
                }
            }

            const currentWindowStart = recentOtp.window_start ? new Date(recentOtp.window_start).getTime() : new Date(recentOtp.createdAt || Date.now()).getTime();
            const windowAge = Date.now() - currentWindowStart;

            if (windowAge < TEN_MINUTES) {
                if ((recentOtp.request_count || 1) >= 3) {
                    const waitMinutes = Math.ceil((TEN_MINUTES - windowAge) / 60000);
                    return res.status(429).json({
                        success: false,
                        message: `Too many OTP requests for this email. Please wait ${waitMinutes} minute(s) before requesting again.`
                    });
                }
                requestCount = (recentOtp.request_count || 1) + 1;
                windowStart = new Date(currentWindowStart);
            } else {
                requestCount = 1;
                windowStart = new Date();
            }
        }

        // 4. Generate and Hash OTP (5-minute TTL)
        const otp = generateSecureOTP();
        const otp_hash = await bcryptjs.hash(otp, 10);
        const expires_at = new Date(Date.now() + 5 * 60 * 1000);

        await OtpVerification.findOneAndUpdate(
            { destination: cleanEmail, purpose },
            {
                destination: cleanEmail,
                destination_type: "EMAIL",
                otp_hash,
                purpose,
                attempts: 0,
                request_count: requestCount,
                window_start: windowStart,
                last_sent_at: new Date(),
                expires_at,
                verified_at: null,
                verification_token: null
            },
            { upsert: true, returnDocument: "after" }
        );

        // 5. Dispatch Email via Resend or Dev Sandbox
        const dispatchResult = await dispatchEmailOTP(cleanEmail, otp);

        if (!dispatchResult.success) {
            return res.status(400).json({
                success: false,
                message: dispatchResult.error || "Failed to send email verification code."
            });
        }

        return res.status(200).json({
            success: true,
            isSandbox: dispatchResult.isSandbox || false,
            message: dispatchResult.isSandbox
                ? dispatchResult.message
                : "Verification code sent to your email address."
        });
    } catch (error) {
        console.error("Error in sendEmailOTP:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to send email verification code. Please try again."
        });
    }
};

// POST /api/auth/email/verify-otp
export const verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp, purpose = "signup" } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email address and 6-digit OTP are required"
            });
        }
        const cleanEmail = email.trim().toLowerCase();

        const record = await OtpVerification.findOne({
            destination: cleanEmail,
            purpose,
            destination_type: "EMAIL"
        });

        if (!record) {
            return res.status(400).json({
                success: false,
                message: "No verification code requested for this email or it has expired. Please request a new code."
            });
        }

        // Check 5-minute TTL
        if (Date.now() > new Date(record.expires_at).getTime()) {
            await OtpVerification.deleteOne({ _id: record._id });
            return res.status(400).json({
                success: false,
                message: "Verification code has expired (5-minute limit). Please request a fresh OTP."
            });
        }

        // Check Max Attempt Limit (5 tries)
        if (record.attempts >= 5) {
            await OtpVerification.deleteOne({ _id: record._id });
            return res.status(400).json({
                success: false,
                message: "Maximum verification attempts exceeded (5/5). This code has been invalidated. Please request a new OTP code."
            });
        }

        // Master bypass gated to explicit dev environment
        const allowMasterBypass = process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_MASTER_OTP === "true";
        const isMasterBypass = allowMasterBypass && otp.trim() === "123456";

        let isMatch = false;
        if (isMasterBypass) {
            isMatch = true;
            console.log(`[Email Auth Security] ⚠️ Master OTP bypass used for email: ${cleanEmail}`);
        } else if (record.otp_hash) {
            isMatch = await bcryptjs.compare(otp.trim(), record.otp_hash);
        }

        if (!isMatch) {
            record.attempts += 1;
            await record.save();
            const remaining = 5 - record.attempts;
            if (remaining <= 0) {
                await OtpVerification.deleteOne({ _id: record._id });
                return res.status(400).json({
                    success: false,
                    message: "Maximum verification attempts exceeded (5/5). This code has been invalidated. Please request a new OTP code."
                });
            }
            return res.status(400).json({
                success: false,
                message: `Incorrect verification code. ${remaining} attempt(s) remaining.`
            });
        }

        // Generate secure one-time verification token
        const verification_token = crypto.randomBytes(32).toString("hex");
        record.verified_at = new Date();
        record.verification_token = verification_token;
        await record.save();

        return res.status(200).json({
            success: true,
            email_token: verification_token,
            message: "Email address verified successfully! ✅"
        });
    } catch (error) {
        console.error("Error in verifyEmailOTP:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error during email verification"
        });
    }
};

// =========================================================================
// 3. COMPLETE REGISTRATION (AFTER BOTH PHONE & EMAIL VERIFIED)
// =========================================================================

// POST /api/auth/register
export const registerUser = async (req, res) => {
    try {
        const {
            fullname,
            phone,
            phone_token,
            email,
            email_token,
            gender = "male",
            country = "India",
            state = "",
            district = "",
            pincode = "",
            about = "",
            profilepic = ""
        } = req.body;

        if (!fullname) {
            return res.status(400).json({
                success: false,
                message: "Full Name is required"
            });
        }

        // 1. Email Verification Check (Primary Requirement: 1 Email = 1 Account)
        let cleanEmail = email ? email.trim().toLowerCase() : null;
        if (!cleanEmail) {
            return res.status(400).json({
                success: false,
                message: "Email address is required"
            });
        }

        const emailValidation = await validateEmailWithMxAndDisposable(cleanEmail);
        if (!emailValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: emailValidation.message
            });
        }

        if (!email_token && !phone_token) {
            return res.status(400).json({
                success: false,
                message: "Please complete Email verification code (OTP) first"
            });
        }

        const FIFTEEN_MINUTES = 15 * 60 * 1000;

        if (email_token) {
            const emailVerification = await OtpVerification.findOne({
                destination: cleanEmail,
                verification_token: email_token,
                destination_type: "EMAIL"
            });
            if (
                !emailVerification ||
                !emailVerification.verified_at ||
                Date.now() - new Date(emailVerification.verified_at).getTime() > FIFTEEN_MINUTES
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Email verification session expired or invalid. Please request a fresh OTP."
                });
            }
        }

        // Pre-flight uniqueness check on Email
        const duplicateEmail = await User.findOne({ email: cleanEmail });
        if (duplicateEmail) {
            return res.status(400).json({
                success: false,
                message: "This email address is already registered. Please log in instead."
            });
        }

        // 2. Optional Phone Handling (if provided)
        let cleanPhone = null;
        if (phone && phone.trim()) {
            const phoneValidation = validateRealPhoneNumber(phone);
            if (!phoneValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: phoneValidation.message
                });
            }
            cleanPhone = phoneValidation.cleanPhone;
            const duplicatePhone = await User.findOne({ phone: cleanPhone });
            if (duplicatePhone) {
                return res.status(400).json({
                    success: false,
                    message: "This phone number is already linked to another account."
                });
            }
        }

        // Generate unique username
        let baseUsername = fullname.trim().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12);
        if (baseUsername.length < 3) baseUsername = "user";
        let uniqueUsername = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;

        let existingUser = await User.findOne({ username: uniqueUsername });
        while (existingUser) {
            uniqueUsername = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
            existingUser = await User.findOne({ username: uniqueUsername });
        }

        let defaultAvatar = profilepic;
        if (!defaultAvatar) {
            defaultAvatar = `https://avatar.iran.liara.run/public/${gender === "female" ? "girl" : "boy"}?username=${encodeURIComponent(uniqueUsername)}`;
        }

        const newUser = new User({
            fullname: fullname.trim(),
            username: uniqueUsername,
            email: cleanEmail,
            email_verified: !!email_token,
            phone: cleanPhone || undefined, // undefined prevents unique index conflicts on sparse field
            phone_verified: !!phone_token,
            gender,
            country: country ? country.trim() : "India",
            state: state ? state.trim() : "",
            district: district ? district.trim() : "",
            pincode: pincode ? pincode.trim() : "",
            about: about ? about.trim() : "Available | Using Aryavarta 🚀",
            profilepic: defaultAvatar
        });

        // 🔒 Generate unique sessionId for single session enforcement
        const newSessionId = crypto.randomUUID();
        newUser.currentSessionId = newSessionId;
        await newUser.save();

        console.log(`[SingleSession Backend] Step 1: registerUser created user: ${newUser._id.toString()}`);
        console.log(`[SingleSession Backend] Step 2: Generated new sessionId: ${newSessionId}`);
        console.log(`[SingleSession Backend] Step 3: Saved new sessionId to MongoDB for user ${newUser._id.toString()}`);
        emitForceLogout(newUser._id.toString(), "Your account was logged in from another location.");

        // Invalidate OTP tokens to ensure single use
        const destinationsToClean = [cleanEmail];
        if (cleanPhone) destinationsToClean.push(cleanPhone);
        await OtpVerification.deleteMany({
            destination: { $in: destinationsToClean }
        });

        const token = jwtToken(newUser._id, res, newSessionId);

        return res.status(201).json({
            success: true,
            user: {
                _id: newUser._id,
                fullname: newUser.fullname,
                username: newUser.username,
                email: newUser.email,
                email_verified: newUser.email_verified,
                phone: newUser.phone,
                phone_verified: newUser.phone_verified,
                gender: newUser.gender,
                country: newUser.country,
                state: newUser.state,
                district: newUser.district,
                pincode: newUser.pincode,
                profilepic: newUser.profilepic,
                about: newUser.about,
                currentSessionId: newSessionId
            },
            token,
            sessionId: newSessionId,
            message: "Account created and verified successfully! Welcome to Aryavarta 🚀"
        });
    } catch (error) {
        console.error("Error in registerUser:", error.message);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || "field";
            if (field === "phone") {
                return res.status(400).json({
                    success: false,
                    message: "This phone number is already linked to another account."
                });
            }
            return res.status(400).json({
                success: false,
                message: `This ${field} is already registered. Please log in.`
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error during registration"
        });
    }
};

// =========================================================================
// 4. LOGIN FLOW (PHONE OR EMAIL + OTP)
// =========================================================================

// POST /api/auth/login/send-otp
export const sendLoginOTP = async (req, res) => {
    try {
        const { identifier } = req.body; // Can be phone or email

        if (!identifier) {
            return res.status(400).json({
                success: false,
                message: "Please enter your registered Phone Number or Email Address"
            });
        }

        const isEmail = identifier.includes("@");
        let cleanKey = "";
        let destination_type = "PHONE";

        if (isEmail) {
            cleanKey = identifier.trim().toLowerCase();
            destination_type = "EMAIL";
            if (!EMAIL_REGEX.test(cleanKey)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid email address"
                });
            }
        } else {
            const phoneValidation = validateRealPhoneNumber(identifier);
            if (!phoneValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: phoneValidation.message
                });
            }
            cleanKey = phoneValidation.cleanPhone;
            destination_type = "PHONE";
        }

        // Check if user exists
        const user = await User.findOne({
            $or: [{ phone: cleanKey }, { email: cleanKey }]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                isNewUser: true,
                message: `No account found with this ${destination_type === "PHONE" ? "phone number" : "email"}. Please create an account.`
            });
        }

        // Check 59s Resend & 10-Minute Window Rate-Limiting
        const recentOtp = await OtpVerification.findOne({
            destination: cleanKey,
            purpose: "login"
        });

        const TEN_MINUTES = 10 * 60 * 1000;
        let requestCount = 1;
        let windowStart = new Date();

        if (recentOtp) {
            if (recentOtp.last_sent_at) {
                const timeSinceLast = Date.now() - new Date(recentOtp.last_sent_at).getTime();
                if (timeSinceLast < 59 * 1000) {
                    const remaining = Math.ceil((59000 - timeSinceLast) / 1000);
                    return res.status(429).json({
                        success: false,
                        message: `Please wait ${remaining} seconds before requesting a new OTP.`
                    });
                }
            }

            const currentWindowStart = recentOtp.window_start ? new Date(recentOtp.window_start).getTime() : new Date(recentOtp.createdAt || Date.now()).getTime();
            const windowAge = Date.now() - currentWindowStart;

            if (windowAge < TEN_MINUTES) {
                if ((recentOtp.request_count || 1) >= 3) {
                    const waitMinutes = Math.ceil((TEN_MINUTES - windowAge) / 60000);
                    return res.status(429).json({
                        success: false,
                        message: `Too many login OTP requests for this ${destination_type === "PHONE" ? "phone number" : "email"}. Please wait ${waitMinutes} minute(s) before trying again.`
                    });
                }
                requestCount = (recentOtp.request_count || 1) + 1;
                windowStart = new Date(currentWindowStart);
            } else {
                requestCount = 1;
                windowStart = new Date();
            }
        }

        const otp = generateSecureOTP();
        const otp_hash = await bcryptjs.hash(otp, 10);
        const expires_at = new Date(Date.now() + 5 * 60 * 1000);

        await OtpVerification.findOneAndUpdate(
            { destination: cleanKey, purpose: "login" },
            {
                destination: cleanKey,
                destination_type,
                otp_hash,
                purpose: "login",
                attempts: 0,
                request_count: requestCount,
                window_start: windowStart,
                last_sent_at: new Date(),
                expires_at,
                verified_at: null,
                verification_token: null
            },
            { upsert: true, returnDocument: "after" }
        );

        if (destination_type === "PHONE") {
            const smsResult = await sendRealSMSOTP(cleanKey, otp);
            if (!smsResult.success) {
                return res.status(400).json({
                    success: false,
                    message: smsResult.providerMessage || "Failed to deliver SMS to your phone number.",
                    providerErrorCode: smsResult.providerErrorCode
                });
            }
        } else {
            const emailResult = await dispatchEmailOTP(cleanKey, otp);
            if (!emailResult.success) {
                return res.status(400).json({
                    success: false,
                    message: emailResult.error || "Failed to deliver verification email.",
                    providerErrorCode: "EMAIL_DELIVERY_FAILED"
                });
            }
        }

        return res.status(200).json({
            success: true,
            isSandbox: destination_type === "PHONE" ? (smsResult.isSandbox || false) : false,
            destination_type,
            message: destination_type === "PHONE" && smsResult.isSandbox
                ? smsResult.message
                : `Verification code sent via ${destination_type === "PHONE" ? "SMS" : "Email"}.`
        });
    } catch (error) {
        console.error("Error in sendLoginOTP:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to send login verification code"
        });
    }
};

// POST /api/auth/login/verify-otp
export const verifyLoginOTP = async (req, res) => {
    try {
        const { identifier, otp } = req.body;

        if (!identifier || !otp) {
            return res.status(400).json({
                success: false,
                message: "Identifier and 6-digit OTP are required"
            });
        }

        const isEmail = identifier.includes("@");
        let cleanKey = isEmail ? identifier.trim().toLowerCase() : "";

        if (!isEmail) {
            const phoneValidation = validateRealPhoneNumber(identifier);
            if (!phoneValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: phoneValidation.message
                });
            }
            cleanKey = phoneValidation.cleanPhone;
        }

        const record = await OtpVerification.findOne({
            destination: cleanKey,
            purpose: "login"
        });

        if (!record || Date.now() > new Date(record.expires_at).getTime()) {
            return res.status(400).json({
                success: false,
                message: "OTP code has expired. Please request a new verification code."
            });
        }

        if (record.attempts >= 5) {
            await OtpVerification.deleteOne({ _id: record._id });
            return res.status(400).json({
                success: false,
                message: "Maximum verification attempts exceeded (5/5). Please request a new code."
            });
        }

        const isBcryptMatch = await bcryptjs.compare(otp.trim(), record.otp_hash);
        const isDevMasterMatch =
            process.env.NODE_ENV === "development" &&
            process.env.ALLOW_DEV_MASTER_OTP === "true" &&
            otp.trim() === "123456";
        const isMatch = isBcryptMatch || isDevMasterMatch;

        if (!isMatch) {
            record.attempts += 1;
            await record.save();
            const remaining = 5 - record.attempts;
            if (remaining <= 0) {
                await OtpVerification.deleteOne({ _id: record._id });
                return res.status(400).json({
                    success: false,
                    message: "Too many incorrect attempts (5/5). Please request a new OTP code."
                });
            }
            return res.status(400).json({
                success: false,
                message: `Incorrect verification code. ${remaining} attempt(s) remaining.`
            });
        }

        const user = await User.findOne({
            $or: [{ phone: cleanKey }, { email: cleanKey }]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                isNewUser: true,
                message: "No existing account found. Please create an account."
            });
        }

        // Clean up OTP
        await OtpVerification.deleteOne({ _id: record._id });

        // =========================================================================
        // 🔒 SINGLE SESSION ENFORCEMENT
        // Step 1: User verified
        // Step 2: Generate new unique session ID
        // Step 3: Overwrite currentSessionId in MongoDB
        // Step 4: Emit force-logout to terminate any existing socket session elsewhere
        // Step 5: Issue new JWT embedding new sessionId
        // =========================================================================
        const newSessionId = crypto.randomUUID();
        user.currentSessionId = newSessionId;
        await user.save();

        console.log(`[SingleSession Backend] Step 1: Login verified for user: ${user._id.toString()} (${user.email || user.phone})`);
        console.log(`[SingleSession Backend] Step 2: Generated new sessionId: ${newSessionId}`);
        console.log(`[SingleSession Backend] Step 3: Saved new sessionId ${newSessionId} to MongoDB for user ${user._id.toString()}`);
        console.log(`[SingleSession Backend] Step 4: Emitting force-logout to terminate older active sessions...`);
        emitForceLogout(user._id.toString(), "Your account was logged in from another location.");

        console.log(`[SingleSession Backend] Step 5: Issuing JWT with new sessionId: ${newSessionId}`);
        const token = jwtToken(user._id, res, newSessionId);

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                email_verified: user.email_verified,
                phone: user.phone,
                phone_verified: user.phone_verified,
                gender: user.gender,
                country: user.country,
                state: user.state,
                district: user.district,
                pincode: user.pincode,
                profilepic: user.profilepic,
                about: user.about,
                currentSessionId: newSessionId
            },
            token,
            sessionId: newSessionId,
            message: "Logged in successfully! ✨"
        });
    } catch (error) {
        console.error("Error in verifyLoginOTP:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error during login verification"
        });
    }
};

// =========================================================================
// 5. SESSION & PROFILE MANAGEMENT
// =========================================================================

export const getMe = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        console.error("Error in getMe controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error fetching user data"
        });
    }
};

export const userLogOut = async (req, res) => {
    try {
        if (req.user && req.user._id) {
            await User.findByIdAndUpdate(req.user._id, { $set: { currentSessionId: null } });
        }

        res.cookie("jwt", "", {
            maxAge: 0,
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production"
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Error in userLogOut controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error during logout"
        });
    }
};

// Legacy alias handlers for backwards compatibility
export const sendOTP = sendLoginOTP;
export const verifyOTPLogin = verifyLoginOTP;
export const signupVerified = registerUser;
export const userRegister = registerUser;
export const userLogin = verifyLoginOTP;