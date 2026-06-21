import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

const JWT_SECRET = process.env.SESSION_SECRET ?? "househunt-secret-key";

export interface JwtPayload {
  userId: number;
  role: "admin" | "owner" | "renter";
  isApproved: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn({ err }, "Invalid JWT token");
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: ("admin" | "owner" | "renter")[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}

export function requireApprovedOwner(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.user.role !== "owner" && req.user.role !== "admin") {
    res.status(403).json({ error: "Forbidden: owners only" });
    return;
  }
  if (req.user.role === "owner" && !req.user.isApproved) {
    res.status(403).json({ error: "Your owner account is pending approval" });
    return;
  }
  next();
}
