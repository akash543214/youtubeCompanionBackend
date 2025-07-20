import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import ApiError from '../utils/apiError';
import { UserPayload } from '../types/common';
import { prisma } from '../lib/prisma';
import { generateAccessToken,generateRefreshToken } from '../utils/jwt';



const googleCallbackHandler = asyncHandler(async (req: Request, res: Response) => {

  
    // req.user should contain the user directly from Passport
    const user = req.user as any; 
const googleAccessToken = user.googleAccessToken;
const googleRefreshToken = user.googleRefreshToken;

    if (!user) {
        throw new ApiError("Authentication failed", 401);
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

    // Save refresh token to database
await prisma.user.update({
  where: { id: user.id },
  data: {
    refreshToken, // your app refresh token
    googleAccessToken,
    googleRefreshToken
  }
});

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const
    };
    const redirectURL = process.env.GOOGLE_REDIRECT;
    
    if (!redirectURL) {
        throw new ApiError("Google redirect URL is not configured", 500);
    }
    res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options).redirect(redirectURL);
});

const verifyLoginSession = asyncHandler(async (req: Request, res: Response) => {
    
  const user = req.user as UserPayload;

    if (!user || !user.email) {
        throw new ApiError("Unauthorized", 401);
    }

    const userData = await prisma.user.findUnique({
        where: { email: user.email },
    });

    if (!userData) {
        throw new ApiError("User not found", 404);
    }

    const {  refreshToken: _refreshToken, ...userDataWithoutPassword } = userData;

    res.status(200).json(
        new ApiResponse(200, userDataWithoutPassword, "Login verified")
    );
});

const healthCheck = (req:Request, res: Response)=>{

 res.status(200).json(
        new ApiResponse(200, {}, "health check completed in production s")
    );

}
export {
    googleCallbackHandler,
    verifyLoginSession,
    healthCheck
}    