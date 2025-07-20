"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTaskSchema = exports.CreateTaskSchema = void 0;
const zod_1 = require("zod");
exports.CreateTaskSchema = zod_1.z.lazy(() => zod_1.z.object({
    title: zod_1.z
        .string()
        .trim()
        .min(1, "Title must be at least 1 characters long")
        .max(100, "Title must be less than 100 characters"),
    content: zod_1.z.string().trim().optional().nullable(),
    status: zod_1.z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
    priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    deadline: zod_1.z.coerce.date().optional().nullable(),
    parent_task_id: zod_1.z.number().optional().nullable(),
    subtasks: zod_1.z.array(exports.CreateTaskSchema).optional().nullable(),
}));
exports.UpdateTaskSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .trim()
        .min(1, "Title must be at least 1 characters long")
        .max(100, "Title must be less than 100 characters").optional(),
    content: zod_1.z
        .string()
        .trim()
        .optional()
        .nullable().optional(),
    status: zod_1.z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
    priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    deadline: zod_1.z.coerce.date().optional().nullable(),
    parent_task_id: zod_1.z.number().optional().nullable()
}).refine((data) => data.title || data.content || data.status || data.priority || data.deadline || data.parent_task_id, {
    message: "At least one field must be provided"
});
//# sourceMappingURL=task.schema.js.map