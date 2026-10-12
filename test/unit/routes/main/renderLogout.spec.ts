import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import type { User } from "firebase/auth";

vi.mock("../../../src/lib/firebase", () => ({
  auth: { currentUser: null },
  db: {},
}));

vi.mock("firebase/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/auth")>();
  return {
    ...actual,
    signOut: vi.fn(),
  };
});

vi.mock("../../../src/components/main/renderErrors", () => ({
  renderErrors: vi.fn(),
}));

import { signOut } from "firebase/auth";
import { auth } from "../../../../src/lib/firebase";
import { renderErrors } from "../../../../src/components/main/renderErrors";
import { renderLogout } from "../../../../src/components/main/renderLogout";

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    uid: "i9RsYC4QhC72HQ3R0dkc9ALHkN7T",
    displayName: "arsekil",
    email: "arsekil@example.com",
    ...overrides,
  }) as User;

//Note: renders Account + Logout, links to /account/?uid=, calls signOut on click, calls renderErrors on failure
// TODO: re-enable after renderErrors split
it.skip("", () => {
  //TODO skip starts here
  describe("renderLogout", () => {
    beforeEach(() => {
      document.body.innerHTML = `<div id="signout"></div>`;
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("renders the Account link and Logout button", () => {
      renderLogout(makeUser());

      const container = document.querySelector("#signout")!;
      expect(container.textContent).toContain("Account");
      expect(container.textContent).toContain("Log Out");
    });

    it("points the Account link at the user's profile", () => {
      const user = makeUser({ uid: "abc123" });
      renderLogout(user);

      const link = document.querySelector<HTMLAnchorElement>("#signout a")!;
      expect(link.getAttribute("href")).toBe("/account/?uid=abc123");
    });

    it("calls signOut(auth) when Logout is clicked", async () => {
      vi.mocked(signOut).mockResolvedValue(undefined);
      renderLogout(makeUser());

      document.querySelector<HTMLButtonElement>("#logout")!.click();

      await vi.waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));

      expect(signOut).toHaveBeenCalledWith(auth);
    });

    it("redirects to / on successful logout", async () => {
      vi.mocked(signOut).mockResolvedValue(undefined);
      renderLogout(makeUser());

      const original = window.location;
      // @ts-expect-error
      delete window.location;
      // @ts-expect-error
      window.location = { href: "" };

      document.querySelector<HTMLButtonElement>("#logout")!.click();
      await vi.waitFor(() => expect(window.location.href).toBe("/"));

      // @ts-expect-error
      window.location = original;
    });

    it("renders an error when signOut fails with FirebaseError", async () => {
      const { FirebaseError } = await import("firebase/app");
      const fbErr = new FirebaseError("auth/network-request-failed", "offline");

      vi.mocked(signOut).mockRejectedValue(fbErr);
      renderLogout(makeUser());

      document.querySelector<HTMLButtonElement>("#logout")!.click();
      await vi.waitFor(() => expect(renderErrors).toHaveBeenCalledWith(fbErr));
    });
  });
  //TODO skip ends here
});
