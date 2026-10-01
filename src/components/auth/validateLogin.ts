import { LoginSchema, type LoginInput } from "../../schemas/authentication";

/** validates the login form data */
export default async function validateLogin(data: LoginInput) {
  return await LoginSchema.parseAsync(data);
}