import { z } from "zod";

export const userIdParamSchema = z.object({
  id: z.uuid(),
});

export const updateProfileSchema = z
  .object({
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
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });
