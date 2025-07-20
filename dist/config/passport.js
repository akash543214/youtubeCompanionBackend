"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const prisma_1 = require("../lib/prisma");
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.GOOGLE_CALLBACK_DOMAIN}/api/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
    var _a;
    try {
        let user = await prisma_1.prisma.user.findUnique({
            where: { googleId: profile.id }
        });
        if (!user) {
            user = await prisma_1.prisma.user.create({
                data: {
                    name: profile.displayName,
                    email: ((_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value) || "",
                    googleId: profile.id,
                },
            });
        }
        return done(null, Object.assign(Object.assign({}, user), { googleAccessToken: accessToken, googleRefreshToken: refreshToken }));
    }
    catch (err) {
        return done(err, false);
    }
}));
