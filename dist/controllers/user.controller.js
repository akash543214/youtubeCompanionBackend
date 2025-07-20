"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.verifyLoginSession = exports.googleCallbackHandler = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = __importDefault(require("../utils/apiError"));
const prisma_1 = require("../lib/prisma");
const jwt_1 = require("../utils/jwt");
const googleCallbackHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // req.user should contain the user directly from Passport
    const user = req.user;
    const googleAccessToken = user.googleAccessToken;
    const googleRefreshToken = user.googleRefreshToken;
    if (!user) {
        throw new apiError_1.default("Authentication failed", 401);
    }
    const accessToken = (0, jwt_1.generateAccessToken)({ id: user.id, email: user.email });
    const refreshToken = (0, jwt_1.generateRefreshToken)({ id: user.id, email: user.email });
    // Save refresh token to database
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: {
            refreshToken, // your app refresh token
            googleAccessToken,
            googleRefreshToken
        }
    });
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    };
    const redirectURL = process.env.GOOGLE_REDIRECT;
    if (!redirectURL) {
        throw new apiError_1.default("Google redirect URL is not configured", 500);
    }
    res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options).redirect(redirectURL);
});
exports.googleCallbackHandler = googleCallbackHandler;
const verifyLoginSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user || !user.email) {
        throw new apiError_1.default("Unauthorized", 401);
    }
    const userData = await prisma_1.prisma.user.findUnique({
        where: { email: user.email },
    });
    if (!userData) {
        throw new apiError_1.default("User not found", 404);
    }
    const { refreshToken: _refreshToken } = userData, userDataWithoutPassword = __rest(userData, ["refreshToken"]);
    res.status(200).json(new apiResponse_1.ApiResponse(200, userDataWithoutPassword, "Login verified"));
});
exports.verifyLoginSession = verifyLoginSession;
const healthCheck = (req, res) => {
    res.status(200).json(new apiResponse_1.ApiResponse(200, {}, "health check completed in production s"));
};
exports.healthCheck = healthCheck;
