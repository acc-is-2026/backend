import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { UpdateUserInput } from "../types/user.type";

export class UserService {
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return prisma.user.delete({
      where: { id },
    });
  }

  async updateUserProfile(userId: string, data: UpdateUserInput) {
    let normalizedEmail: string | undefined;

    if (data.email) {
      normalizedEmail = data.email.trim().toLowerCase();

      const existingUser = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw new Error("EMAIL_ALREADY_IN_USE");
      }
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.firstName !== undefined && {
            firstName: data.firstName.trim(),
          }),
          ...(data.lastName !== undefined && {
            lastName: data.lastName.trim(),
          }),
          ...(normalizedEmail !== undefined && { email: normalizedEmail }),
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return { user: updatedUser };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Error("USER_NOT_FOUND");
      }
      throw error;
    }
  }
}
