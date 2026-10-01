import z from "zod";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { auth, db } from "../../lib/firebase";
import getFriendlyAuthError from "../../lib/getFriendlyAuthError";
import renderErrorMessages from "./renderErrorMessages";
import validateSignup from "../../components/auth/validateSignup";
import validateLogin from "../../components/auth/validateLogin";

let isSigningUp: boolean = false;
let isError: boolean = false;
let errorType: "zodError" | "FBError" | "" = "";
let errorMessage: unknown | z.ZodIssue[] = [];

const params = new URLSearchParams(window.location.search);
const modeParam = params.get("mode");

let mode: "login" | "signup" = modeParam === "signup" ? "signup" : "login";

/** Handles the form submission based on the current mode
 * into either login or signup, and performs the necessary
 * Firebase operations
 */
export default async function handleSubmit(e: SubmitEvent) {
  e.preventDefault();

  const email = document.querySelector<HTMLInputElement>("#email")!.value;
  const password = document.querySelector<HTMLInputElement>("#password")!.value;

  try {
    if (mode === "signup") {
      isSigningUp = true;
      const usernameInput =
        document.querySelector<HTMLInputElement>("#username")!;
      const confirmPasswordInput =
        document.querySelector<HTMLInputElement>("#confirmPassword")!;

      /** signup form validator function */
      await validateSignup({
        username: usernameInput.value,
        email: email,
        password: password,
        confirmPassword: confirmPasswordInput.value,
      });

      /** email/password signup feedback with User object */
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      /** update user profile with displayName */
      await updateProfile(auth?.currentUser!, {
        displayName: usernameInput.value,
      });

      /** create copy of User object ins FIrestore */
      await setDoc(doc(db, "users", userCredential.user.uid), {
        displayName: usernameInput.value,
        email: userCredential.user.email,
        createdAt: new Date(),
      });

      /** send email verification email to newly created users email address */
      await sendEmailVerification(auth?.currentUser!);

      isSigningUp = false;
      isError = false;
      window.location.href = "/";
    } else {
      await validateLogin({ email, password });
      await signInWithEmailAndPassword(auth, email, password);
      isError = false;
    }
  } catch (error: any) {
    isSigningUp = false;
    if (error instanceof FirebaseError) {
      isError = true;
      errorType = "FBError";
      errorMessage = getFriendlyAuthError(error.code);
    } else if (error instanceof z.ZodError) {
      isError = true;
      errorType = "zodError";
      errorMessage = error.issues;
    }
  }

  renderErrorMessages();
}