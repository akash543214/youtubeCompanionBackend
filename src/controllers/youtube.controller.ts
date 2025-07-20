import { Request, Response } from "express";
import { google } from "googleapis";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/apiError";

const getYouTubeClient = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user?.googleAccessToken || !user.googleRefreshToken) {
    throw new ApiError("Missing Google tokens", 401);
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.GOOGLE_CALLBACK_DOMAIN}/api/google/callback`
  );

  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
  });

  return google.youtube({ version: "v3", auth: oauth2Client });
};

// 1. Get video details
export const getVideoDetails = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;
  console.log(req.user);
  const youtube = await getYouTubeClient((req.user as any).id);

  const response = await youtube.videos.list({
    part: ["snippet", "statistics"],
    id: [videoId],
  });

  await prisma.eventLog.create({
    data: {
      userId: (req.user as any).id,
      action: "fetch_video_details",
      metadata: { videoId },
    },
  });

  res.json(response.data);
});

// 2. Post a comment
export const postComment = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const { text } = req.body;

  const youtube = await getYouTubeClient((req.user as any).id);

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

  await prisma.eventLog.create({
    data: {
      userId: (req.user as any).id,
      action: "post_comment",
      metadata: { videoId, text },
    },
  });

  res.json(response.data);
});

// 3. Reply to a comment
export const replyToComment = asyncHandler(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const { text } = req.body;

  const youtube = await getYouTubeClient((req.user as any).id);

  const response = await youtube.comments.insert({
    part: ["snippet"],
    requestBody: {
      snippet: {
        parentId: commentId,
        textOriginal: text,
      },
    },
  });

  await prisma.eventLog.create({
    data: {
      userId: (req.user as any).id,
      action: "reply_comment",
      metadata: { commentId, text },
    },
  });

  res.json(response.data);
});

// 4. Edit video title and description
export const updateVideoMetadata = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  const youtube = await getYouTubeClient((req.user as any).id);

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

  await prisma.eventLog.create({
    data: {
      userId: (req.user as any).id,
      action: "edit_title_description",
      metadata: { videoId, title, description },
    },
  });

  res.json(response.data);
});

// 5. Delete own comment
export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const { commentId } = req.params;

  const youtube = await getYouTubeClient((req.user as any).id);

  await youtube.comments.delete({ id: commentId });

  await prisma.eventLog.create({
    data: {
      userId: (req.user as any).id,
      action: "delete_comment",
      metadata: { commentId },
    },
  });

  res.json({ message: "Comment deleted" });
});

// 6. Save personal note (in your DB)
export const addNote = asyncHandler(async (req: Request, res: Response) => {
  const { videoId, content } = req.body;

  const note = await prisma.note.create({
    data: {
      userId: (req.user as any).id,
      videoId,
      content,
    },
  });

  await prisma.eventLog.create({
    data: {
      userId: (req.user as any).id,
      action: "add_note",
      metadata: { videoId, content },
    },
  });

  res.json(note);
});

// 7. Get personal notes
export const getNotes = asyncHandler(async (req: Request, res: Response) => {
  const notes = await prisma.note.findMany({
    where: { userId: (req.user as any).id },
    orderBy: { updatedAt: "desc" },
  });

  res.json(notes);
});

export const getEventLogs = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any).id;

  const logs = await prisma.eventLog.findMany({
    where: { userId },
    orderBy: { timestamp: "desc" },
  });

  res.json(logs);
});