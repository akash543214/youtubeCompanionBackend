"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const youtube_controller_1 = require("../controllers/youtube.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// All routes below require JWT verification
router.use(auth_middleware_1.verifyJWT);
// Get video details
router.get("/video/:videoId", youtube_controller_1.getVideoDetails);
router.get("/video", youtube_controller_1.getEventLogs);
// Post a top-level comment on a video
router.post("/video/:videoId/comment", youtube_controller_1.postComment);
// Reply to a specific comment
router.post("/comment/:commentId/reply", youtube_controller_1.replyToComment);
// Update video title and description
router.patch("/video/:videoId/metadata", youtube_controller_1.updateVideoMetadata);
// Delete a comment
router.delete("/comment/:commentId", youtube_controller_1.deleteComment);
// Add a personal note
router.post("/notes", youtube_controller_1.addNote);
// Get all personal notes
router.get("/notes", youtube_controller_1.getNotes);
exports.default = router;
