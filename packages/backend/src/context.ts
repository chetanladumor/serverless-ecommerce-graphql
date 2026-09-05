import { PrismaClient } from "@prisma/client";
import { prisma } from "./config/prisma";
import { redis } from "./config/redis";
import { verifyToken, TokenPayload } from "./services/authService";
import type { Request } from "express";
import type Redis from "ioredis";

export interface GraphQLContext {
  prisma: PrismaClient;
  redis: Redis;
  currentUser: TokenPayload | null;
  req?: Request | any;
}

export async function buildContext(req?: Request | any): Promise<GraphQLContext> {
  let currentUser: TokenPayload | null = null;

  const authHeader = req?.headers?.authorization || req?.headers?.Authorization;

  if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) {
      currentUser = verifyToken(token);
    }
  }

  return {
    prisma,
    redis,
    currentUser,
    req,
  };
}
