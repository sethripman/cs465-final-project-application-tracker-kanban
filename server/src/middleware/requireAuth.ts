import type { NextFunction, Request, Response } from "express";
import { getTokenCookieName, verifyToken } from "../lib/auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = req.cookies[getTokenCookieName()];

    if (!token) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const payload = verifyToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}