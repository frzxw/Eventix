import { PrismaClient } from "@prisma/client";

// Single Prisma client instance for Azure Functions
// In Functions, cold starts create new instances; this keeps one per worker
const prisma = new PrismaClient();

export default prisma;
