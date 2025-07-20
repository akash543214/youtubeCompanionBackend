"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const createValidationMiddleware_1 = require("../utils/createValidationMiddleware");
const user_schema_1 = require("../schemas/user.schema");
const passport_1 = __importDefault(require("passport"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validateUpdateUser = (0, createValidationMiddleware_1.createValidationMiddleware)(user_schema_1.UpdateProfileSchema);
const router = (0, express_1.Router)();
router.route('/verify-login').post(auth_middleware_1.verifyJWT, user_controller_1.verifyLoginSession);
router.route('/health').get(user_controller_1.healthCheck);
// Google OAuth
router.get("/google", passport_1.default.authenticate("google", {
    scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/youtube",
        "https://www.googleapis.com/auth/youtube.force-ssl"
    ],
    accessType: "offline", // IMPORTANT for refresh token
    prompt: "consent" // Forces Google to return refresh token every time
}));
router.get("/google/callback", passport_1.default.authenticate("google", { session: false }), user_controller_1.googleCallbackHandler // <-- This controller sends accessToken + refreshToken
);
exports.default = router;
