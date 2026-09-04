import express from "express";
import { sendMessage, getMessages, deleteConversation } from "./routControlers/messageroutControler.js";
import isLogin from "../middleware/isLogin.js";

const router = express.Router();

router.post("/send/:id", isLogin, sendMessage);
router.get("/:id", isLogin, getMessages);
router.delete("/:id", isLogin, deleteConversation);
router.delete("/conversation/:id", isLogin, deleteConversation);

export default router;