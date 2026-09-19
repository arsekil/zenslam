import * as z from "zod";

export const LoginSchema = z.object({
  email: z.email(),
  password: z.coerce.string().min(12, "Password must be at least 12 characters long"),
}).required();

export const RegisterSchema = z.object({
  username: z.coerce.string().min(3, "Username must be at least 3 characters long"),
  email: z.email(),
  password: z.coerce.string().min(12, "Password must be at least 12 characters long"),
  confirmPassword: z.coerce.string().min(12, "Confirmed password must be at least 12 characters long"),
}).required().refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match"
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;