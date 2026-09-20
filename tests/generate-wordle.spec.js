import { test, expect } from "@playwright/test";

// End-user use case: generating a downloadable Wordle activity from
// stored (seeded) word list data.
test("visitor can generate and download a playable Wordle activity", async ({ page }) => {
  await page.goto("/wordle");

  // Wait for word lists to load from the database before generating.
  await expect(page.getByLabel("English Word")).not.toHaveValue("");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Generate" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("phoneme-wordle.html");
});
