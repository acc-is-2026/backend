import { Request, Response } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  private userService = new UserService();

  getMe = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    try {
      const result = await this.userService.getMe(userId);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === "USER_NOT_FOUND") {
        return res.status(404).json({ error: "User not found." });
      }

      console.error("Get /me error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  deleteMe = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    try {
      await this.userService.deleteUser(userId);
      return res.status(200).json({ message: "Account deleted successfully." });
    } catch (error) {
      if (error instanceof Error && error.message === "USER_NOT_FOUND") {
        return res.status(404).json({ error: "User not found." });
      }

      console.error("Delete account error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  updateProfile = async (req: Request, res: Response) => {
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({
        error: "Unauthorized: Invalid or missing token.",
      });
    }

    const { firstName, lastName, email } = req.body;

    try {
      const { user } = await this.userService.updateUserProfile(currentUserId, {
        firstName,
        lastName,
        email,
      });

      return res.status(200).json({
        message: "Profile updated successfully.",
        user,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "EMAIL_ALREADY_IN_USE") {
          return res.status(409).json({
            error: "This email is already in use by another account.",
          });
        }
        if (error.message === "USER_NOT_FOUND") {
          return res.status(404).json({ error: "User not found." });
        }
      }

      console.error("Update profile error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };
}
