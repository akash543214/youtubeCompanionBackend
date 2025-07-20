import { Router } from "express";
import {
  getVideoDetails,
  postComment,
  replyToComment,
  updateVideoMetadata,
  deleteComment,
  addNote,
  getNotes,
  getEventLogs
} from "../controllers/youtube.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

// All routes below require JWT verification
router.use(verifyJWT);

// Get video details
router.get("/video/:videoId", getVideoDetails);

router.get("/video", getEventLogs);


// Post a top-level comment on a video
router.post("/video/:videoId/comment", postComment);

// Reply to a specific comment
router.post("/comment/:commentId/reply", replyToComment);

// Update video title and description
router.patch("/video/:videoId/metadata", updateVideoMetadata);

// Delete a comment
router.delete("/comment/:commentId", deleteComment);

// Add a personal note
router.post("/notes", addNote);

// Get all personal notes
router.get("/notes", getNotes);

export default router;
