import { test, expect } from "@playwright/test";

// Builder use case: full CRUD on a word list and a word within it.
// Requires the app running against a seeded (or empty) database.
test("teacher can create, edit, and delete a word list and a word", async ({ page }) => {
  // Auto-accept the browser confirm() dialogs used by delete actions.
  page.on("dialog", (dialog) => dialog.accept());

  const listName = `E2E Test List ${Date.now()}`;

  await page.goto("/word-lists");

  // Create
  await page.getByLabel("Name").fill(listName);
  await page.getByLabel("Description (optional)").fill("Created by Playwright");
  await page.getByRole("button", { name: "Create word list" }).click();

  // The new list is auto-selected, so the word form appears immediately.
  await expect(page.getByText(listName)).toBeVisible();

  // Every list card has its own identically-labeled "Delete list" button
  // (all the seeded lists have one too), so scope to THIS card only.
 const listCard = page.locator("strong", { hasText: listName }).locator("xpath=..");

  // Add a word by clicking phoneme keys, then submitting the English spelling.
  // Matched via aria-label prefix, not the bare symbol text - each key's
  // accessible name is "Phoneme b, B (as in bed)" style, not just "b".
  await page.getByRole("button", { name: /^Phoneme b,/ }).click();
  await page.getByRole("button", { name: /^Phoneme e,/ }).click();
  await page.getByRole("button", { name: /^Phoneme d,/ }).click();
  await page.getByLabel("English word").fill("BED");
  await page.getByRole("button", { name: "Add word", exact: true }).click();

  // Read
  await expect(page.getByText("BED (b e d)")).toBeVisible();

  // Update
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("English word").fill("BEDS");
  await page.getByRole("button", { name: "Update word" }).click();
  await expect(page.getByText("BEDS (b e d)")).toBeVisible();

  // Delete the word
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByText("BEDS (b e d)")).not.toBeVisible();

  // Delete the whole list - scoped to this specific card, not the whole page.
  await listCard.getByRole("button", { name: "Delete list" }).click();
  await expect(page.getByText(listName)).not.toBeVisible();
});