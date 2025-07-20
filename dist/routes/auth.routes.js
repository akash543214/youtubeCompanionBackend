"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const auth_controller_1 = require("../controllers/auth.controller");
const createValidationMiddleware_1 = require("../utils/createValidationMiddleware");
const user_schema_1 = require("../schemas/user.schema");
const user_schema_2 = require("../schemas/user.schema");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validateRegistration = (0, createValidationMiddleware_1.createValidationMiddleware)(user_schema_1.RegisterUserSchema);
const validateLogin = (0, createValidationMiddleware_1.createValidationMiddleware)(user_schema_2.LoginUserSchema);
const router = (0, express_1.Router)();
router.route('/register-user').post(validateRegistration, auth_controller_1.registerUser);
router.route('/login-user').post(validateLogin, auth_controller_1.loginUser);
router.route('/logout-user').post(auth_middleware_1.verifyJWT, auth_controller_1.logoutUser);
router.route('/refresh-token').post(auth_controller_1.refreshAccessToken);
router.route('/verify-login').post(auth_middleware_1.verifyJWT, auth_controller_1.verifyLoginSession);
router.route('/health').get(auth_controller_1.healthCheck);
// Google OAuth
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport_1.default.authenticate("google", { session: false }), auth_controller_1.googleCallbackHandler // <-- This controller sends accessToken + refreshToken
);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map