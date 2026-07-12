import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { verifyToken } from "@/utils/jwt";
import { AppError } from "@/utils/AppError";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new AppError(401, "Missing or invalid Authorization header"));
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new AppError(401, "Invalid or expired session"));
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "Not authenticated"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "You do not have permission to perform this action"));
    }
    next();
  };
}
