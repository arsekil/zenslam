import { onAuthStateChanged, type User } from "firebase/auth";
import renderForm from "../components/edit/renderForm";
import { auth } from "../lib/firebase";
import { html } from "../lib/html";
import { routes } from "../lib/routes";
import "../style.css";

document.querySelector<HTMLDivElement>("#edit")!.innerHTML = html`
  <section
    class="w-full max-w-2xl min-h-screen mx-auto flex flex-col justify-center items-center"
  >
    <p class="text-lg font-semibold text-zinc-800">Loading...</p>
  </section>
`;

function renderEdit() {
  document.querySelector<HTMLDivElement>("#edit")!.innerHTML = html`
    <section
      class="w-full max-w-2xl min-h-screen mx-auto mt-10 sm:max-5xl:mt-0 px-4 py-4 flex flex-col gap-5 justify-center items-center"
    >
      <article class="w-full flex flex-row justify-start items-center">
        <div
          id="back"
          class="flex flex-row justify-start items-center cursor-pointer"
        ></div>
        <h1
          class="w-[calc(100%-200px)] flex flex-row items-center justify-center text-2xl font-bold text-zinc-700"
        >
          Edit your Zen
        </h1>
      </article>
      <form
        id="form"
        class="w-full max-w-2xl flex flex-col justify-center gap-3 "
      ></form>
      <p id="errors"></p>
    </section>
  `;

  renderForm();
}

onAuthStateChanged(auth, (user: User | null) => {
  if (!user) {
    window.location.href = routes.cta;
    return;
  } else {
    renderEdit();
  }
});
