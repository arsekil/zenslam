import renderAccount from "../components/account/renderAccount";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { html } from "../lib/html";
import "../style.css";

const params = new URLSearchParams(window.location.search);
const viewedUid = params.get("uid");


document.querySelector<HTMLDivElement>("#account")!.innerHTML = html`
  <section
    class="w-full min-h-screen flex flex-col gap-5 justify-center items-center"
  >
    <p class="text-lg font-semibold text-zinc-800">Loading...</p>
  </section>
`;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/";
    return;
  }
  const profileUid = viewedUid ?? user.uid;
  const isOwnProfile = profileUid === user.uid;
  await renderAccount(user, profileUid, isOwnProfile);
});
