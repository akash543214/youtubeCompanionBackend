"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProjectSchema = void 0;
const zod_1 = require("zod");
exports.CreateProjectSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .trim()
        .min(1, "Title must be at least 1 characters long")
        .max(100, "Title must be less than 100 characters"),
    description: zod_1.z
        .string()
        .trim()
        .optional()
        .nullable(),
});
//# sourceMappingURL=project.schema.js.map