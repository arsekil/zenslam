import { RegisterSchema, type RegisterInput } from "../../schemas/authentication";

/** validates the signup form data */
export default async function validateSignup(data: RegisterInput) {
  return await RegisterSchema.parseAsync(data);
}