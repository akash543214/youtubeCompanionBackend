import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from '../lib/prisma';


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.GOOGLE_CALLBACK_DOMAIN}/api/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id }
        });
        
        if (!user) {
          user = await prisma.user.create({
            data: {
              name: profile.displayName,
              email: profile.emails?.[0].value || "",
              googleId: profile.id,
             
            },
          });

        
        }
               
        return done(null,  {
  ...user,
  googleAccessToken: accessToken,
  googleRefreshToken: refreshToken
});
      } catch (err) {
        return done(err as Error, false);
      }
    }
  )
);  

