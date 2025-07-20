"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = void 0;
const apiError_1 = __importDefault(require("../utils/apiError"));
const jwt_1 = require("../utils/jwt");
const verifyJWT = (req, res, next) => {
    var _a;
    // Assuming access token cookie is named 'accessToken'
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken;
    if (!token) {
        return next(new apiError_1.default('No token provided', 401));
    }
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        // Attach user info to req for downstream handlers
        req.user = payload;
        next();
    }
    catch (_b) {
        next(new apiError_1.default('Invalid or expired token', 401));
    }
};
exports.verifyJWT = verifyJWT;
