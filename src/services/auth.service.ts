import prisma from "../prisma";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { EmailService } from "./email.service";
import { CreateUserInput } from "../types/user.type";

export class AuthService {
  private emailService = new EmailService();

  async registerUser(data: CreateUserInput) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new Error("USER_ALREADY_EXISTS");
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        watchlists: {
          create: {
            name: "Watchlist",
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in .env file.");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      secret,
      { expiresIn: "24h" },
    );

    return {
      token,
      user,
    };
  }

  async loginUser(email: string, passwordString: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isMatch = await bcryptjs.compare(passwordString, user.password);

    if (!isMatch) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in .env file.");
    }

    const payload = {
      id: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, secret, { expiresIn: "24h" });

    return {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  async forgotPassword(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return null;
    }

    const resetSecret = process.env.JWT_RESET_SECRET;
    if (!resetSecret) {
      throw new Error("JWT_RESET_SECRET is not defined in .env file.");
    }

    const resetToken = jwt.sign(
      {
        id: user.id,
        type: "password-reset",
      },
      resetSecret,
      { expiresIn: "15m" },
    );

    void this.emailService
      .sendPasswordResetEmail(
        {
          name: user.firstName,
          email: user.email,
        },
        resetToken,
      )
      .catch((error) => {
        console.error("Password reset email failed:", error);
      });

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetSecret = process.env.JWT_RESET_SECRET;

    if (!resetSecret) {
      throw new Error("JWT_RESET_SECRET is not defined in .env file.");
    }

    let decoded: jwt.JwtPayload;

    try {
      const payload = jwt.verify(token, resetSecret);

      if (
        typeof payload === "string" ||
        payload.type !== "password-reset" ||
        typeof payload.id !== "string"
      ) {
        throw new Error("INVALID_TOKEN");
      }

      decoded = payload;
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_TOKEN") {
        throw error;
      }

      throw new Error("INVALID_TOKEN");
    }

    const passwordHash = await bcryptjs.hash(newPassword, 10);

    const updatedResult = await prisma.user.updateMany({
      where: { id: decoded.id },
      data: { password: passwordHash },
    });

    if (updatedResult.count === 0) {
      throw new Error("USER_NOT_FOUND");
    }
  }
}
