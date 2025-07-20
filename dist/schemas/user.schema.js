"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileSchema = exports.EmailVerificationSchema = exports.ChangePasswordSchema = exports.PasswordResetSchema = exports.PasswordResetRequestSchema = exports.LoginUserSchema = exports.RegisterUserSchema = void 0;
const zod_1 = require("zod");
// Registration Schema
exports.RegisterUserSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters long")
        .max(100, "Name must be less than 100 characters")
        .regex(/^[a-zA-Z\s\-'\.]+$/, "Name can only contain letters, spaces, hyphens, apostrophes, and periods"),
    email: zod_1.z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email format")
        .max(254, "Email must be less than 254 characters"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(128, "Password must be less than 128 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .refine((password) => {
        const commonPasswords = [
            'password', '12345678', 'qwerty123', 'admin123',
            'welcome123', 'password123', '123456789'
        ];
        return !commonPasswords.includes(password.toLowerCase());
    }, "Password is too common, please choose a stronger password")
});
// Login Schema
exports.LoginUserSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email format")
        .max(254, "Email must be less than 254 characters"),
    password: zod_1.z
        .string()
        .min(1, "Password is required")
        .max(128, "Password is too long")
});
// Password Reset Request Schema
exports.PasswordResetRequestSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email format")
});
// Password Reset Schema
exports.PasswordResetSchema = zod_1.z.object({
    token: zod_1.z
        .string()
        .min(1, "Reset token is required"),
    newPassword: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(128, "Password must be less than 128 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number")
});
// Change Password Schema
exports.ChangePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z
        .string()
        .min(1, "Current password is required"),
    newPassword: zod_1.z
        .string()
        .min(8, "New password must be at least 8 characters long")
        .max(128, "New password must be less than 128 characters")
        .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
        .regex(/[a-z]/, "New password must contain at least one lowercase letter")
        .regex(/\d/, "New password must contain at least one number")
}).refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"]
});
// Email Verification Schema
exports.EmailVerificationSchema = zod_1.z.object({
    token: zod_1.z
        .string()
        .min(1, "Verification token is required")
});
// Update Profile Schema
exports.UpdateProfileSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters long")
        .max(100, "Name must be less than 100 characters")
        .regex(/^[a-zA-Z\s\-'\.]+$/, "Name can only contain letters, spaces, hyphens, apostrophes, and periods")
        .optional(),
    email: zod_1.z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email format")
        .max(254, "Email must be less than 254 characters")
        .optional()
}).refine((data) => data.name || data.email, {
    message: "At least one field (name or email) must be provided"
});
