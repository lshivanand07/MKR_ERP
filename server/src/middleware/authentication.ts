/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

const authentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token missing",
    });
  }

  const token = header.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token missing",
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as JwtPayload;

    // Validate token payload
    if (
      !decoded.id ||
      !decoded.email ||
      !decoded.role
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    // Store decoded token details in request
    (req as any).user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authentication;