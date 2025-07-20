// utils/googleClient.ts
import { google } from 'googleapis';
import { prisma } from '../lib/prisma';

export const getYouTubeClient = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.googleAccessToken || !user.googleRefreshToken) {
    throw new Error("Google tokens missing");
  }

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.GOOGLE_CALLBACK_DOMAIN}/api/google/callback`
  );

  oAuth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
  });

  const youtube = google.youtube({ version: 'v3', auth: oAuth2Client });
  return { youtube, oAuth2Client };
};
