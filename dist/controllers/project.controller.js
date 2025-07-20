"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectsById = exports.getAllProjects = exports.updateProject = exports.deleteProject = exports.createProject = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = __importDefault(require("../utils/apiError"));
const prisma_1 = require("../lib/prisma");
const getAllProjects = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const projects = await prisma_1.prisma.project.findMany({
        where: {
            user_id: user.id,
        },
        include: {
            _count: {
                select: {
                    tasks: true, // assumes "tasks" is the relation field name
                },
            },
        },
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, projects, "Projects fetched successfully with task counts"));
});
exports.getAllProjects = getAllProjects;
const getProjectsById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const projectId = Number(req.params.id);
    const user = req.user;
    if (!projectId) {
        throw new apiError_1.default("No project Id provided", 401);
    }
    const project = await prisma_1.prisma.project.findUnique({
        where: {
            id: projectId,
            user_id: user.id
        },
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, project, "project fetched successfully"));
});
exports.getProjectsById = getProjectsById;
const createProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const { title, description } = req.body;
    const project = await prisma_1.prisma.project.create({
        data: {
            title: title,
            description: description,
            user_id: user.id
        },
    });
    res.status(200).json(new apiResponse_1.ApiResponse(201, project, "project created successful"));
});
exports.createProject = createProject;
const deleteProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const projectId = Number(req.params.id);
    const user = req.user;
    if (!projectId) {
        throw new apiError_1.default("No project Id provided", 401);
    }
    const deleteProject = await prisma_1.prisma.project.delete({
        where: {
            id: projectId,
            user_id: user.id
        },
    });
    res.status(201).json(new apiResponse_1.ApiResponse(201, deleteProject, "delete successful"));
});
exports.deleteProject = deleteProject;
const updateProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const projectId = Number(req.params.id);
    const updateData = req.body;
    const user = req.user;
    if (!projectId || Number.isNaN(projectId)) {
        throw new apiError_1.default("Invalid project ID", 400);
    }
    const restrictedFields = ['id', 'user_id', 'created_at'];
    const hasRestrictedField = restrictedFields.some(field => field in updateData);
    if (hasRestrictedField) {
        throw new apiError_1.default("Cannot update restricted fields", 400);
    }
    const updatedProject = await prisma_1.prisma.project.update({
        where: {
            id: projectId,
            user_id: user.id
        },
        data: updateData,
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, updatedProject, "update successful"));
});
exports.updateProject = updateProject;
//# sourceMappingURL=project.controller.js.map