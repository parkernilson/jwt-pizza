import { test, expect } from "playwright-test-coverage";

test("Login of existing user should take the user to the dashboard", async ({
  page,
}) => {
  await page.route("**/*/version.json", async (route) => {
    const versionRes = { version: "20000101.000000" };
    expect(route.request().method()).toBe("GET");
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(versionRes),
    });
  });
  await page.route("**/*/auth", async (route) => {
    const loginReq = {
      email: "user1@gmail.com",
      password: "password123",
    };
    const loginRes = {
      user: {
        id: 532,
        name: "Test User",
        email: "user1@gmail.com",
        roles: [
          {
            role: "diner",
          },
        ],
      },
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTMyLCJuYW1lIjoiUGFya2VyIE5pbHNvbiIsImVtYWlsIjoicGFya2VyLnRvZGQubmlsc29uQGdtYWlsLmNvbSIsInJvbGVzIjpbeyJyb2xlIjoiZGluZXIifV0sImlhdCI6MTcyODQ5MzIyOX0.kwHbNgY8e0UJT0BrIzePMdcZW2MaDZ5aj1Z_QSsUdT8",
    };
    expect(route.request().method()).toBe("PUT");
    expect(route.request().postDataJSON()).toEqual(loginReq);
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(loginRes),
    });
  });

  await page.goto("/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByPlaceholder("Email address").click();
  await page
    .getByPlaceholder("Email address")
    .fill("user1@gmail.com");
  await page.getByPlaceholder("Email address").press("Tab");
  await page.getByPlaceholder("Password").fill("password123");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("heading")).toContainText("The web's best pizza");
  await expect(page.getByLabel("Global")).toContainText("TU");
  await expect(page.getByLabel("Global")).toContainText("JWT Pizza");
  await expect(page.getByRole("button")).toContainText("Order now");
});
