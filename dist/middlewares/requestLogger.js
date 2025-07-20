"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const logger_1 = require("../utils/logger");
function requestLogger(methodsToLog = ["DELETE"]) {
    return function (req, res, next) {
        const shouldLog = methodsToLog.includes(req.method.toUpperCase());
        const start = Date.now();
        res.on("finish", () => {
            if (!shouldLog)
                return;
            const duration = Date.now() - start;
            const user = req.user || {};
            logger_1.logger.info("API Request", {
                method: req.method,
                route: req.originalUrl,
                status: res.statusCode,
                duration: `${duration}ms`,
                userId: user.id || "Unauthenticated",
                ip: req.ip,
                userAgent: req.headers["user-agent"],
                timestamp: new Date().toISOString(),
            });
        });
        next();
    };
}
