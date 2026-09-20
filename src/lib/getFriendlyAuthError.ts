/** Returns a user-friendly error message based on the Firebase authentication error code
 * @param code The Firebase authentication error code
 * @returns A user-friendly error message
 */
function getFriendlyAuthError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "That email is already registered — try logging in instead.";
    case "auth/invalid-email":
      return "That doesn't look like a valid email address.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts — please wait a bit and try again.";
    case "auth/expired-action-code":
      return "Password reset action code has expired";
    case "auth/invalid-action-code":
      return "Password reset action code is invalid";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default getFriendlyAuthError;
