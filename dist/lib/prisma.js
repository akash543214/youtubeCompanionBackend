"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prisma = exports.prisma = void 0;
// src/lib/prisma.ts
const index_1 = require("../generated/prisma/index");
Object.defineProperty(exports, "Prisma", { enumerable: true, get: function () { return index_1.Prisma; } });
;
const globalForPrisma = globalThis;
exports.prisma = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : new index_1.PrismaClient();
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
