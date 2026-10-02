import { z } from "zod";
import { FirebaseError } from "firebase/app";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type EditorJS from "@editorjs/editorjs";
import { auth, db } from "../../lib/firebase";
import commitTag from "../submission/commitTag";
import { PoemSchema } from "../../schemas/poem";
import renderErrors from "./renderErrors";

let tags: string[] = [];
let isError = false;
let errorType: "zodError" | "FBError" | "" = "";
let errorMessage: string | z.ZodIssue[] = "";

export default async function handleSubmit(e: SubmitEvent, editor: EditorJS) {
  e.preventDefault();

  const title = document.querySelector<HTMLInputElement>("#title")!.value;
  const outputData = await editor.save();
  const isPublic = document.querySelector<HTMLInputElement>("#public")!.checked;
  const tagInput = document.querySelector<HTMLInputElement>("#tags")!;
  const pending = tagInput.value.trim();
  if (pending) {
    commitTag(pending);
    tagInput.value = "";
  }

  try {
    const validated = await PoemSchema.parseAsync({
      title,
      body: outputData,
      tags,
      isPublic,
    });
    await addDoc(collection(db, "poems"), {
      ...validated,
      displayName: auth.currentUser?.displayName,
      authorUid: auth.currentUser?.uid,
      avgRating: 0,
      ratingCount: 0,
      createdAt: serverTimestamp(),
    });
    window.location.href = "/account/";
  } catch (error: any) {
    if (error instanceof FirebaseError) {
      isError = true;
      errorType = "FBError";
      errorMessage = error as unknown as string; //"Something went wrong saving your poem. Please try again.";
    } else if (error instanceof z.ZodError) {
      isError = true;
      errorType = "zodError";
      errorMessage = error.issues;
    }
  }
  renderErrors();
}
