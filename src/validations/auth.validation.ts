import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must have at least 2 characters")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must have at least 2 characters")
    .max(50, "Last name is too long"),
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(72, "Password cannot exceed 72 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(72, "Password cannot exceed 72 characters"),
});
