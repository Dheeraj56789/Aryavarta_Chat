import express from "express";
import isLogin from "../middleware/isLogin.js";
import { getCallLogs, logCall } from "./routControlers/callController.js";

const router = express.Router();

router.get("/", isLogin, getCallLogs);
router.post("/", isLogin, logCall);

export default router;
