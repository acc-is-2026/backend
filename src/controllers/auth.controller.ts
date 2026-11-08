import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: "First name, last name, email, and password are required.",
      });
    }

    try {
      const result = await this.authService.registerUser({
        firstName,
        lastName,
        email,
        password,
      });

      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === "USER_ALREADY_EXISTS") {
        return res
          .status(409)
          .json({ error: "An account with this email already exists." });
      }

      console.error("Register error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    try {
      const result = await this.authService.loginUser(email, password);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({ error: "Incorrect email or password." });
      }

      console.error("Login error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email address is required." });
    }

    try {
      await this.authService.forgotPassword(email);

      return res.status(200).json({
        message: "A reset password link was sent at the email address.",
      });
    } catch (error) {
      console.error("Forgot-password error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "The token and the new password are required." });
    }

    try {
      await this.authService.resetPassword(token, newPassword);

      return res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
      if (error instanceof Error && error.message === "USER_NOT_FOUND") {
        return res.status(404).json({ error: "User not found." });
      }

      if (error instanceof Error && error.message === "INVALID_TOKEN") {
        return res
          .status(401)
          .json({ error: "Password reset link is invalid or expired." });
      }

      console.error("Reset password error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };
}
