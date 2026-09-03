import { PrismaClient } from "@prisma/client";
import { prisma } from "./config/prisma";
import type { Request } from "express";

export interface GraphQLContext {
  prisma: PrismaClient;
  req?: Request | any;
}

export async function buildContext(req?: Request | any): Promise<GraphQLContext> {
  return {
    prisma,
    req,
  };
}
