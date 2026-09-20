import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import getFriendlyAuthError from "./lib/getFriendlyAuthError";
import { auth, db } from "./lib/firebase";
import z from "zod";
import {
  LoginSchema,
  RegisterSchema,
  type LoginInput,
  type RegisterInput,
} from "./schemas/authentication";
import { mdiHelpCircleOutline } from "@mdi/js";
import firebaseLogo from "./assets/Logomark_Full_Color.png";
import tsLogo from "./assets/typescript.svg";
import viteLogo from "./assets/vite_logo.jpeg";
import tailwindLogo from "./assets/tailwind.svg";
import htmlLogo from "./assets/HTML5.svg";
import zodLogo from "./assets/Zod.svg";
import "./style.css";

let mode: "login" | "signup" = "login";
let isSigningUp: boolean = false;
let isError: boolean = false;
let errorType: "zodError" | "FBError" | "" = "";
let errorMessage: unknown | z.ZodIssue[] = [];

/** Renders the authentication form based on the current mode */
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<section class="w-full h-screen flex flex-col gap-5 justify-center items-center">
    <h5 id="mode" class="text-lg font-semibold text-gray-500">Welcome to</h5>
    <h1 class="text-4xl font-bold text-zinc-700">r/zen slam poetry</h1>
    <div id="help" class="relative w-1/4 flex flex-row justify-end items-center">
    </div>
    <form id="form" class="flex flex-col gap-3 w-1/4"></form>
    <p id="errors" class="flex flex-col justify-center items-center text-red-500 text-sm"></p>
    <span class="flex flex-row justify-center gap-1 text-xs text-semibold">Powered by 
      <a href="https://developer.mozilla.org/en-US/docs/Web/HTML" target="_blank"><img src="${htmlLogo}" alt="HTML5 Logo and Link" width="16" height="16" /></a>
      <a href="https://tailwindcss.com" target="_blank"><img src="${tailwindLogo}" alt="TailwindCSS Logo and Link" width="16" height="16" /></a>
      <a href="https://vite.dev" target="_blank"><img src="${viteLogo}" alt="Vite Logo and Link" width="16" height="16" /></a>
      <a href="https://typescriptlang.org" target="_blank"><img src="${tsLogo}" alt="Typescript Logo and Link" width="16" height="16" /></a>
      <a href="https://firebase.google.com/" target="_blank"><img src="${firebaseLogo}" alt="Firebase Logo and Link" width="16" height="16" /></a>
      <a href="https://zod.dev" target="_blank"><img src="${zodLogo}" alt="Zod Logo and Link" width="16" height="16" /></a>
    </span>
</section>
`;

/** Renders the authentication form based on the current mode */
function renderForm() {
  const form = document.querySelector<HTMLFormElement>("#form")!;
  const helpCircle = document.querySelector<HTMLDivElement>("#help")!;
  const modeText = document.querySelector<HTMLHeadingElement>("#mode")!;

  modeText.textContent = `${mode === "login" ? "Welcome back to" : "Create an account to"}`;

  helpCircle.innerHTML = `
    <div class="group relative">
      <button type="button" class="cursor-pointer">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="${mdiHelpCircleOutline}" fill="black" />
        </svg>
      </button>
      <div class="absolute right-0 top-full mt-2 w-48 rounded-md bg-gray-800 text-white text-xs px-3 py-2 opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 z-10">
        ${mode === "login" ? `Enter the email and password you used to sign up. Forgot your password? Click the link below.` : `Enter username, email and password twice to sign up.`}
      </div>
     </div>
  `;

  form.innerHTML = `
    ${
      mode === "login"
        ? ""
        : `<label for="username" id="usernameLabel" class="text-lg font-semibold">Username</label>
    <input type="text" id="username" placeholder="Your username" class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500">`
    }
    <label for="email" id="emailLabel" class="text-lg font-semibold">Email</label>
    <input type="email" id="email" placeholder="Your email address" class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
    <label for="password" id="passwordLabel" class="text-lg font-semibold">Password</label>
    <input type="password" id="password" placeholder="Your password" class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
    ${
      mode === "signup"
        ? `<label for="confirmPassword" id="confirmPasswordLabel" class="text-lg font-semibold">Confirm Password</label>
      <input type="password" id="confirmPassword" placeholder="Confirm your password" class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500">`
        : ""
    }
    <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">${mode === "login" ? "Login" : "Sign up"}</button>
    <p class="flex flex-row ${mode === "login" ? "justify-between" : "justify-center"} items-center text-base">
        <a href="/passwordreset/" class="text-sm text-blue-500 cursor-pointer decoration-none">${mode === "login" ? `Forgot my password` : ""}</a>
        <span>
        ${mode === "login" ? `Don't have an account?` : `Already have an account?`}
        <span id="authSwitch" class="text-blue-500 hover:underline cursor-pointer">
        ${mode === "login" ? `Sign up` : `Login`}</span>
        </span>
    </p>
  `;

  document
    .querySelector<HTMLFormElement>("#form")!
    .addEventListener("submit", handleSubmit);

  document
    .querySelector<HTMLParagraphElement>("#authSwitch")!
    .addEventListener("click", (e) => {
      e.preventDefault();
      mode = mode === "login" ? "signup" : "login";
      isError = false;
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
      window.location.href = "/account/";
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
    window.location.href = "/account/";
  }
});

renderForm();

//TODO: Add reCAPTCHA Enterprise integration later
// const script = document.createElement("script");
// script.src = `https://www.google.com/recaptcha/enterprise.js?render=${import.meta.env.VITE_RECAPTCHA_KEY_ID}`;
// document.head.appendChild(script);
