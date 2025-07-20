"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.overView = exports.generateTask = exports.getFirstLevelSubtasks = exports.getAllSubtasks = exports.getTasksWithAllSubtasks = exports.getTopTasksWithChildren = exports.getTaskById = exports.getTopLevelTasks = exports.updateTask = exports.deleteTask = exports.createTask = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = __importDefault(require("../utils/apiError"));
const prisma_1 = require("../lib/prisma");
const generatedTaskSchema_1 = require("../schemas/generatedTaskSchema");
const grogClient_1 = require("../utils/grogClient");
const paresResponse_1 = require("../utils/paresResponse");
const paresResponse_2 = require("../utils/paresResponse");
const createTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const projectId = Number(req.params.projectId);
    const user = req.user;
    if (!projectId) {
        throw new apiError_1.default("No project Id provided", 401);
    }
    const project = await prisma_1.prisma.project.findFirst({
        where: { id: projectId, user_id: user.id },
    });
    if (!project) {
        throw new apiError_1.default("Project not found or access denied", 404);
    }
    const parent_task_id = req.body.parent_task_id ? Number(req.body.parent_task_id) : null;
    await (0, paresResponse_2.insertTaskTree)(req.body, projectId, user.id, parent_task_id);
    res.status(200).json(new apiResponse_1.ApiResponse(200, {}, "Task created successfully"));
});
exports.createTask = createTask;
//fetch all tasks with project id, no subtasks
const getTopLevelTasks = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const projectId = Number(req.params.projectId);
    if (!projectId || isNaN(projectId)) {
        throw new apiError_1.default("Invalid project Id provided", 401);
    }
    const tasks = await prisma_1.prisma.task.findMany({
        where: {
            project_id: projectId,
            parent_task_id: null,
        },
    });
    res.json(new apiResponse_1.ApiResponse(200, tasks, "Top-level tasks fetched"));
});
exports.getTopLevelTasks = getTopLevelTasks;
//fetch single task with task id
const getTaskById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const taskId = Number(req.params.taskId);
    if (!taskId || isNaN(taskId)) {
        throw new apiError_1.default("Invalid task Id provided", 401);
    }
    const task = await prisma_1.prisma.task.findUnique({
        where: {
            id: taskId,
            owner_id: user.id
        },
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, task, "task fetched successfuly"));
});
exports.getTaskById = getTaskById;
//get task and first level subtasks with project id
const getTopTasksWithChildren = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const projectId = Number(req.params.projectId);
    const user = req.user;
    if (!projectId || isNaN(projectId)) {
        throw new apiError_1.default("Invalid task Id provided", 401);
    }
    const tasks = await prisma_1.prisma.task.findMany({
        where: {
            project_id: projectId,
            parent_task_id: null,
            owner_id: user.id
        },
        include: {
            subtasks: {
                orderBy: { created_at: 'asc' },
            },
        },
    });
    res.json(new apiResponse_1.ApiResponse(200, tasks, "Top-level tasks with children fetched"));
});
exports.getTopTasksWithChildren = getTopTasksWithChildren;
//get whole task tree using project id
const getTasksWithAllSubtasks = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const projectId = Number(req.params.projectId);
    const user = req.user;
    if (!projectId || isNaN(projectId)) {
        throw new apiError_1.default("Invalid project Id provided", 401);
    }
    const project = await prisma_1.prisma.project.findFirst({
        where: { id: projectId, user_id: user.id },
    });
    if (!project) {
        throw new apiError_1.default("Project not found or access denied", 404);
    }
    const tasks = await prisma_1.prisma.task.findMany({
        where: {
            project_id: projectId,
            parent_task_id: null,
            owner_id: user.id,
        },
        include: {
            subtasks: {
                include: {
                    subtasks: {
                        orderBy: { created_at: 'asc' }, // Order 2nd-level subtasks
                    },
                },
                orderBy: { created_at: 'asc' }, // Order 1st-level subtasks
            },
        },
        orderBy: { created_at: 'asc' },
    });
    res.json(new apiResponse_1.ApiResponse(200, tasks, "Tasks with all nested subtasks fetched"));
});
exports.getTasksWithAllSubtasks = getTasksWithAllSubtasks;
//get all subtasks of a task using task id
const getAllSubtasks = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const taskId = Number(req.params.taskId);
    const user = req.user;
    if (!taskId || isNaN(taskId)) {
        throw new apiError_1.default("Invalid task Id provided", 401);
    }
    const tasks = await prisma_1.prisma.task.findMany({
        where: {
            parent_task_id: taskId,
            owner_id: user.id
        },
        include: {
            subtasks: {
                orderBy: { created_at: 'asc' },
            },
        }
    });
    res.json(new apiResponse_1.ApiResponse(200, tasks, "Tasks fetched"));
});
exports.getAllSubtasks = getAllSubtasks;
//fetch first level subtasks of a task using task id
const getFirstLevelSubtasks = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const taskId = Number(req.params.taskId);
    const user = req.user;
    if (!taskId || isNaN(taskId)) {
        throw new apiError_1.default("Invalid task Id provided", 401);
    }
    const tasks = await prisma_1.prisma.task.findMany({
        where: {
            parent_task_id: taskId,
            owner_id: user.id
        },
    });
    res.json(new apiResponse_1.ApiResponse(200, tasks, "Tasks fetched"));
});
exports.getFirstLevelSubtasks = getFirstLevelSubtasks;
const deleteTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const taskId = Number(req.params.taskId);
    const user = req.user;
    if (!taskId) {
        throw new apiError_1.default("Invalid task Id provided", 401);
    }
    const deletedTask = await prisma_1.prisma.task.delete({
        where: {
            id: taskId,
            owner_id: user.id
        },
    });
    res.status(201).json(new apiResponse_1.ApiResponse(201, deletedTask, "delete successful"));
});
exports.deleteTask = deleteTask;
const updateTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const taskId = Number(req.params.taskId);
    const updateData = req.body;
    const user = req.user;
    if (!taskId) {
        throw new apiError_1.default("Invalid task ID provided", 400);
    }
    //if (existingTask.assignee_id !== user.id) {
    // throw new ApiError("Not authorized to update this task", 403);
    //}
    const updatedTask = await prisma_1.prisma.task.update({
        where: {
            id: taskId,
            owner_id: user.id
        },
        data: updateData,
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, updatedTask, "update successful"));
});
exports.updateTask = updateTask;
const generateTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { prompt } = req.body;
    const SYSTEM_PROMPT = `You are a project task generator. Return a JSON object with array of atleast 10 tasks.
Each task should have the following structure:
                          - title: short and clear
                          - content: detailed description on what to do
                          - subtasks: max 2 levels deep
                          No IDs, dates, priority, or status.`;
    if (!prompt) {
        return res.status(400).json({ error: "Missing 'prompt' in request body" });
    }
    const result = await grogClient_1.instructor.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        response_model: {
            name: "Task",
            schema: generatedTaskSchema_1.TaskSchema,
        },
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
        ],
        max_retries: 3,
    });
    //   console.log(result);
    const parsedTasks = (0, paresResponse_1.normalizeTaskData)(result);
    res.status(201).json(new apiResponse_1.ApiResponse(201, parsedTasks, "AI generation successful"));
});
exports.generateTask = generateTask;
const overView = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const tasks = await prisma_1.prisma.task.findMany({
        where: {
            parent_task_id: null,
            owner_id: user.id,
        },
        include: {
            subtasks: {
                include: {
                    subtasks: {
                        orderBy: { created_at: 'asc' }, // Order 2nd-level subtasks
                    },
                },
                orderBy: { created_at: 'asc' }, // Order 1st-level subtasks
            },
        },
        orderBy: { created_at: 'asc' },
    });
    const group = (0, paresResponse_1.groupTasksByDeadline)(tasks);
    res.json(new apiResponse_1.ApiResponse(200, group, "Tasks with all nested subtasks fetched"));
});
exports.overView = overView;
//# sourceMappingURL=task.controller.js.map