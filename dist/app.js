"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
require("./lib/prisma"); // <- Ensure this runs at app startup
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
require("./config/passport");
const apiError_1 = __importDefault(require("./utils/apiError"));
const passport_1 = __importDefault(require("passport"));
require('dotenv').config();
const app = (0, express_1.default)();
app.set('trust proxy', 1);
app.use((0, morgan_1.default)('dev'));
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express_1.default.json({ limit: "16kb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "16kb" }));
app.use(express_1.default.static("public"));
app.use((0, cookie_parser_1.default)());
app.use(passport_1.default.initialize());
// Routes
app.use("/api", users_routes_1.default);
const youtube_routes_1 = __importDefault(require("./routes/youtube.routes"));
app.use('/api/youtube', youtube_routes_1.default);
// 404 handler
app.use((req, _, next) => {
    next(new apiError_1.default(`Can't find ${req.originalUrl} on this server!`, 404));
});
// Global error handler
app.use(errorHandler_1.default);
exports.default = app;
