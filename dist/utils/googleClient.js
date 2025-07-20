"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYouTubeClient = void 0;
// utils/googleClient.ts
const googleapis_1 = require("googleapis");
const prisma_1 = require("../lib/prisma");
const getYouTubeClient = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.googleAccessToken || !user.googleRefreshToken) {
        throw new Error("Google tokens missing");
    }
    const oAuth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, `${process.env.GOOGLE_CALLBACK_DOMAIN}/api/google/callback`);
    oAuth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
    });
    const youtube = googleapis_1.google.youtube({ version: 'v3', auth: oAuth2Client });
    return { youtube, oAuth2Client };
};
exports.getYouTubeClient = getYouTubeClient;
