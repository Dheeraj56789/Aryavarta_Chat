import express from "express";
import isLogin from "../middleware/isLogin.js";
import {
    getMeetings,
    scheduleMeeting,
    startMeeting,
    endMeeting,
    joinMeeting,
    deleteMeeting
} from "./routControlers/meetingController.js";

const router = express.Router();

router.get("/", isLogin, getMeetings);
router.post("/schedule", isLogin, scheduleMeeting);
router.post("/start", isLogin, startMeeting);
router.post("/join", isLogin, joinMeeting);
router.post("/end", isLogin, endMeeting);
router.delete("/:id", isLogin, deleteMeeting);

export default router;
