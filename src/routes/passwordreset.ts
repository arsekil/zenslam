import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";
import { mdiArrowLeft, mdiHelpCircleOutline } from "@mdi/js";
import { html } from "../lib/html";
import { routes } from "../lib/routes";
import "../style.css";

document.querySelector<HTMLDivElement>("#reset")!.innerHTML = html`
  <section
    class="w-full h-screen flex flex-col gap-5 justify-center items-center"
  >
    <section class="w-1/4 flex flex-row justify-between items-center">
      <div
        id="back"
        class="w-1/4 flex flex-row items-start gap-2 cursor-pointer"
      ></div>
      <div id="help"></div>
    </section>
    <form id="form" class="flex flex-col gap-3 w-1/4"></form>
    <p id="message"></p>
  </section>
`;

function renderForm() {
  const form = document.querySelector<HTMLFormElement>("#form")!;
  const backButton = document.querySelector<HTMLDivElement>("#back")!;
  const helpCircle = document.querySelector<HTMLDivElement>("#help")!;

  form.innerHTML = html` <label
      for="email"
      id="emailLabel"
      class="text-lg font-semibold"
      >Email</label
    >
    <input
      type="email"
      id="email"
      placeholder="Your email address"
      class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      type="submit"
      class="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
    >
      Reset password
    </button>`;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.querySelector<HTMLInputElement>("#email")!.value;
    handleSubmit(email);
  });

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
    () => (window.location.href = routes.cta),
  );

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
        Enter your email address to send a password reset link.
      </div>
    </div>
  `;
}

function showMessage(message: string) {
  const messageBox = document.querySelector<HTMLParagraphElement>("#message")!;
  messageBox.className =
    "w-1/4 text-white text-sm py-2 px-4 rounded-md bg-green-600 ring-white ring-4";
  messageBox.innerText = message;
}

async function handleSubmit(email: string) {
  const actionCodeSettings = {
    url: `${import.meta.env.VITE_APP_URL}/`,
    handleCodeInApp: true,
  };

  console.log(import.meta.env.VITE_APP_URL);
  try {
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    showMessage(
      "If that email is registered, a password reset link has been sent.",
    );
  } catch (error) {
    if (error) {
      console.error(error);
      showMessage(
        "If that email is registered, a password reset link has been sent.",
      );
    }
  }
}

renderForm();
