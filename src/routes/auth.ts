import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { html } from "../lib/html";
import renderForm from "../components/auth/renderForm";
import "../style.css";

let isSigningUp: boolean = false;

/** Builds the static shell (heading, help slot, form slot, footer) —
 * only called once we know the user is logged out. */
function renderShell() {
  document.querySelector<HTMLDivElement>("#cta")!.innerHTML = html`
    <section
      class="w-full max-w-sm min-h-screen mx-auto flex flex-col gap-5 justify-center items-center"
    >
      <h5 id="mode" class="text-lg font-semibold text-gray-500">Welcome to</h5>
      <h1 class="text-4xl font-bold text-zinc-700">r/zen slam poetry</h1>
      <section class="w-full flex flex-row justify-between items-center">
        <div id="back" class="cursor-pointer"></div>
        <div id="help"></div>
      </section>
      <form id="form" class="flex flex-col gap-3 w-full"></form>
      <p
        id="errors"
        class="flex flex-col justify-center items-center text-red-500 text-sm"
      ></p>
    </section>
  `;

  renderForm(); // fill in the mode-specific content now that the shell exists
}

onAuthStateChanged(auth, (user) => {
  if (user && !isSigningUp) {
    //renderSpinner();
    window.location.href = "/";
  } else {
    renderShell();
  }
});
