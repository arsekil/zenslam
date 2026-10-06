import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { html } from "../lib/html";
import renderForm from "../components/submission/renderForm";
import { routes } from "../lib/routes";
import "../style.css";

document.querySelector<HTMLDivElement>("#submission")!.innerHTML = html`
  <section
    class="w-full max-w-2xl min-h-screen mx-auto flex flex-col justify-center items-center"
  >
    <p class="text-lg font-semibold text-zinc-800">Loading...</p>
  </section>
`;

function renderShell() {
  document.querySelector<HTMLDivElement>("#submission")!.innerHTML = html`
    <section
      class="w-full max-w-2xl min-h-screen mx-auto mt-10 sm:max-5xl:mt-0 px-4 py-4 flex flex-col gap-5 justify-center items-center"
    >
      <h1 class="text-2xl font-bold text-zinc-700">Submit a Zen</h1>
      <div
        id="back"
        class="w-full max-w-2xl flex flex-row justify-items-start items-center gap-2 cursor-pointer"
      ></div>
      <form
        id="form"
        class="w-full max-w-2xl flex flex-col justify-center gap-3 "
      ></form>
      <p id="errors"></p>
    </section>
  `;

  renderForm();
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.replace(routes.cta);
    return;
  } else {
    renderShell();
  }
});
