import {
  mdiHelpCircleOutline,
  mdiArrowLeft,
  mdiEyeOutline,
  mdiEyeOffOutline,
} from "@mdi/js";
import renderErrorMessages from "../auth/renderErrorMessages";
import handleSubmit from "../auth/handleSubmit";
import { routes } from "../../lib/routes";
import { html } from "../../lib/html";

const params = new URLSearchParams(window.location.search);
const modeParam = params.get("mode");

let isError: boolean = false;
let mode: "login" | "signup" = modeParam === "signup" ? "signup" : "login";

/** Renders the authentication form based on the current mode */
export default function renderForm() {
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
    <div class="relative">
      <input
        type="password"
        id="password"
        placeholder="Your password"
        class="w-full border border-gray-300 rounded-md py-2 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="button"
        id="toggle"
        class="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="${mdiEyeOffOutline}" fill="gray" />
        </svg>
      </button>
    </div>
    ${mode === "signup"
      ? html`<label
            for="confirmPassword"
            id="confirmPasswordLabel"
            class="text-lg font-semibold"
            >Confirm Password</label
          >
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm your password"
            class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />`
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

  const passwordInput = document.querySelector<HTMLInputElement>("#password")!;
  const toggleButton = document.querySelector<HTMLSpanElement>("#toggle")!;
  toggleButton.addEventListener("click", () => {
    const isHidden = passwordInput?.type === "password";
    passwordInput.type = isHidden ? "text" : "password";

    toggleButton.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path d="${isHidden ? mdiEyeOffOutline : mdiEyeOutline}" fill="gray" />
    </svg>
  `;
  });

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
