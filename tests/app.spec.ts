import { expect, test } from "@playwright/test";

const playerToken = "ply_sampera_vfc_r84y16op2n";
const managerToken = "mgr_versent_fc_9q8w7e6r5t4y3u2i";

test("public squad and player pages render", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /versent fc/i }),
  ).toBeVisible();
  await expect(page.getByText("Sampera", { exact: true }).first()).toBeVisible();

  await page.goto("/players/sampera");

  await expect(
    page.locator("h1", { hasText: "Sampera" }),
  ).toBeVisible();
  await expect(page.getByText(/preferred role map/i)).toBeVisible();
});

test("player edit route saves preferences", async ({ page }) => {
  await page.goto(`/edit/player/${playerToken}`);

  await expect(
    page.locator("h1", { hasText: "Sampera" }),
  ).toBeVisible();

  const saveResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/player/${playerToken}`) &&
      response.request().method() === "PUT" &&
      response.status() === 200,
  );

  await page.getByRole("button", { name: /save preferences/i }).click();

  await saveResponsePromise;
  await expect(page.getByText("Preferences saved.")).toBeVisible();
});

test("manager route saves lineup variant", async ({ page }) => {
  await page.goto(`/manage/${managerToken}`);

  await expect(
    page.getByRole("heading", { name: /versent fc match board/i }),
  ).toBeVisible();

  const saveResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/manage/${managerToken}/lineups/`) &&
      response.request().method() === "PUT",
  );

  await page.getByRole("button", { name: /^save variant$/i }).click();

  const saveResponse = await saveResponsePromise;
  expect(saveResponse.ok()).toBeTruthy();
  await expect(page.getByText("Saved Variant A.")).toBeVisible();
});
