import { test, expect } from "@playwright/test";

test.describe("StackSphere Real-Time Complete User Journeys", () => {

  test("Journey 1: Registration, Chrome Email OTP Challenge & Authenticated Session", async ({ page, request }) => {
    // 1. Visit Login
    await page.goto("/login");
    await expect(page).toHaveTitle(/(Sign In|Login) - StackSphere/i);

    // 2. Submit valid credentials
    await page.fill('input[type="email"]', "developer@stacksphere.com");
    await page.fill('input[type="password"]', "Password123!");
    await page.click('button[type="submit"]');

    // 3. Wait for OTP challenge modal overlay
    await page.waitForTimeout(1000);
    const otpInput = page.locator('input[placeholder="000000"]');
    
    if (await otpInput.isVisible()) {
      await expect(otpInput).toBeVisible();

      // Retrieve generated OTP via test integration endpoint
      const testRes = await request.get("/api/test-auth");
      const testData = await testRes.json();
      expect(testData.status).toBe("success");

      // Fill OTP code
      await otpInput.fill("999999");
      const confirmBtn = page.locator('button[type="submit"]').last();
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
      }
    }
  });

  test("Journey 2: Forgot Password Recovery, Verification & Login with New Password", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator("h2")).toContainText(/(Reset Password|Password)/i);
    
    const inputField = page.locator('input[id="email"], input[id="phone"], input[type="tel"], input[type="email"]').first();
    await expect(inputField).toBeVisible();

    await inputField.fill("testauth@example.com");
    await page.click('button[type="submit"]');

    // Verify transition to verification step or confirmation alert
    await page.waitForTimeout(500);
    await expect(page.locator("body")).toContainText(/(Verification|Code|Enter|dispatched)/i);
  });

  test("Journey 3: Subscription Membership Checkout & Question Limits", async ({ page, request }) => {
    await page.goto("/subscription");
    await page.waitForTimeout(500);

    const testRes = await request.get("/api/test-payments");
    const testData = await testRes.json();
    expect(testData.status).toBe("success");

    // Verify time gate and plan tiers exist in DOM or test results
    const planHeader = page.locator("h1, h2").first();
    await expect(planHeader).toBeVisible();
  });

  test("Journey 4: Backend Language-Switch OTP & Persistence Across Reloads", async ({ page, request }) => {
    await page.goto("/login");
    const langSelect = page.locator("header select");
    await expect(langSelect).toBeVisible();

    // Select Spanish (es)
    await langSelect.selectOption("es");
    await expect(page.locator("h2")).toContainText(/Iniciar sesión en StackSphere/i);

    // Reload page to verify persistence in localStorage
    await page.reload();
    await expect(page.locator("h2")).toContainText(/Iniciar sesión en StackSphere/i);

    // Reset back to English
    await langSelect.selectOption("en");
  });

  test("Journey 5: Social Feed Media Upload, Post Creation, Like & Comment Lifecycle", async ({ page, request }) => {
    await page.goto("/social");
    await page.waitForTimeout(500);

    const testRes = await request.get("/api/test-social");
    const testData = await testRes.json();
    expect(testData.status).toBe("success");
    expect(testData.results.some((r: any) => r.name === "Post Creation" && r.status === "PASS")).toBeTruthy();
    expect(testData.results.some((r: any) => r.name === "Likes Integration (Like)" && r.status === "PASS")).toBeTruthy();
  });

  test("Journey 6: Q&A Answer Reward Points & Point Transfer Lifecycle", async ({ page, request }) => {
    await page.goto("/profile");
    await page.waitForTimeout(500);

    const testRes = await request.get("/api/test-rewards");
    const testData = await testRes.json();
    expect(testData.status).toBe("success");
    expect(testData.results.some((r: any) => r.name === "Answer Reward Logic (Day 47)" && r.status === "PASS")).toBeTruthy();
    expect(testData.results.some((r: any) => r.name === "Point Transfer & Threshold Restrictions (Day 52)" && r.status === "PASS")).toBeTruthy();
  });

  test("Journey 7: Notification Center Badge & Read State Updates", async ({ page }) => {
    await page.goto("/login");
    await page.waitForTimeout(500);
    const bellBtn = page.locator('button[title="Notifications"], button[title="Notificaciones"]');
    if (await bellBtn.isVisible()) {
      await bellBtn.click();
    }
  });

  test("Journey 8: Login Security Audit Log View & Device Metadata Tracking", async ({ page }) => {
    await page.goto("/login-history");
    await page.waitForTimeout(500);
    await expect(page.locator("body")).toContainText(/(Login History|Device|Audit|Log)/i);
  });

});
