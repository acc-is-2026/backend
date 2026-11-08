import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const [scheme, token] = authHeader?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      error: "Access forbidden. Bearer token is missing or invalid.",
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET is not defined in .env file.");
    return res.status(500).json({
      error: "Server configuration is invalid.",
    });
  }

  let decoded: jwt.JwtPayload;

  try {
    const payload = jwt.verify(token, secret);

    if (typeof payload === "string" || !payload.id) {
      return res.status(401).json({
        error: "Invalid token.",
      });
    }

    decoded = payload;
  } catch {
    return res.status(401).json({
      error: "Token is invalid or expired.",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id as string },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "User is inactive or no longer exists.",
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return res.status(500).json({
      error: "Internal server error.",
    });
  }
};
