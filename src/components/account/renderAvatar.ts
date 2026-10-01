import type { User } from "firebase/auth";
import { Style, Avatar } from "@dicebear/core";
import definition from "@dicebear/styles/rings.json" with { type: "json" };

export default function renderAvatar(user: User, viewedUid: string) {
  //Dicebear Avatar generator
  const style = new Style(definition);
  const avatar = new Avatar(style, {
    seed: `${viewedUid}`,
    title: `Avatar of ${user.displayName}`,
    backgroundColor: ["ffd9b0", "ffa8bf"],
    backgroundColorFill: "linear",
    backgroundColorAngle: 135,
  });

  const svg = avatar.toString();
  return svg;
}