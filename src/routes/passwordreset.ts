import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";
import firebaseLogo from "../assets/Logomark_Full_Color.png";
import tsLogo from "../assets/typescript.svg";
import viteLogo from "../assets/vite_logo.jpeg";
import tailwindLogo from "../assets/tailwind.svg";
import htmlLogo from "../assets/HTML5.svg";
import zodLogo from "../assets/Zod.svg";
import "../style.css";

document.querySelector<HTMLDivElement>("#reset")!.innerHTML = `
  <section class="w-full h-screen flex flex-col gap-5 justify-center items-center">
    <form id="form" class="flex flex-col gap-3 w-1/4"></form>
    <p id="message"></p>
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

function renderForm() {
  const form = document.querySelector<HTMLFormElement>("#form")!;

  form.innerHTML = `
    <label for="email" id="emailLabel" class="text-lg font-semibold">Email</label>
    <input type="email" id="email" placeholder="Your email address" class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
    <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">Send</button>`;

  document
    .querySelector<HTMLFormElement>("#form")!
    .addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.querySelector<HTMLInputElement>("#email")!.value;
      handleSubmit(email);
    });
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
