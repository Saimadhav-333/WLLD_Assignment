import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";

export type AuthRole = "brand" | "creator";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: AuthRole;
  };
}

interface TokenPayload extends JwtPayload {
  role: AuthRole;
}

export const authenticate: RequestHandler = (
  req,
  _res,
  next
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication token is required");
    }

    const token = authorization.slice(7);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === "string" ||
      !decoded.sub ||
      (decoded as TokenPayload).role === undefined
    ) {
      throw new ApiError(401, "Invalid authentication token");
    }

    
    const payload = decoded as TokenPayload;

    if (
    typeof payload.sub !== "string" ||
    !["brand", "creator"].includes(payload.role)
    ) {
    throw new ApiError(401, "Invalid authentication token");
    }

    authReq.user = {
    id: payload.sub,
    role: payload.role,
    };


    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      next(new ApiError(401, "Invalid or expired token"));
      return;
    }

    next(error);
  }
};

export function authorize(...roles: AuthRole[]): RequestHandler {
  return (req, _res, next) => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      next(new ApiError(401, "Authentication required"));
      return;
    }

    if (!roles.includes(authReq.user.role)) {
      next(new ApiError(403, "You do not have permission"));
      return;
    }

    next();
  };
}
