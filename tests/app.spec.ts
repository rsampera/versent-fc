import { expect, test } from "@playwright/test";

const playerToken = "ply_sampera_vfc_r84y16op2n";
const managerToken = "mgr_versent_fc_9q8w7e6r5t4y3u2i";

test("home view renders and legacy routes fold back into it", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /versent fc/i }),
  ).toBeVisible();
  await expect(page.getByText("Sampera", { exact: true }).first()).toBeVisible();

  await page.goto("/players/sampera");

  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: /versent fc/i }),
  ).toBeVisible();
});

test("player edit modal saves preferences", async ({ page }) => {
  await page.goto("/");

  await page.getByText("Sampera", { exact: true }).first().click();
  await page.getByRole("button", { name: /edit player/i }).click();

  await expect(page.getByRole("button", { name: /save player/i })).toBeVisible();

  const saveResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/player/${playerToken}`) &&
      response.request().method() === "PUT" &&
      response.status() === 200,
  );

  await page.getByRole("button", { name: /save player/i }).click();

  await saveResponsePromise;
  await expect(page.getByRole("button", { name: /save player/i })).toBeHidden();
});

test("manager mode saves lineup", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /manager mode/i }).click();
  await expect(page.getByText(/adjust lineup/i)).toBeVisible();

  const saveResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/manage/${managerToken}/lineups/`) &&
      response.request().method() === "PUT",
  );

  await page.getByRole("button", { name: /^save layout$/i }).click();

  const saveResponse = await saveResponsePromise;
  expect(saveResponse.ok()).toBeTruthy();
  await expect(page.getByRole("button", { name: /manager mode/i })).toBeVisible();
});
