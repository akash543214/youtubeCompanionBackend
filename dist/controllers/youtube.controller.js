"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventLogs = exports.getNotes = exports.addNote = exports.deleteComment = exports.updateVideoMetadata = exports.replyToComment = exports.postComment = exports.getVideoDetails = void 0;
const googleapis_1 = require("googleapis");
const prisma_1 = require("../lib/prisma");
const asyncHandler_1 = require("../utils/asyncHandler");
const apiError_1 = __importDefault(require("../utils/apiError"));
const getYouTubeClient = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!(user === null || user === void 0 ? void 0 : user.googleAccessToken) || !user.googleRefreshToken) {
        throw new apiError_1.default("Missing Google tokens", 401);
    }
    const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, `${process.env.GOOGLE_CALLBACK_DOMAIN}/api/google/callback`);
    oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
    });
    return googleapis_1.google.youtube({ version: "v3", auth: oauth2Client });
};
// 1. Get video details
exports.getVideoDetails = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { videoId } = req.params;
    console.log(req.user);
    const youtube = await getYouTubeClient(req.user.id);
    const response = await youtube.videos.list({
        part: ["snippet", "statistics"],
        id: [videoId],
    });
    await prisma_1.prisma.eventLog.create({
        data: {
            userId: req.user.id,
            action: "fetch_video_details",
            metadata: { videoId },
        },
    });
    res.json(response.data);
});
// 2. Post a comment
exports.postComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { videoId } = req.params;
    const { text } = req.body;
    const youtube = await getYouTubeClient(req.user.id);
    const response = await youtube.commentThreads.insert({
        part: ["snippet"],
        requestBody: {
            snippet: {
                videoId,
                topLevelComment: {
                    snippet: {
                        textOriginal: text,
                    },
                },
            },
        },
    });
    await prisma_1.prisma.eventLog.create({
        data: {
            userId: req.user.id,
            action: "post_comment",
            metadata: { videoId, text },
        },
    });
    res.json(response.data);
});
// 3. Reply to a comment
exports.replyToComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { commentId } = req.params;
    const { text } = req.body;
    const youtube = await getYouTubeClient(req.user.id);
    const response = await youtube.comments.insert({
        part: ["snippet"],
        requestBody: {
            snippet: {
                parentId: commentId,
                textOriginal: text,
            },
        },
    });
    await prisma_1.prisma.eventLog.create({
        data: {
            userId: req.user.id,
            action: "reply_comment",
            metadata: { commentId, text },
        },
    });
    res.json(response.data);
});
// 4. Edit video title and description
exports.updateVideoMetadata = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const youtube = await getYouTubeClient(req.user.id);
    const response = await youtube.videos.update({
        part: ["snippet"],
        requestBody: {
            id: videoId,
            snippet: {
                title,
                description,
                categoryId: "22", // People & Blogs (safe default)
            },
        },
    });
    await prisma_1.prisma.eventLog.create({
        data: {
            userId: req.user.id,
            action: "edit_title_description",
            metadata: { videoId, title, description },
        },
    });
    res.json(response.data);
});
// 5. Delete own comment
exports.deleteComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { commentId } = req.params;
    const youtube = await getYouTubeClient(req.user.id);
    await youtube.comments.delete({ id: commentId });
    await prisma_1.prisma.eventLog.create({
        data: {
            userId: req.user.id,
            action: "delete_comment",
            metadata: { commentId },
        },
    });
    res.json({ message: "Comment deleted" });
});
// 6. Save personal note (in your DB)
exports.addNote = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { videoId, content } = req.body;
    const note = await prisma_1.prisma.note.create({
        data: {
            userId: req.user.id,
            videoId,
            content,
        },
    });
    await prisma_1.prisma.eventLog.create({
        data: {
            userId: req.user.id,
            action: "add_note",
            metadata: { videoId, content },
        },
    });
    res.json(note);
});
// 7. Get personal notes
exports.getNotes = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const notes = await prisma_1.prisma.note.findMany({
        where: { userId: req.user.id },
        orderBy: { updatedAt: "desc" },
    });
    res.json(notes);
});
exports.getEventLogs = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const logs = await prisma_1.prisma.eventLog.findMany({
        where: { userId },
        orderBy: { timestamp: "desc" },
    });
    res.json(logs);
});
