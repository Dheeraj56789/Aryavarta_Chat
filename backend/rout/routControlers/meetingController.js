import Meeting from "../../Models/meetingModel.js";

// Helper: Calculate readable duration string
const calculateDurationString = (startedAt, endedAt) => {
    if (!startedAt || !endedAt) return "0 mins";
    const diffMs = Math.max(0, new Date(endedAt).getTime() - new Date(startedAt).getTime());
    const totalMinutes = Math.floor(diffMs / 60000);
    const totalSeconds = Math.floor((diffMs % 60000) / 1000);

    if (totalMinutes < 1) {
        return `${totalSeconds} secs`;
    } else if (totalMinutes < 60) {
        return `${totalMinutes} min${totalMinutes > 1 ? "s" : ""}`;
    } else {
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return `${hours}h ${mins}m`;
    }
};

// Helper: Generate unique, collision-resistant meeting code with DB verification retry loop
export const generateUniqueMeetingCode = async (maxRetries = 5) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        // 6-character random alphanumeric code e.g. "ary-meet-k8x2q9"
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const code = `ary-meet-${randomSuffix}`;
        const existing = await Meeting.findOne({ code });
        if (!existing) {
            return code;
        }
        console.warn(`Meeting code collision on attempt ${attempt}: ${code}, retrying...`);
    }
    // Fallback: timestamp-based guaranteed unique code
    return `ary-meet-${Date.now().toString(36)}`;
};

// GET /api/meeting - Get upcoming and previous meetings for current user
export const getMeetings = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // Fetch meetings where user is either the host or in participants
        const allMeetings = await Meeting.find({
            $or: [
                { host: currentUserId },
                { "participants.user": currentUserId }
            ]
        }).sort({ updatedAt: -1 });

        const upcoming = allMeetings.filter(m => m.status === "scheduled" || m.status === "live");
        const previous = allMeetings.filter(m => m.status === "ended");

        return res.status(200).json({
            success: true,
            upcoming,
            previous
        });
    } catch (error) {
        console.error("Error in getMeetings controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error fetching meetings"
        });
    }
};

// POST /api/meeting/schedule - Schedule a meeting
export const scheduleMeeting = async (req, res) => {
    try {
        const { title, scheduledDate, code } = req.body;
        const currentUserId = req.user._id;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Meeting title is required"
            });
        }

        let meetingCode;
        if (code && code.trim()) {
            meetingCode = code.trim().toLowerCase();
            const existingMeeting = await Meeting.findOne({ code: meetingCode });
            if (existingMeeting && existingMeeting.status !== "ended") {
                return res.status(400).json({
                    success: false,
                    message: "A meeting with this code already exists. Please use a unique code."
                });
            }
        } else {
            meetingCode = await generateUniqueMeetingCode();
        }

        const newMeeting = new Meeting({
            title: title.trim(),
            code: meetingCode,
            host: currentUserId,
            hostName: req.user.fullname || "Host",
            status: "scheduled",
            scheduledDate: scheduledDate || "Today",
            participants: [
                {
                    user: currentUserId,
                    fullname: req.user.fullname,
                    username: req.user.username,
                    profilepic: req.user.profilepic || "",
                    joinedAt: new Date()
                }
            ]
        });

        await newMeeting.save();

        return res.status(201).json({
            success: true,
            meeting: newMeeting,
            message: "Meeting scheduled successfully! 📅"
        });
    } catch (error) {
        console.error("Error in scheduleMeeting controller:", error.message);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Meeting code conflict. Please try again with a unique code."
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to schedule meeting"
        });
    }
};

