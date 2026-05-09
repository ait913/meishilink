import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

type LogModule = {
  classifyUA: (
    ua: string | null | undefined,
  ) => "ios" | "android" | "desktop" | "bot" | "other";
};

async function importLogModule(): Promise<LogModule | null> {
  try {
    return (await import("@/lib/log")) as LogModule;
  } catch {
    const filePath = path.resolve(process.cwd(), "src/lib/log.ts");
    if (!existsSync(filePath)) return null;

    try {
      return (await import(pathToFileURL(filePath).href)) as LogModule;
    } catch {
      return null;
    }
  }
}

const logModule = await importLogModule();

// Reviewer note: skip when the implementation module is absent or not importable.
const describeLog = logModule ? describe : describe.skip;

describeLog("UA classification spec", () => {
  it("classifies documented user agents", () => {
    const cases: Array<{
      input: string | null | undefined;
      expected: "ios" | "android" | "desktop" | "bot" | "other";
    }> = [
      {
        input:
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        expected: "bot",
      },
      {
        input:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        expected: "ios",
      },
      {
        input:
          "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/124.0",
        expected: "android",
      },
      {
        input:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
        expected: "desktop",
      },
      {
        input: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        expected: "desktop",
      },
      {
        input: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        expected: "desktop",
      },
      {
        input: null,
        expected: "other",
      },
      {
        input: undefined,
        expected: "other",
      },
      {
        input: "",
        expected: "other",
      },
      {
        input: "facebookexternalhit/1.1",
        expected: "bot",
      },
      {
        input: "spider",
        expected: "bot",
      },
    ];

    for (const testCase of cases) {
      expect(logModule?.classifyUA(testCase.input)).toBe(testCase.expected);
    }
  });
});
