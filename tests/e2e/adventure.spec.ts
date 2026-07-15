import { expect, test } from "@playwright/test";

test("a child can begin and reach every activity", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /happy bunny/i }).click();
  await page.getByPlaceholder("Your name or nickname").fill("Mila");
  await page.getByRole("button", { name: /start adventure/i }).click();

  await expect(
    page.getByRole("heading", { name: /where should we explore/i }),
  ).toBeVisible();
  await expect(page.getByText("Mila", { exact: true })).toBeVisible();

  for (const label of [
    "Story Builder",
    "Drawing Studio",
    "Music Garden",
    "Space",
    "Ocean",
    "Kindness",
    "Rewards",
  ]) {
    await expect(
      page.getByRole("button", { name: new RegExp(label, "i") }),
    ).toBeVisible();
  }
});

test("parent settings remain PIN protected", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /start adventure/i }).click();
  await page.getByRole("button", { name: /grown-up dashboard/i }).click();
  await expect(
    page.getByRole("heading", { name: /parent dashboard/i }),
  ).toBeVisible();
  await expect(page.getByText(/comfort & accessibility/i)).toHaveCount(0);
});
