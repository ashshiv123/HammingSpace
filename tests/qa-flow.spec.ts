import { test, expect } from '@playwright/test';

test.describe('Hamming Lab Flow QA', () => {
  const codes = ['(7,4)', '(15,11)'];
  const errors = [0, 1, 2];

  for (const code of codes) {
    for (const errorCount of errors) {
      test(`Flow: ${code} with ${errorCount} errors`, async ({ page }) => {
        const logs: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'error' || msg.type() === 'warn') {
            console.error(`[BROWSER ${msg.type().toUpperCase()}]`, msg.text());
          }
        });
        page.on('pageerror', err => {
          console.error(`[BROWSER PAGEERROR]`, err.message);
        });

        await page.goto('/');

        // wait for canvas
        await expect(page.locator('canvas')).toBeVisible({ timeout: 30000 });

        // Select code
        await page.locator('select').selectOption(code);

        // Wait a moment for transition
        await page.waitForTimeout(500);
        await page.screenshot({ path: `qa/S0-Compose-${code}-${errorCount}.png` });

        // S1 Transmit
        await page.getByRole('button', { name: /Transmit & Encode/i }).click();
        await page.waitForTimeout(1000); // camera transition

        // S2 Lesson A (Steps 1-5)
        for (let i = 1; i <= 5; i++) {
          await page.screenshot({ path: `qa/S2-LessonA-Step${i}-${code}-${errorCount}.png` });
          const nextBtn = page.getByRole('button', { name: /Continue|Finish/i });
          if (await nextBtn.isVisible()) {
            await nextBtn.click();
            await page.waitForTimeout(600); // wait for lesson transition
          }
        }

        // S3 Codeword Build
        // wait for codeword animation
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `qa/S3-CodewordBuild-${code}-${errorCount}.png` });

        // S4 To Channel
        // Tray should be sliding to channel...
        await page.waitForTimeout(1500); 
        await page.screenshot({ path: `qa/S4-Channel-${code}-${errorCount}.png` });

        // S5 Noise
        // inject errors
        if (errorCount > 0) {
          // Inject noise via HUD button or clicking spheres
          for (let i = 0; i < errorCount; i++) {
            const noiseBtn = page.getByRole('button', { name: /Inject Channel Noise/i });
            if (await noiseBtn.isVisible()) {
              await noiseBtn.click();
              await page.waitForTimeout(500);
            }
          }
        }
        await page.screenshot({ path: `qa/S5-Noise-${code}-${errorCount}.png` });

        const proceedBtn = page.getByRole('button', { name: /Proceed to Receiver/i });
        if (await proceedBtn.isVisible()) {
          await proceedBtn.click();
        }
        await page.waitForTimeout(1500); // wait for camera to RX

        // S6 Lesson B (Steps 6-9)
        for (let i = 6; i <= 9; i++) {
          await page.screenshot({ path: `qa/S6-LessonB-Step${i}-${code}-${errorCount}.png` });
          const nextBtn = page.getByRole('button', { name: /Continue|Finish/i });
          if (await nextBtn.isVisible()) {
            await nextBtn.click();
            await page.waitForTimeout(600);
          }
        }

        // S7 Result
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `qa/S7-Result-${code}-${errorCount}.png` });

        // Global: start over
        const restartBtn = page.getByRole('button', { name: /Start Over|Reset/i });
        if (await restartBtn.isVisible()) {
          await restartBtn.click();
          await page.waitForTimeout(1000);
        }
      });
    }
  }
});