// POST /api/meeting/start - Start or join a live meeting
export const startMeeting = async (req, res) => {
    try {
        const { code, title } = req.body;
        const currentUserId = req.user._id;

        if (!code || !code.trim()) {
            return res.status(400).json({
                success: false,
                message: "Meeting code is required"
            });
        }

        let cleanCode = code.trim().toLowerCase();
        let meeting = await Meeting.findOne({ code: cleanCode });

        const now = new Date();

        if (!meeting) {
            // Instant meeting creation
            meeting = new Meeting({
                title: title ? title.trim() : "Instant Video Meeting",
                code: cleanCode,
                host: currentUserId,
                hostName: req.user.fullname || "Host",
                status: "live",
                startedAt: now,
                participants: [
                    {
                        user: currentUserId,
                        fullname: req.user.fullname,
                        username: req.user.username,
                        profilepic: req.user.profilepic || "",
                        joinedAt: now
                    }
                ]
            });
        } else {
            // Transition scheduled -> live
            if (meeting.status === "scheduled") {
                meeting.status = "live";
                meeting.startedAt = meeting.startedAt || now;
            } else if (meeting.status === "ended") {
                // Restarting or rejoining an ended meeting starts a fresh session
                meeting.status = "live";
                meeting.startedAt = now;
                meeting.endedAt = null;
            }

            // Record participant if not already present
            const alreadyParticipant = meeting.participants.some(
                p => p.user && p.user.toString() === currentUserId.toString()
            );

            if (!alreadyParticipant) {
                meeting.participants.push({
                    user: currentUserId,
                    fullname: req.user.fullname,
                    username: req.user.username,
                    profilepic: req.user.profilepic || "",
                    joinedAt: now
                });
            }
        }

        try {
            await meeting.save();
        } catch (saveError) {
            // If duplicate key error occurs, re-fetch or generate new code
            if (saveError.code === 11000) {
                console.warn(`[startMeeting] Duplicate key on code ${cleanCode}, attempting recovery...`);
                meeting = await Meeting.findOne({ code: cleanCode });
                if (meeting) {
                    meeting.status = "live";
                    meeting.startedAt = now;
                    await meeting.save();
                } else {
                    const fallbackCode = await generateUniqueMeetingCode();
                    meeting = new Meeting({
                        title: title ? title.trim() : "Instant Video Meeting",
                        code: fallbackCode,
                        host: currentUserId,
                        hostName: req.user.fullname || "Host",
                        status: "live",
                        startedAt: now,
                        participants: [
                            {
                                user: currentUserId,
                                fullname: req.user.fullname,
                                username: req.user.username,
                                profilepic: req.user.profilepic || "",
                                joinedAt: now
                            }
                        ]
                    });
                    await meeting.save();
                }
            } else {
                throw saveError;
            }
        }

        return res.status(200).json({
            success: true,
            meeting,
            message: "Meeting is live 🟢"
        });
    } catch (error) {
        console.error("Error in startMeeting controller:", error.message);
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Meeting code collision. Please generate a new meeting code."
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to start meeting: " + (error.message || "Internal server error")
        });
    }
};

// POST /api/meeting/end - End a meeting (status: live -> ended, sets endedAt & duration)
export const endMeeting = async (req, res) => {
    try {
        const { code } = req.body;
        const currentUserId = req.user._id;

        if (!code || !code.trim()) {
            return res.status(400).json({
                success: false,
                message: "Meeting code is required"
            });
        }

        const cleanCode = code.trim().toLowerCase();
        const meeting = await Meeting.findOne({ code: cleanCode });

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting not found"
            });
        }

        const now = new Date();
        meeting.status = "ended";
        meeting.endedAt = now;
        meeting.startedAt = meeting.startedAt || meeting.createdAt || now;

        // Calculate actual duration
        meeting.duration = calculateDurationString(meeting.startedAt, meeting.endedAt);

        // Update leftAt for current participant
        const participant = meeting.participants.find(
            p => p.user && p.user.toString() === currentUserId.toString()
        );
        if (participant) {
            participant.leftAt = now;
        }

        await meeting.save();

        return res.status(200).json({
            success: true,
            meeting,
            duration: meeting.duration,
            message: "Meeting has ended and moved to Previous history ✅"
        });
    } catch (error) {
        console.error("Error in endMeeting controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to end meeting"
        });
    }
};
// POST /api/meeting/join - Validate and join an active meeting
export const joinMeeting = async (req, res) => {
    try {
        const { code } = req.body;
        const currentUserId = req.user._id;

        if (!code || !code.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter a meeting code or link"
            });
        }

        // Clean code: supports raw code e.g. "ary-meet-492" or links e.g. "http://localhost:5173/meet/ary-meet-492"
        const cleanCode = code.trim().toLowerCase().replace(/.*\/meet\//, "").replace(/[^a-z0-9-_]/g, "");

        const meeting = await Meeting.findOne({ code: cleanCode });

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting not found. Please check the code and try again."
            });
        }

        if (meeting.status === "ended") {
            return res.status(400).json({
                success: false,
                message: "This meeting is no longer active (has ended)."
            });
        }

        // If meeting was scheduled, transition to live
        const now = new Date();
        if (meeting.status === "scheduled") {
            meeting.status = "live";
            meeting.startedAt = meeting.startedAt || now;
        }

        // Add user to participants if not already present
        const alreadyParticipant = meeting.participants.some(
            p => p.user && p.user.toString() === currentUserId.toString()
        );

        if (!alreadyParticipant) {
            meeting.participants.push({
                user: currentUserId,
                fullname: req.user.fullname,
                username: req.user.username,
                profilepic: req.user.profilepic || "",
                joinedAt: now
            });
        }

        await meeting.save();

        return res.status(200).json({
            success: true,
            meeting,
            code: cleanCode,
            title: meeting.title,
            roomName: `meeting_${cleanCode}`,
            message: "Meeting joined successfully! 🚀"
        });
    } catch (error) {
        console.error("Error in joinMeeting controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to join meeting. Please try again."
        });
    }
};


// DELETE /api/meeting/:id - Delete meeting from history
export const deleteMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user._id;

        const meeting = await Meeting.findOne({
            $or: [{ _id: id }, { code: id }]
        });

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting not found"
            });
        }

        await Meeting.findByIdAndDelete(meeting._id);

        return res.status(200).json({
            success: true,
            message: "Meeting deleted successfully 🗑️"
        });
    } catch (error) {
        console.error("Error in deleteMeeting controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to delete meeting"
        });
    }
};
