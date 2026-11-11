
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const adminAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // 1. Get Authorization header
    const authHeader = req.headers.authorization;

console.log("--------------------------------");
console.log("Request Method:", req.method);
console.log("Request URL:", req.originalUrl);
console.log("Authorization Header:", authHeader);
console.log("--------------------------------");

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "Authorization header is missing. Please login first.",
      });
      return;
    }

    // 2. Extract Bearer token
    const [scheme, token] = authHeader.trim().split(/\s+/);

    if (
      scheme?.toLowerCase() !== "bearer" ||
      !token ||
      token.toLowerCase() === "undefined" ||
      token.toLowerCase() === "null"
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid authorization format. Use Bearer <token>.",
      });
      return;
    }

    // 3. Check JWT secret
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is not configured.");

      res.status(500).json({
        success: false,
        message: "Server authentication configuration error.",
      });
      return;
    }

    // 4. Verify JWT token
    const decoded = jwt.verify(token, secret) as {
      id: number;
      email: string;
      role: string;
    };

    // 5. Validate user information
    if (!decoded.id || !decoded.email || !decoded.role) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token payload.",
      });
      return;
    }

    // 6. Allow only admin and superadmin
    if (!["admin", "superadmin"].includes(decoded.role.toLowerCase())) {
      res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
      return;
    }

    // 7. Attach authenticated user to request
    (req as AuthRequest).user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    // 8. Continue
    next();

  } catch (error) {
    console.error("Admin authentication error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Authentication token has expired. Please login again.",
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Authentication failed due to a server error.",
    });
  }
};
