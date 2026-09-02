import express from "express";
import {
    sendPhoneOTP,
    verifyPhoneOTP,
    sendEmailOTP,
    verifyEmailOTP,
    registerUser,
    sendLoginOTP,
    verifyLoginOTP,
    getMe,
    userLogOut,
    // Legacy forwards
    sendOTP,
    verifyOTPLogin,
    signupVerified,
    userLogin,
    userRegister
} from "./routControlers/userroutControler.js";
import isLogin from "../middleware/isLogin.js";

const router = express.Router();

// 1. Phone OTP Verification Endpoints
router.post("/phone/send-otp", sendPhoneOTP);
router.post("/phone/verify-otp", verifyPhoneOTP);

// 2. Email OTP Verification Endpoints
router.post("/email/send-otp", sendEmailOTP);
router.post("/email/verify-otp", verifyEmailOTP);

// 3. User Registration (after both Phone & Email are verified)
router.post("/register", registerUser);

// 4. Dual Login (Phone or Email + OTP)
router.post("/login/send-otp", sendLoginOTP);
router.post("/login/verify-otp", verifyLoginOTP);

// 5. Session & Profile
router.get("/me", isLogin, getMe);
router.post("/logout", userLogOut);

// Backwards compatibility routes
router.post("/send-otp", sendOTP);
router.post("/verify-otp-login", verifyOTPLogin);
router.post("/signup-verified", signupVerified);
router.post("/login", userLogin);

export default router;