import { Request, Response, NextFunction } from 'express';
import ApiError from "../utils/apiError";
import { verifyAccessToken } from "../utils/jwt";
import { UserPayload } from '../types/common';
export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {

  // Assuming access token cookie is named 'accessToken'
  const token = req.cookies?.accessToken;

  if (!token) {
    return next(new ApiError('No token provided', 401));
  }

  try {
    const payload = verifyAccessToken(token) as UserPayload;
    
    // Attach user info to req for downstream handlers
    (req as any).user = payload;
    next();
  } catch {
    next(new ApiError('Invalid or expired token', 401));
  }
};
