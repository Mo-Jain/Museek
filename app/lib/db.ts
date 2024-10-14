import { PrismaClient } from "@prisma/client";

export const prismaClient  = new PrismaClient();
//this isn't the best, we should introduce a singleton here