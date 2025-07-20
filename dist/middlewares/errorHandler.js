"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiError_1 = __importDefault(require("../utils/apiError"));
const prisma_1 = require("../generated/prisma");
const errorHandler = (err, req, res, next) => {
    var _a, _b, _c;
    let error = err;
    // Handle Prisma errors
    if (err instanceof prisma_1.Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                const target = (_a = err.meta) === null || _a === void 0 ? void 0 : _a.target;
                error = new apiError_1.default(`Duplicate value for ${(target === null || target === void 0 ? void 0 : target.join(', ')) || 'field'}`, 409);
                break;
            case 'P2025':
                error = new apiError_1.default('Record not found', 404);
                break;
            case 'P2003':
                const field = (_b = err.meta) === null || _b === void 0 ? void 0 : _b.field_name;
                error = new apiError_1.default(`Invalid reference: ${field || 'foreign key constraint violated'}`, 400);
                break;
            case 'P2011':
                const constraint = (_c = err.meta) === null || _c === void 0 ? void 0 : _c.constraint;
                error = new apiError_1.default(`Missing required field: ${constraint || 'null constraint violation'}`, 400);
                break;
            default:
                error = new apiError_1.default(`Database error: ${err.code}`, 400);
        }
    }
    else if (err instanceof prisma_1.Prisma.PrismaClientValidationError) {
        error = new apiError_1.default('Invalid data provided', 400);
    }
    // If error is not an instance of ApiError, convert it to one
    else if (!(err instanceof apiError_1.default)) {
        error = new apiError_1.default(err.message || 'Internal Server Error', err.statusCode || 500);
    }
    res.status(error.statusCode).json(Object.assign({ status: error.status, message: error.message }, (process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        originalError: err
    })));
};
exports.default = errorHandler;
