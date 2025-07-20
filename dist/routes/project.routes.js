"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("../controllers/project.controller");
//import { createValidationMiddleware } from "../schemas/user.schema";
const auth_middleware_1 = require("../middlewares/auth.middleware");
const createValidationMiddleware_1 = require("../utils/createValidationMiddleware");
const project_schema_1 = require("../schemas/project.schema");
const validateProjectData = (0, createValidationMiddleware_1.createValidationMiddleware)(project_schema_1.CreateProjectSchema);
const router = (0, express_1.Router)();
router.route('/get-projects').get(auth_middleware_1.verifyJWT, project_controller_1.getAllProjects);
router.route('/get-project/:id').get(auth_middleware_1.verifyJWT, project_controller_1.getProjectsById);
router.route('/delete-project/:id').delete(auth_middleware_1.verifyJWT, project_controller_1.deleteProject);
router.route('/update-project/:id').patch(auth_middleware_1.verifyJWT, validateProjectData, project_controller_1.updateProject);
router.route('/create-project').post(auth_middleware_1.verifyJWT, validateProjectData, project_controller_1.createProject);
exports.default = router;
//# sourceMappingURL=project.routes.js.map