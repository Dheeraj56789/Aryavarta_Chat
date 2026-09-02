import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
            trim: true
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            minlength: 3
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please enter a valid email address"]
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        gender: {
            type: String,
            required: true,
            enum: ["male", "female", "other"]
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        profilepic: {
            type: String,
            default: ""
        },
        about: {
            type: String,
            default: "Available | Using Aryavarta 🚀"
        }
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;