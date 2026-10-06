import { FirebaseError } from "firebase/app";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { signOut, type User } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import formatDate from "../../lib/formatDate";
import renderAvatar from "./renderAvatar";
import renderBio from "./renderBio";
import renderPoems from "./renderPoems";
import renderErrors from "./renderErrors";
import { bioSchema } from "../../schemas/bio";
import z from "zod";
import { editor } from "./renderBio";
import { html } from "../../lib/html";

let isSaving = false;
let errorType: "zodError" | "FBError" | "" = "";
let errorMessage: FirebaseError | z.ZodIssue[] | string = "";

export default async function renderAccount(
  user: User,
  profileUid: string,
  isOwnProfile: boolean,
) {
  try {
    const profileSnap = await getDoc(doc(db, "users", profileUid));

    if (!profileSnap.exists()) {
      document.querySelector<HTMLDivElement>("#account")!.innerHTML =
        `<p class="w-2xl min-h-screen mx-auto text-lg font-semibold text-center text-red-500 flex flex-col justify-center items-center">This profile doesn't exist.</p>`;
      return;
    } else {
      document.querySelector<HTMLDivElement>("#account")!.innerHTML = html`
        <section
          class="w-full max-w-2xl mx-auto min-h-screen px-4 py-4 flex flex-col justify-start items-center gap-4"
        >
          <article class="w-full flex flex-col justify-evenly">
            <p class="text-2xl font-semibold mb-1 pl-2">Info</p>
            <div
              class="flex flex-row justify-between gap-3 border border-gray-300 rounded-md px-4 py-2"
            >
              <div id="avatar" class="w-full h-full max-w-35 max-h-35"></div>
              <div
                class="w-full h-full min-h-35 flex flex-col justify-between items-center"
              >
                <button
                  id="logout"
                  type="button"
                  class="px-4 py-1 rounded-md bg-intense-cherry text-white font-semibold cursor-pointer"
                >
                  Logout
                </button>
                <p id="displayName" class="text-2xl font-semibold"></p>
                <p id="memberSince" class="font-semibold"></p>
                <p id="ratings"></p>
              </div>
            </div>
          </article>
          <article
            class="relative w-full flex flex-col justify-start items-start"
          >
            <p id="blocks" class="text-2xl font-semibold mb-1 pl-2">Bio</p>
            <div
              id="editorjs"
              class="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></div>
            <p id="errors"></p>
            <button
              id="saveButton"
              type="button"
              class="absolute right-0 top-[calc(100%+2.3rem)] -translate-y-1/2 py-2 px-4 rounded-lg text-white bg-green-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </article>
          <article
            id="poemsContainer"
            class="w-full max-w-2xl min-h-screen mx-auto flex flex-col justify-start items-start"
          >
            <p id="poemsTitle" class="text-2xl font-semibold mb-1 pl-2"></p>
            <div
              id="poemsList"
              class="w-full max-w-2xl min-h-screen mx-auto flex flex-col items-center gap-2"
            ></div>
          </article>
        </section>
      `;
    }
    const profile = profileSnap.data();

    //Render user's displayName
    document.querySelector<HTMLParagraphElement>("#displayName")!.innerText =
      profile.displayName as string;

    //Render user's Avatar absed on their UID with DiceBear API
    document.querySelector<HTMLDivElement>("#avatar")!.innerHTML = renderAvatar(
      user,
      profileUid,
    );

    document.querySelector<HTMLParagraphElement>("#memberSince")!.innerHTML =
      `<p class="flex max-2xs:flex-col 2xs:max-4xl:flex-row justify-center items-center gap-1"><span>Member since</span> <span>${formatDate(profile.createdAt)}</span></p>`;

    //Render bio with EditorJS instance
    await renderBio(profile.bio, isOwnProfile);

    //Render `Poems` title and list of own poems(public and private)
    await renderPoems(profileUid, isOwnProfile);

    const saveButton =
      document.querySelector<HTMLButtonElement>("#saveButton")!;

    const logoutButton = document.querySelector<HTMLButtonElement>("#logout")!;

    if (isOwnProfile) {
      saveButton.addEventListener("click", async () => {
        if (isSaving) return;
        isSaving = true;
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";
        try {
          renderErrors(false, "", "" as unknown as FirebaseError);
          const outputData = await editor.save();
          await bioSchema.parseAsync(outputData);

          await setDoc(
            doc(db, "users", auth.currentUser?.uid as string),
            { bio: outputData, updatedAt: serverTimestamp() },
            { merge: true },
          );
        } catch (error) {
          if (error instanceof z.ZodError) {
            errorType = "zodError";
            errorMessage = error.issues;
            renderErrors(true, errorType, errorMessage);
          } else if (error instanceof FirebaseError) {
            errorType = "FBError";
            errorMessage = error as FirebaseError;
            //TODO error admin UI panel
            console.error(error);
            renderErrors(true, errorType, errorMessage);
          }
        } finally {
          isSaving = false;
          saveButton.disabled = false;
          saveButton.textContent = "Save";
        }
      });

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
    } else {
      saveButton.classList.add("hidden");
      logoutButton.classList.add("hidden");
    }
    renderErrors(false, "", "" as unknown as FirebaseError);
  } catch (error) {
    errorType = "";
    errorMessage = error as unknown as string;
    //TODO error admin UI panel
    console.error(error);
    renderErrors(true, errorType, errorMessage as unknown as string);
  }
}
