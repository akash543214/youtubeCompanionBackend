"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskSchema = void 0;
const zod_1 = require("zod");
const SubtaskSchema = zod_1.z.object({
    title: zod_1.z.string(),
    content: zod_1.z.string(),
    subtasks: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string(),
        content: zod_1.z.string()
    })).optional()
});
exports.TaskSchema = zod_1.z.object({
    title: zod_1.z.string(),
    content: zod_1.z.string(),
    subtasks: zod_1.z.array(SubtaskSchema).optional()
});
//# sourceMappingURL=generatedTaskSchema.js.map