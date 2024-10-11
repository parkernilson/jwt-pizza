import { test, expect } from "@playwright/test";

const loginFranchisee1Req = {
  email: "franchisee1@gmail.com",
  password: "password123",
};

const loginFranchisee1Res = {
  user: {
    id: 2,
    name: "Franchisee One",
    email: "Franchisee1@gmail.com",
    roles: [
      {
        role: "diner",
      },
      {
        objectId: 5,
        role: "franchisee",
      },
    ],
  },
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibmFtZSI6IkZyYW5jaGlzZWUgT25lIiwiZW1haWwiOiJGcmFuY2hpc2VlMUBnbWFpbC5jb20iLCJyb2xlcyI6W3sicm9sZSI6ImRpbmVyIn0seyJvYmplY3RJZCI6NSwicm9sZSI6ImZyYW5jaGlzZWUifV0sImlhdCI6MTcyODYwMDg5MX0.MO3554iE2ViOZFD-i5qZ4Y6gD8iZz1hdBvUPh0u8qjs",
};

const getFranchises_franchisee1_store1 = [
  {
    id: 5,
    name: "Franchise 1",
    admins: [
      {
        id: 2,
        name: "Franchisee One",
        email: "Franchisee1@gmail.com",
      },
    ],
    stores: [
      {
        id: 7,
        name: "Store 1",
        totalRevenue: 0,
      },
    ],
  },
];

const getFranchises_franchisee1_emptyStores = [
  {
    id: 5,
    name: "Franchise 1",
    admins: [
      {
        id: 2,
        name: "Franchisee One",
        email: "Franchisee1@gmail.com",
      },
    ],
    stores: [],
  },
];

const deleteStore1Res = { message: "store deleted" };

test("Franchisee can view their own franchise and stores", async ({ page }) => {
  await page.route("**/*/api/auth", async (route) => {
    expect(route.request().postDataJSON()).toStrictEqual(loginFranchisee1Req);
    expect(route.request().method()).toBe("PUT");
    await route.fulfill({ json: loginFranchisee1Res });
  });

  await page.route("**/*/api/franchise/2", async (route) => {
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: getFranchises_franchisee1_store1 });
  });

  await page.goto("/");

  await page.getByRole("link", { name: "Login", exact: true }).click();
  await page.getByPlaceholder("Email address").fill("franchisee1@gmail.com");
  await page.getByPlaceholder("Email address").press("Tab");
  await page.getByPlaceholder("Password").fill("password123");
  await page.getByRole("button", { name: "Login" }).click();
  await page
    .getByLabel("Global")
    .getByRole("link", { name: "Franchise" })
    .click();
  await expect(page.getByRole("heading")).toContainText("Franchise 1");
  await expect(page.locator("tbody")).toContainText("Store 1");
  await expect(page.locator("tbody")).toContainText("0 ₿");
});

test("Franchisee can delete a store", async ({ page }) => {
  await page.route("**/*/api/auth", async (route) => {
    expect(route.request().postDataJSON()).toStrictEqual(loginFranchisee1Req);
    expect(route.request().method()).toBe("PUT");
    await route.fulfill({ json: loginFranchisee1Res });
  });
  

  await page.route("**/*/api/franchise/2", async (route) => {
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: getFranchises_franchisee1_emptyStores });
  });
  
  await page.route("**/*/api/franchise/2", async (route) => {
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: getFranchises_franchisee1_store1 });
  }, { times: 1 });

  await page.route("**/*/api/franchise/5/store/7", async (route) => {
    console.log('Deleting store!')
    // expect(route.request().method()).toBe("DELETE");
    await route.fulfill({ json: deleteStore1Res })
  });

  await page.goto("/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("franchisee1@gmail.com");
  await page.getByPlaceholder("Email address").press("Tab");
  await page.getByPlaceholder("Password").fill("password123");
  await page.getByRole("button", { name: "Login" }).click();
  await page
    .getByLabel("Global")
    .getByRole("link", { name: "Franchise" })
    .click();
  await page
    .locator("div")
    .filter({ hasText: "Franchise 1Everything you" })
    .nth(2)
    .click({
      button: "right",
    });
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("heading")).toContainText("Franchise 1");
  // await expect(page.locator("tbody")).not.toContainText("Store 1");
});
