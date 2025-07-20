"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidationMiddleware = void 0;
const zod_1 = require("zod");
const apiError_1 = __importDefault(require("./apiError"));
const createValidationMiddleware = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.body);
            req.body = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const firstError = error.errors[0];
                // Throw custom ApiError with first validation message
                throw new apiError_1.default(firstError.message, 400);
            }
            throw new apiError_1.default('Invalid input data', 400);
        }
    };
};
exports.createValidationMiddleware = createValidationMiddleware;
