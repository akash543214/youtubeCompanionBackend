"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.verifyLoginSession = exports.googleCallbackHandler = exports.refreshAccessToken = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const jwt_1 = require("../utils/jwt");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = __importDefault(require("../utils/apiError"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_2 = require("../utils/jwt");
const prisma_1 = require("../lib/prisma");
const registerUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // At this point, req.body is already validated and sanitized by Zod
    const { name, email, password } = req.body;
    // Check if user already exists
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { email }
    });
    if (existingUser) {
        throw new apiError_1.default("User already exists", 409);
    }
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
    // Create LOCAL user
    const newUser = await prisma_1.prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            provider: "local",
        },
    });
    await prisma_1.prisma.project.create({
        data: {
            title: "Welcome Project",
            description: "Auto-created project",
            user_id: newUser.id,
            tasks: {
                create: [
                    {
                        title: "Checkout features",
                        content: "Check out features",
                        owner_id: newUser.id,
                        status: "PENDING",
                        deadline: new Date(),
                    },
                    {
                        title: "use AI to generate task",
                        content: "Check out features",
                        owner_id: newUser.id,
                        status: "PENDING",
                        deadline: new Date(),
                    },
                    {
                        title: "checkout dashboard",
                        content: "Check out features",
                        owner_id: newUser.id,
                        status: "PENDING",
                        deadline: new Date(),
                    },
                    {
                        title: "create subtasks",
                        content: "Check out features",
                        owner_id: newUser.id,
                        status: "PENDING",
                        deadline: new Date(),
                    }
                ],
            },
        },
    });
    // Remove password from response
    const { password: _, ...userResponse } = newUser;
    res.status(201).json(new apiResponse_1.ApiResponse(201, userResponse, "Registration successful"));
});
exports.registerUser = registerUser;
const loginUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new apiError_1.default("User does not exists", 400);
    }
    const passwordMatch = await bcrypt_1.default.compare(password, user.password);
    if (!passwordMatch) {
        throw new apiError_1.default("Incorrect password", 400);
    }
    const payload = { id: user.id, email: user.email };
    const accessToken = (0, jwt_2.generateAccessToken)(payload);
    const refreshToken = (0, jwt_2.generateRefreshToken)(payload);
    // Save refresh token in DB
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
    });
    const { password: _, refreshToken: __, ...userResponse } = user;
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    };
    res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options).json(new apiResponse_1.ApiResponse(200, {
        user: userResponse,
        accessToken,
        refreshToken,
    }, "Login successful"));
});
exports.loginUser = loginUser;
const logoutUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user || !user.email) {
        throw new apiError_1.default("User not authenticated", 401);
    }
    const { email } = user;
    await prisma_1.prisma.user.update({
        where: {
            email: email
        },
        data: {
            refreshToken: null
        }
    });
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    })
        .clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    })
        .status(200).json(new apiResponse_1.ApiResponse(201, {}, "Logout successful"));
});
exports.logoutUser = logoutUser;
const refreshAccessToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        throw new apiError_1.default("Refresh token missing", 401);
    }
    const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
    const { email } = payload;
    console.log(payload);
    // Optionally verify token exists in DB
    const storedToken = await prisma_1.prisma.user.findUnique({
        where: { email }
    });
    if (!storedToken) {
        throw new apiError_1.default("Token not found or revoked", 403);
    }
    const accessToken = (0, jwt_2.generateAccessToken)({ id: payload.id, email: payload.email });
    const newRefreshToken = (0, jwt_2.generateRefreshToken)({ id: payload.id, email: payload.email });
    // Optionally update stored token (rotation)
    await prisma_1.prisma.user.update({
        where: { email: email },
        data: { refreshToken: newRefreshToken }
    });
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    };
    res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options).json(new apiResponse_1.ApiResponse(200, {
        accessToken,
        refreshToken,
    }, "access token refreshed"));
});
exports.refreshAccessToken = refreshAccessToken;
const googleCallbackHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // req.user should contain the user directly from Passport
    const user = req.user; // Better typing needed
    if (!user) {
        throw new apiError_1.default("Authentication failed", 401);
    }
    const accessToken = (0, jwt_2.generateAccessToken)({ id: user.id, email: user.email });
    const refreshToken = (0, jwt_2.generateRefreshToken)({ id: user.id, email: user.email });
    // Save refresh token to database
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
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
    const { password: _password, refreshToken: _refreshToken, ...userDataWithoutPassword } = userData;
    res.status(200).json(new apiResponse_1.ApiResponse(200, userDataWithoutPassword, "Login verified"));
});
exports.verifyLoginSession = verifyLoginSession;
const healthCheck = (req, res) => {
    res.status(200).json(new apiResponse_1.ApiResponse(200, {}, "health check completed in production s"));
};
exports.healthCheck = healthCheck;
//# sourceMappingURL=auth.controller.js.map