import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import getFriendlyAuthError from "../lib/getFriendlyAuthError";
import { auth, db } from "../lib/firebase";
import z from "zod";
import {
  LoginSchema,
  RegisterSchema,
  type LoginInput,
  type RegisterInput,
} from "../schemas/authentication";
import { mdiHelpCircleOutline, mdiArrowLeft } from "@mdi/js";
import { routes } from "../lib/routes";
import { html } from "../lib/html";
import "../style.css";

let isSigningUp: boolean = false;
let isError: boolean = false;
let errorType: "zodError" | "FBError" | "" = "";
let errorMessage: unknown | z.ZodIssue[] = [];

const params = new URLSearchParams(window.location.search);
const modeParam = params.get("mode");

let mode: "login" | "signup" = modeParam === "signup" ? "signup" : "login";

/** Builds the static shell (heading, help slot, form slot, footer) —
 * only called once we know the user is logged out. */
function renderShell() {
  document.querySelector<HTMLDivElement>("#cta")!.innerHTML = html`
    <section
      class="w-full h-screen flex flex-col gap-5 justify-center items-center"
    >
      <h5 id="mode" class="text-lg font-semibold text-gray-500">Welcome to</h5>
      <h1 class="text-4xl font-bold text-zinc-700">r/zen slam poetry</h1>
      <section class="w-1/4 flex flex-row justify-between items-center">
        <div id="back" class="cursor-pointer"></div>
        <div id="help"></div>
      </section>
      <form id="form" class="flex flex-col gap-3 w-1/4"></form>
      <p
        id="errors"
        class="flex flex-col justify-center items-center text-red-500 text-sm"
      ></p>
    </section>
  `;

  renderForm(); // fill in the mode-specific content now that the shell exists
}

/** Renders the authentication form based on the current mode */
function renderForm() {
  const form = document.querySelector<HTMLFormElement>("#form")!;
  const backButton = document.querySelector<HTMLDivElement>("#back")!;
  const helpCircle = document.querySelector<HTMLDivElement>("#help")!;
  const modeText = document.querySelector<HTMLHeadingElement>("#mode")!;

  backButton.innerHTML = html`
    <span
      class="flex flex-row justify-start items-center text-lg font-semibold"
    >
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path d="${mdiArrowLeft}" fill="black" />
      </svg>
      <span>Back</span>
    </span>
  `;

  backButton.addEventListener(
    "click",
    () => (window.location.href = routes.main),
  );

  modeText.textContent = html`${mode === "login"
    ? "Welcome back to"
    : "Create an account to"}`;

  helpCircle.innerHTML = html`
    <div class="group relative top-1">
      <button type="button" class="cursor-help">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="${mdiHelpCircleOutline}" fill="black" />
        </svg>
      </button>
      <div
        class="absolute right-0 top-full mt-2 w-48 rounded-md bg-gray-800 text-white text-xs px-3 py-2 opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 z-10"
      >
        ${mode === "login"
          ? `Enter the email and password you used to sign up. Forgot your password? Click the link below.`
          : `Enter username, email and password twice to sign up.`}
      </div>
    </div>
  `;

  form.innerHTML = html`
    ${mode === "login"
      ? ""
      : `<label for="username" id="usernameLabel" class="text-lg font-semibold">Username</label>
    <input type="text" id="username" placeholder="Your username" class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500">`}
    <label for="email" id="emailLabel" class="text-lg font-semibold"
      >Email</label
    >
    <input
      type="email"
      id="email"
      placeholder="Your email address"
      class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <label for="password" id="passwordLabel" class="text-lg font-semibold"
      >Password</label
    >
    <input
      type="password"
      id="password"
      placeholder="Your password"
      class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    ${mode === "signup"
      ? `<label for="confirmPassword" id="confirmPasswordLabel" class="text-lg font-semibold">Confirm Password</label>
      <input type="password" id="confirmPassword" placeholder="Confirm your password" class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500">`
      : ""}
    <button
      type="submit"
      class="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
    >
      ${mode === "login" ? "Login" : "Sign up"}
    </button>
    <p
      class="flex flex-row ${mode === "login"
        ? "justify-between"
        : "justify-center"} items-center text-base"
    >
      <a
        href="/auth/passwordreset/"
        class="text-sm text-blue-500 cursor-pointer decoration-none"
        >${mode === "login" ? `Forgot my password` : ""}</a
      >
      <span>
        ${mode === "login"
          ? `Don't have an account?`
          : `Already have an account?`}
        <span
          id="authSwitch"
          class="text-blue-500 hover:underline cursor-pointer"
        >
          ${mode === "login" ? `Sign up` : `Login`}</span
        >
      </span>
    </p>
  `;

  form.addEventListener("submit", handleSubmit);

  // form.removeEventListener("submit", handleSubmit);

  document
    .querySelector<HTMLParagraphElement>("#authSwitch")!
    .addEventListener("click", (e) => {
      e.preventDefault();
      mode = mode === "login" ? "signup" : "login";
      isError = false;

      const url = new URL(window.location.href);
      url.searchParams.set("mode", mode);
      window.history.replaceState({}, "", url);

      renderForm();
      renderErrorMessages();
    });
}

function renderErrorMessages() {
  const errorContainer =
    document.querySelector<HTMLParagraphElement>("#errors")!;
  if (isError) {
    if (errorType === "zodError" && Array.isArray(errorMessage)) {
      errorContainer.innerHTML = errorMessage
        .map((issue) => `<p>${issue.message}</p>`)
        .join("");
    } else if (errorType === "FBError" && typeof errorMessage === "string") {
      errorContainer.textContent = errorMessage;
    }
  } else {
    errorContainer.textContent = "";
  }
}

/** validates the signup form data */
async function validateSignup(data: RegisterInput) {
  return await RegisterSchema.parseAsync(data);
}

/** validates the login form data */
async function validateLogin(data: LoginInput) {
  return await LoginSchema.parseAsync(data);
}

/** Handles the form submission based on the current mode
 * into either login or signup, and performs the necessary
 * Firebase operations
 */
async function handleSubmit(e: SubmitEvent) {
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

onAuthStateChanged(auth, (user) => {
  if (user && !isSigningUp) {
    //renderSpinner();
    window.location.href = "/";
  } else {
    renderShell();
  }
});
