import { Router } from "express";
import {
    googleCallbackHandler,
    verifyLoginSession,
    healthCheck
} from '../controllers/user.controller';
import { createValidationMiddleware } from "../utils/createValidationMiddleware";
import { UpdateProfileSchema } from "../schemas/user.schema";
import passport from "passport";
import { verifyJWT } from "../middlewares/auth.middleware";

const validateUpdateUser = createValidationMiddleware(UpdateProfileSchema);

const router = Router();


router.route('/verify-login').post(verifyJWT,verifyLoginSession);
router.route('/health').get(healthCheck);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/youtube",
      "https://www.googleapis.com/auth/youtube.force-ssl"
    ],
    accessType: "offline", // IMPORTANT for refresh token
    prompt: "consent"       // Forces Google to return refresh token every time
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallbackHandler // <-- This controller sends accessToken + refreshToken
);  

export default router; 