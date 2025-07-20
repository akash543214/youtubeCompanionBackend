"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.instructor = exports.groq = void 0;
// lib/groqClient.ts
const groq_sdk_1 = require("groq-sdk");
const instructor_1 = __importDefault(require("@instructor-ai/instructor"));
exports.groq = new groq_sdk_1.Groq({
    apiKey: process.env.GROQ_API_KEY,
});
exports.instructor = (0, instructor_1.default)({
    client: exports.groq,
    mode: "TOOLS"
});
//# sourceMappingURL=grogClient.js.map