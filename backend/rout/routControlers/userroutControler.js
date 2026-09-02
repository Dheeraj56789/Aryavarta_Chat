import User from "../../Models/userModels.js";
import bcryptjs from "bcryptjs";
import jwtToken from "../../utils/jwtwebToken.js";

// Helper regex validators
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?[0-9]{10,15}$/; // Standard 10 to 15 digit mobile number with optional + country code
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export const userRegister = async (req, res) => {
    try {
        const { fullname, username, email, phone, gender, password, profilepic } = req.body;

        // 1. Check all required fields
        if (!fullname || !username || !email || !phone || !gender || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields (Full Name, Username, Email, Phone Number, Gender, Password) are required"
            });
        }

        const cleanUsername = username.trim().toLowerCase();
        const cleanEmail = email.trim().toLowerCase();
        const cleanPhone = phone.trim().replace(/[\s-]/g, ""); // Remove spaces and dashes

        // 2. Validate Username format
        if (!USERNAME_REGEX.test(cleanUsername)) {
            return res.status(400).json({
                success: false,
                message: "Username must be 3-20 characters long and contain only letters, numbers, or underscores (no spaces/symbols)"
            });
        }

        // 3. Validate Email format (reject invalid/fake formats)
        if (!EMAIL_REGEX.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid, real email address (e.g. name@domain.com)"
            });
        }

        // 4. Validate Phone number format (must be 10-15 digits, reject fake/short numbers)
        if (!PHONE_REGEX.test(cleanPhone) || cleanPhone.replace(/\D/g, "").length < 10) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid 10-digit mobile number with country code (e.g. +91 9876543210)"
            });
        }

        // 5. Validate Password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // 6. Check uniqueness of Username, Email, and Phone Number individually to provide exact error feedback
        const existingUsername = await User.findOne({ username: cleanUsername });
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: "This username is already taken. Please choose a different username."
            });
        }

        const existingEmail = await User.findOne({ email: cleanEmail });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "This email address is already registered. Please log in or use a different email."
            });
        }

        const existingPhone = await User.findOne({ phone: cleanPhone });
        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: "This phone number is already registered. Only unique, real phone numbers can create an account."
            });
        }

        // Hash password securely
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Assign default avatar
        let defaultAvatar = profilepic;
        if (!defaultAvatar) {
            if (gender === "male") {
                defaultAvatar = `https://avatar.iran.liara.run/public/boy?username=${encodeURIComponent(cleanUsername)}`;
            } else if (gender === "female") {
                defaultAvatar = `https://avatar.iran.liara.run/public/girl?username=${encodeURIComponent(cleanUsername)}`;
            } else {
                defaultAvatar = `https://avatar.iran.liara.run/public?username=${encodeURIComponent(cleanUsername)}`;
            }
        }

        const newUser = new User({
            fullname: fullname.trim(),
            username: cleanUsername,
            email: cleanEmail,
            phone: cleanPhone,
            password: hashedPassword,
            gender,
            profilepic: defaultAvatar
        });

        await newUser.save();
        const token = jwtToken(newUser._id, res);

        return res.status(201).json({
            success: true,
            user: {
                _id: newUser._id,
                fullname: newUser.fullname,
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone,
                gender: newUser.gender,
                profilepic: newUser.profilepic
            },
            token
        });
    } catch (error) {
        console.error("Error in userRegister controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error during registration"
        });
    }
};

export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter your Email, Username, or Phone Number and Password"
            });
        }

        const cleanIdentifier = email.trim().toLowerCase();
        const cleanPhone = email.trim().replace(/[\s-]/g, "");

        // Find user by email, username, OR phone number
        const user = await User.findOne({
            $or: [
                { email: cleanIdentifier },
                { username: cleanIdentifier },
                { phone: cleanPhone },
                { phone: cleanIdentifier }
            ]
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials. User not found with this email/username/phone."
            });
        }

        const isPasswordMatch = await bcryptjs.compare(password, user.password || "");
        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password. Please try again."
            });
        }

        const token = jwtToken(user._id, res);

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                profilepic: user.profilepic
            },
            token,
            message: "Logged in successfully"
        });
    } catch (error) {
        console.error("Error in userLogin controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error during login"
        });
    }
};

export const userLogOut = (req, res) => {
    try {
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