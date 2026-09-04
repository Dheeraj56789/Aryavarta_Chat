import jwt from "jsonwebtoken";

const jwtToken = (userId, res, sessionId = null) => {
    const payload = { userId };
    if (sessionId) {
        payload.sessionId = sessionId;
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "30d"
    });

    if (res) {
        res.cookie("jwt", token, {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production"
        });
    }

    return token;
};

export default jwtToken;