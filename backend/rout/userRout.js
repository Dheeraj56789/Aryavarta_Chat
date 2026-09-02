import express from "express";
import isLogin from "../middleware/isLogin.js";
import {
    getUserBySearch,
    getCurrentChatters,
    getAllUsers,
    updateAIPreferences
} from "./routControlers/userhandlerControler.js";

const router = express.Router();

router.get("/search", isLogin, getUserBySearch);
router.get("/currentchatters", isLogin, getCurrentChatters);
router.get("/all", isLogin, getAllUsers);
router.put("/ai-preferences", isLogin, updateAIPreferences);

export default router;