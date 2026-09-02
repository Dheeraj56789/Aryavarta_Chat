import express from "express";
import {
    userRegister,
    userLogin,
    userLogOut,
    getMe
} from "./routControlers/userroutControler.js";
import isLogin from "../middleware/isLogin.js";

const router = express.Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/logout", userLogOut);
router.get("/me", isLogin, getMe);

export default router;