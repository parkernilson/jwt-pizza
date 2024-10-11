import { test, expect } from "playwright-test-coverage";

const loginAdminReq = { email: "a@jwt.com", password: "admin" };

const loginAdminRes = {
  user: {
    id: 1,
    name: "常用名字",
    email: "a@jwt.com",
    roles: [
      {
        role: "admin",
      },
    ],
  },
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IuW4uOeUqOWQjeWtlyIsImVtYWlsIjoiYUBqd3QuY29tIiwicm9sZXMiOlt7InJvbGUiOiJhZG1pbiJ9XSwiaWF0IjoxNzI4NTA2MDIwfQ.RyvKeThCxvkSZVxfDuEkYsSa41on0Ow1McfaIusoyb8",
};

const getAllFranchises_store1 = [
  {
    id: 2,
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
        id: 4,
        name: "Store 1",
        totalRevenue: 0,
      },
    ],
  },
];

const deleteFranchiseRes = { message: "franchise deleted" };

test("Admin can view franchises", async ({ page }) => {
  await page.route("**/*/api/auth", async (route) => {
    expect(route.request().postDataJSON()).toStrictEqual(loginAdminReq);
    expect(route.request().method()).toBe("PUT");
    await route.fulfill({ json: loginAdminRes });
  });

  await page.route("**/*/api/franchise", async (route) => {
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: getAllFranchises_store1 });
  });

  await page.goto("/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("a@jwt.com");
  await page.getByPlaceholder("Email address").press("Tab");
  await page.getByPlaceholder("Password").fill("admin");
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForTimeout(1000);
  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page.locator("tbody")).toContainText("Franchise 1");
  await expect(page.locator("tbody")).toContainText("Franchisee One");
  await expect(page.locator("tbody")).toContainText("Store 1");
  await expect(page.locator("tbody")).toContainText("0 ₿");
});

test("Admin can delete a franchise", async ({ page }) => {
  await page.route("**/*/api/auth", async (route) => {
    expect(route.request().postDataJSON()).toStrictEqual(loginAdminReq);
    expect(route.request().method()).toBe("PUT");
    await route.fulfill({ json: loginAdminRes });
  });

  await page.route("**/*/api/franchise", async (route) => {
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: [] });
  }, { times: 1 });

  await page.route("**/*/api/franchise", async (route) => {
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: getAllFranchises_store1 });
  }, { times: 1 });

  await page.route("**/*/api/franchise/2", async (route) => {
    expect(route.request().method()).toBe("DELETE");
    await route.fulfill({ json: deleteFranchiseRes });
  });

  await page.goto("/");
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('a@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.locator('tbody')).toContainText('Franchise 1');
  await expect(page.locator('tbody')).toContainText('Franchisee One');
  await expect(page.locator('tbody')).toContainText('Store 1');
  await expect(page.locator('tbody')).toContainText('0 ₿');
  await page.getByRole('row', { name: 'Franchise 1 Franchisee One' }).getByRole('button').click();
  await page.getByRole('button', { name: 'Close' }).click();

});

