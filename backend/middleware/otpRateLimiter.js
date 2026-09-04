// In-memory sliding window IP Rate Limiter for OTP Endpoints
// Prevents bot spam, harassment, and abuse of SMS credits

const ipRequests = new Map();

// Configuration
const WINDOW_MS = 15 * 60 * 1000; // 15-minute sliding window
const MAX_REQUESTS_PER_IP = 5;      // Max 5 OTP requests per IP in 15 minutes

// Periodic garbage collection to keep memory lean
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipRequests.entries()) {
        if (now - record.startTime > WINDOW_MS) {
            ipRequests.delete(ip);
        }
    }
}, 5 * 60 * 1000);

export const otpIpRateLimiter = (req, res, next) => {
    // Determine client IP
    const clientIp =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        req.ip ||
        "unknown";

    const now = Date.now();
    const record = ipRequests.get(clientIp);

    if (!record) {
        ipRequests.set(clientIp, { count: 1, startTime: now });
        return next();
    }

    if (now - record.startTime > WINDOW_MS) {
        // Window expired, reset
        ipRequests.set(clientIp, { count: 1, startTime: now });
        return next();
    }

    if (record.count >= MAX_REQUESTS_PER_IP) {
        const remainingMinutes = Math.ceil((WINDOW_MS - (now - record.startTime)) / 60000);
        return res.status(429).json({
            success: false,
            message: `Too many verification requests from your network. Please wait ${remainingMinutes} minute(s) before trying again.`
        });
    }

    record.count += 1;
    return next();
};

export default otpIpRateLimiter;
