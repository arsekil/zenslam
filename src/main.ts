import {
  mdiAccountCircleOutline,
  mdiAccountPlusOutline,
  mdiFeather,
  mdiLogin,
  mdiLogout,
  mdiYinYang,
} from "@mdi/js";
import { FirebaseError } from "firebase/app";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import { type PoemDocument } from "../src/types/PoemDocument";
import firebaseLogo from "./assets/Logomark_Full_Color.png";
import tsLogo from "./assets/typescript.svg";
import viteLogo from "./assets/vite_logo.jpeg";
import tailwindLogo from "./assets/tailwind.svg";
import htmlLogo from "./assets/HTML5.svg";
import zodLogo from "./assets/Zod.svg";
import { html } from "./lib/html";
import "./style.css";

/** Renders the authentication form based on the current mode */
document.querySelector<HTMLDivElement>("#app")!.innerHTML = html`
  <section
    class="w-full h-screen flex flex-col gap-5 justify-center items-center"
  >
    <p class="text-zinc-800">Loading…</p>
  </section>
`;

function renderShell() {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = html`
    <section
      class="w-full h-screen flex flex-col justify-center items-center gap-5"
    >
      <article class="flex flex-row justify-center items-center gap-4">
        <svg viewBox="0 0 28 28" width="28" height="28">
          <path d="${mdiYinYang}" />
        </svg>
        <h1 class="text-4xl font-bold text-zinc-700">r/zen slam poetry</h1>
        <svg viewBox="0 0 28 28" width="28" height="28">
          <path d="${mdiFeather}" />
        </svg>
      </article>
      <article class="w-1/2 max-h-screen flex flex-col gap-3">
        <div id="cta"></div>
        <div id="signout"></div>
        <div id="poem-feed"></div>
      </article>
      <span class="flex flex-row justify-center gap-1 text-xs text-semibold"
        >Powered by
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/HTML"
          target="_blank"
          ><img
            src="${htmlLogo}"
            alt="HTML5 Logo and Link"
            width="16"
            height="16"
        /></a>
        <a href="https://tailwindcss.com" target="_blank"
          ><img
            src="${tailwindLogo}"
            alt="TailwindCSS Logo and Link"
            width="16"
            height="16"
        /></a>
        <a href="https://vite.dev" target="_blank"
          ><img
            src="${viteLogo}"
            alt="Vite Logo and Link"
            width="16"
            height="16"
        /></a>
        <a href="https://typescriptlang.org" target="_blank"
          ><img
            src="${tsLogo}"
            alt="Typescript Logo and Link"
            width="16"
            height="16"
        /></a>
        <a href="https://firebase.google.com/" target="_blank"
          ><img
            src="${firebaseLogo}"
            alt="Firebase Logo and Link"
            width="16"
            height="16"
        /></a>
        <a href="https://zod.dev" target="_blank"
          ><img src="${zodLogo}" alt="Zod Logo and Link" width="16" height="16"
        /></a>
      </span>
    </section>
  `;
}

function renderCTA() {
  document.querySelector<HTMLDivElement>("#cta")!.innerHTML = html`
    <article class="flex flex-row items-center justify-center gap-6">
      <a
        href="/auth/cta/?mode=login"
        class="py-6 px-8 bg-pink-200 rounded-full cursor-pointer flex flex-row justify-center intems-center gap-2"
      >
        <svg viewBox="0 0 28 28" width="28" height="28">
          <path d="${mdiLogin}" fill="black" />
        </svg>
        Log In
      </a>
      <a
        href="/auth/cta/?mode=signup"
        class="py-6 px-8 text-white bg-blue-600 rounded-full cursor-pointer flex flex-row justify-center intems-center gap-2"
      >
        <svg viewBox="0 0 28 28" width="28" height="28">
          <path d="${mdiAccountPlusOutline}" fill="black" />
        </svg>
        Sign Up
      </a>
    </article>
  `;
}

function renderLogout() {
  document.querySelector<HTMLButtonElement>("#signout")!.innerHTML = html`
    <article class="flex flex-row items-center justify-center gap-6">
      <a
        href="/account/"
        class="py-6 px-8 bg-cyan-600 rounded-full cursor-pointer flex flex-row justify-center intems-center gap-2"
      >
        <svg viewBox="0 0 28 28" width="28" height="28">
          <path d="${mdiAccountCircleOutline}" fill="black" />
        </svg>
        Account
      </a>
      <button
        type="button"
        id="logout"
        class="py-6 px-8 bg-orange-500 rounded-full cursor-pointer flex flex-row justify-center intems-center gap-2"
      >
        <svg viewBox="0 0 28 28" width="28" height="28">
          <path d="${mdiLogout}" fill="black" />
        </svg>
        Log Out
      </button>
    </article>
  `;

  document
    .querySelector<HTMLButtonElement>("#logout")!
    .addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = "/";
      } catch (error) {
        if (error instanceof FirebaseError) {
          console.error("Error signing out:", error);
        }
      }
    });
}

//TODO
function poemRatings(poem: Pick<PoemDocument, "avgRating" | "ratingCount">) {
  const { avgRating, ratingCount } = poem;

  if (ratingCount === 0) {
    return { display: "No ratings yet" };
  }

  return {
    display: `${avgRating.toFixed(1)} * (${ratingCount})}`,
    avgRating,
    ratingCount,
  };
}

function formatDate(date: Date | null) {
  if (!date) return "Just now";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

async function renderFeed() {
  try {
    const feedQuery = query(
      collection(db, "poems"),
      where("isPublic", "==", true),
    );
    const feedQuerySnapshot = await getDocs(feedQuery);

    const poemsHTML = feedQuerySnapshot.docs
      .map((entry) => {
        const poem = entry.data() as PoemDocument;
        const ratings = poemRatings(poem);
        if (poem.isPublic === true) {
          return html`
            <section
              class="w-full flex flex-row justify-between border rounded-md p-4"
            >
              <article class="max-w-20">
                <h3 class="font-semibold">${poem.title}</h3>
              </article>
              <article>${String(ratings.display)}</article>
              <section class="flex flex-row gap-1">
                <article class="">
                  <p>
                    posted by
                    <span class="no-underline text-blue-500 cursor-pointer"
                      >${poem.displayName}</span
                    >
                  </p>
                </article>
                <article class="">
                  <p>on ${formatDate(poem.createdAt.toDate())}</p>
                </article>
              </section>
            </section>
          `;
        }
      })
      .join("");

    document.querySelector<HTMLDivElement>("#poem-feed")!.innerHTML = html`
      <section class="flex flex-col gap-4 justify-center items-center">
        ${poemsHTML.length > 0 ? poemsHTML : "No public poems yet."}
      </section>
    `;
  } catch (error) {
    console.error(error);
  }
}

renderShell();

onAuthStateChanged(auth, (user) => {
  if (user) {
    renderShell();
    renderLogout();
    renderFeed();
  } else {
    renderShell();
    renderCTA();
    renderFeed();
  }
});

//TODO: Add reCAPTCHA Enterprise integration later
// const script = document.createElement("script");
// script.src = `https://www.google.com/recaptcha/enterprise.js?render=${import.meta.env.VITE_RECAPTCHA_KEY_ID}`;
// document.head.appendChild(script);
