"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeTaskData = normalizeTaskData;
exports.flattenTasks = flattenTasks;
exports.groupTasksByDeadline = groupTasksByDeadline;
exports.mapPrismaTaskToTaskData = mapPrismaTaskToTaskData;
exports.insertTaskTree = insertTaskTree;
const common_1 = require("../types/common");
const date_fns_1 = require("date-fns");
const prisma_1 = require("../lib/prisma");
function cleanTask(task, depth = 0, flattened = []) {
    const { title, content, subtasks } = task;
    const cleaned = {
        title,
        content,
        status: common_1.TaskStatus.PENDING,
        priority: common_1.TaskPriority.MEDIUM,
        deadline: new Date(),
    };
    if (Array.isArray(subtasks)) {
        if (depth < 1) {
            // Allow 1 level of nesting (i.e., two levels total)
            cleaned.subtasks = subtasks.map(sub => cleanTask(sub, depth + 1, flattened));
        }
        else {
            // Flatten deeper levels
            subtasks.forEach(sub => {
                const flat = cleanTask(sub, 0, flattened); // reset depth for root-level
                flattened.push(flat);
            });
        }
    }
    return cleaned;
}
function normalizeTaskData(result) {
    const raw = Array.isArray(result) ? result : [result];
    const final = [];
    raw.forEach(task => {
        const flattened = [];
        const cleaned = cleanTask(task, 0, flattened);
        final.push(cleaned, ...flattened);
    });
    return final;
}
function flattenTasks(tasks) {
    const flat = [];
    function recurse(task) {
        flat.push(task);
        if (task.subtasks && task.subtasks.length > 0) {
            task.subtasks.forEach(recurse);
        }
    }
    tasks.forEach(recurse);
    return flat;
}
// -------------------------
// Group Tasks by Deadline
// -------------------------
function groupTasksByDeadline(tasks) {
    const flatTasks = flattenTasks(tasks);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Strip time
    const tomorrow = (0, date_fns_1.addDays)(today, 1);
    const dayAfterTomorrow = (0, date_fns_1.addDays)(today, 2);
    const todayTasks = [];
    const tomorrowTasks = [];
    const dayAfterTomorrowTasks = [];
    const overDueTasks = [];
    for (const task of flatTasks) {
        const deadline = new Date(task.deadline);
        const taskDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate()); // Strip time
        if (taskDate < today && (task.status === common_1.TaskStatus.PENDING || task.status === common_1.TaskStatus.IN_PROGRESS)) {
            task.subtasks = [];
            overDueTasks.push(task);
        }
        else if ((0, date_fns_1.isSameDay)(deadline, today)) {
            task.subtasks = [];
            todayTasks.push(task);
        }
        else if ((0, date_fns_1.isSameDay)(deadline, tomorrow)) {
            task.subtasks = [];
            tomorrowTasks.push(task);
        }
        else if ((0, date_fns_1.isSameDay)(deadline, dayAfterTomorrow)) {
            task.subtasks = [];
            dayAfterTomorrowTasks.push(task);
        }
    }
    return {
        overdue: overDueTasks,
        today: todayTasks,
        tomorrow: tomorrowTasks,
        dayAfterTomorrow: dayAfterTomorrowTasks,
    };
}
function mapPrismaTaskToTaskData(task) {
    return {
        title: task.title,
        content: task.content,
        project_id: task.project_id,
        owner_id: task.owner_id,
        parent_task_id: task.parent_task_id,
        assignee_id: task.assignee_id,
        status: task.status,
        priority: task.priority,
        deadline: task.deadline,
        created_at: task.created_at,
        subtasks: task.subtasks?.map((sub) => ({
            ...sub,
            status: sub.status,
            priority: sub.priority,
            deadline: sub.deadline,
            created_at: sub.created_at,
        })),
    };
}
async function insertTaskTree(task, projectId, ownerId, parentId = null) {
    // Create the current task
    const created = await prisma_1.prisma.task.create({
        data: {
            title: task.title,
            content: task.content,
            priority: task.priority,
            status: task.status,
            deadline: task.deadline ? new Date(task.deadline) : null,
            project_id: projectId,
            owner_id: ownerId,
            parent_task_id: parentId,
        },
    });
    // If subtasks exist, insert them in parallel
    if (Array.isArray(task.subtasks) && task.subtasks.length > 0) {
        await Promise.all(task.subtasks.map((subtask) => insertTaskTree(subtask, projectId, ownerId, created.id)));
    }
}
//# sourceMappingURL=paresResponse.js.map