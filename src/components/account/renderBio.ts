import EditorJS, { type OutputData } from "@editorjs/editorjs";

export let editor: EditorJS;

export default async function renderBio(
  bio: OutputData | undefined,
  isOwnProfile: boolean,
) {
  editor = new EditorJS({
    holder: "editorjs",
    data: bio ?? { blocks: [] },
    readOnly: !isOwnProfile,
  });
  await editor.isReady;
}
