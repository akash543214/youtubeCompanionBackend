"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./lib/prisma");
const PORT = process.env.PORT || 3000;
const server = app_1.default.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
process.on('SIGINT', async () => {
    await prisma_1.prisma.$disconnect();
    server.close(() => {
        console.log('Server shut down gracefully');
        process.exit(0);
    });
});
