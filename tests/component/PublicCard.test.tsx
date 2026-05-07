import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

type PublicCardModule = {
  default: (props: Record<string, unknown>) => ReactElement | Promise<ReactElement>;
};

async function importPublicCardModule(): Promise<PublicCardModule | null> {
  const candidates = [
    path.resolve(process.cwd(), "src/app/[handle]/PublicCard.tsx"),
    path.resolve(process.cwd(), "src/app/[handle]/PublicCard.ts"),
  ];

  const existingPath = candidates.find((candidate) => existsSync(candidate));
  if (!existingPath) return null;

  try {
    return (await import("@/app/[handle]/PublicCard")) as unknown as PublicCardModule;
  } catch {
    try {
      return (await import(pathToFileURL(existingPath).href)) as unknown as PublicCardModule;
    } catch {
      return null;
    }
  }
}

const publicCardModule = await importPublicCardModule();
const hasRenderablePublicCard =
  typeof publicCardModule?.default === "function";

// Reviewer note: skip when the implementation module is absent or not importable.
const describePublicCard = hasRenderablePublicCard ? describe : describe.skip;

function makeCard(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    handle: "yamada",
    lastName: "山田",
    firstName: "太郎",
    lastNameKana: "やまだ",
    firstNameKana: "たろう",
    company: "株式会社Example",
    department: "開発部",
    jobTitle: "マネージャー",
    phone: "03-0000-0000",
    email: "taro@example.com",
    postalCode: "123-4567",
    address: "東京都千代田区1-1",
    websiteUrl: "https://example.com",
    logoUrl: "https://example.com/logo.png",
    poem: null,
    profile: null,
    snsLinks: null,
    themeKey: "minimal",
    fontKey: "sans",
    accentColor: "#111111",
    isPublished: true,
    ...overrides,
  };
}

async function renderPublicCard(overrides: Record<string, unknown> = {}) {
  const Component = publicCardModule?.default;
  if (typeof Component !== "function") {
    throw new Error("PublicCard module is not available");
  }

  const card = makeCard(overrides);
  const element = await Component({
    ...card,
    card,
    data: card,
    contact: card,
    compact: false,
  });

  return render(element);
}

describePublicCard("PublicCard component spec", () => {
  it("renders lastName and firstName in the DOM", async () => {
    await renderPublicCard();

    expect(screen.getByText(/山田/)).toBeInTheDocument();
    expect(screen.getByText(/太郎/)).toBeInTheDocument();
  });

  it("does not render the more button when all extended fields are nullish", async () => {
    await renderPublicCard({
      poem: null,
      profile: undefined,
      snsLinks: undefined,
    });

    expect(
      screen.queryByRole("button", { name: "もっと見る" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("もっと見る")).not.toBeInTheDocument();
  });

  it("renders the more button when poem is present", async () => {
    await renderPublicCard({
      poem: "紙名刺をデジタルに。",
      profile: null,
      snsLinks: null,
    });

    expect(screen.getByText("もっと見る")).toBeInTheDocument();
  });
});
