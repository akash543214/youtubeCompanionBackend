"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// utils/AppError.ts
class ApiError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Mark custom errors as operational (expected)
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = ApiError;
