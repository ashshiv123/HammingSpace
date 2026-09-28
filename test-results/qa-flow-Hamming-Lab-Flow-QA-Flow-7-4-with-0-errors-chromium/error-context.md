# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: qa-flow.spec.ts >> Hamming Lab Flow QA >> Flow: (7,4) with 0 errors
- Location: tests\qa-flow.spec.ts:9:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: locator('canvas')
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('canvas') with timeout 30000ms
  - waiting for locator('canvas')
  - Protocol error (Runtime.callFunctionOn): Internal server error, session closed.

```

```yaml
- banner:
  - text: HammingSpace
  - navigation:
    - link "Theory":
      - /url: /
    - link "Simulation":
      - /url: /simulation
- main:
  - complementary:
    - navigation:
      - heading "Topics" [level=4]
      - button "1. Hamming Space"
      - button "2. Linear Block Codes & Parity"
      - 'button "3. Parameters: The (n, k) Code"'
      - button "4. Parity Bit Formula"
      - button "5. Constructing the G Matrix"
      - button "6. Codeword Formation"
      - button "7. Transmission"
      - button "8. Channel Noise"
      - button "9. The Received Vector"
      - button "10. The Parity-Check Matrix (H) & Syndrome"
      - button "11. Final Decoding"
  - heading "Theory & Architecture" [level=1]
  - paragraph: Understanding the math and geometry behind the (7,4) Hamming code simulation.
  - heading "1. Hamming Space" [level=3]
  - paragraph: Coding theory is fundamentally geometric, even though it's taught algebraically. A "Hamming Space" maps codewords as physical points in an $n$-dimensional hypercube.
  - paragraph: In this space, valid messages (codewords) are placed far enough apart so that if a few bits flip (causing the point to drift), it's still physically closer to the original codeword than to any other valid one.
  - img
  - paragraph: Valid codewords (blue) with correction radii in n-dimensional space.
  - heading "2. Linear Block Codes & Parity" [level=3]
  - paragraph: A Linear Block Code maps a fixed-length $k$-bit message to an $n$-bit codeword by appending $n-k$ redundant parity bits. This extra padding is what allows the receiver to detect and fix errors.
  - paragraph: The term "linear" means that adding any two valid codewords together (via XOR) produces another valid codeword.
  - text: Data (k) Parity (n-k)
  - img: k = 4 bits r = 3 bits n = 7 bits (Codeword)
  - 'heading "3. Parameters: The (n, k) Code" [level=3]'
  - paragraph:
    - text: Codes are typically defined by their parameters
    - strong: (n, k)
    - text: ":"
  - list:
    - listitem:
      - strong: "n"
      - text: = Total number of bits in the transmitted block.
    - listitem:
      - strong: k
      - text: = Number of actual data/message bits.
    - listitem:
      - strong: n-k (or r)
      - text: = Number of parity bits.
  - paragraph:
    - text: A famous example is the
    - strong: (7, 4) Hamming Code
    - text: ", which sends 4 bits of data using 7 total bits (3 parity bits). It can correct exactly 1 bit error."
  - heading "4. Parity Bit Formula" [level=3]
  - paragraph: How do we know we need exactly 3 parity bits for 4 data bits? We use the Hamming bound formula to ensure we have enough unique combinations to identify every possible single-bit error.
  - paragraph:
    - text: "The formula is:"
    - code: 2^r ≥ k + r + 1
  - paragraph: For $k=4$, $r=2$ gives $4 \ge 7$ (False). But $r=3$ gives $8 \ge 8$ (True). So we need 3 parity bits.
  - text: "2"
  - superscript: r
  - text: "≥ m + r + 1 m = 4 (Data) r = ? (Parity) If r=2: 4 ≥ 4+2+1 ❌ If r=3: 8 ≥ 4+3+1 ✅"
  - heading "5. Constructing the G Matrix" [level=3]
  - paragraph: The Generator Matrix ($G$) is the blueprint for creating codewords. For a systematic code (where the original message appears exactly at the start of the codeword), $G$ is constructed by joining an Identity Matrix ($I$) with a Parity Matrix ($P$).
  - paragraph: $G = [ I_k | P ]$
  - code: G = [ 1 0 0 0 | 1 1 0 0 1 0 0 | 0 1 1 0 0 1 0 | 1 1 1 0 0 0 1 | 1 0 1 ]
  - heading "6. Codeword Formation" [level=3]
  - paragraph: To encode our message $m$, we multiply it by the Generator matrix $G$. All math is done in Galois Field 2 (GF(2)), meaning addition is done via XOR and there are no carries.
  - paragraph:
    - text: "Equation:"
    - code: c = m × G
  - paragraph: If $m = [1 0 1 1]$, the resulting codeword $c$ will have the message in the first 4 bits, and the calculated parity in the last 3 bits.
  - text: "[1 0 1 1] × 1 0 0 0 | 1 1 0 0 1 0 0 | 0 1 1 0 0 1 0 | 1 1 1 0 0 0 1 | 1 0 1 = [1 0 1 1 | 0 1 0]"
  - heading "7. Transmission" [level=3]
  - paragraph: Once formed, the codeword $c$ is transmitted over a communication channel (like a fiber optic cable, deep space radio wave, or writing to a hard drive).
  - heading "8. Channel Noise" [level=3]
  - paragraph: The physical world is noisy. Cosmic rays, thermal noise, or scratches can flip bits. In coding theory, we model this by adding an "error vector" $e$ to our codeword.
  - paragraph: If the third bit flips, $e = [0 0 1 0 0 0 0]$.
  - text: Transmitted (c) 1 0 1 1 0 1 0 + Noise (e) 0 0 1 0 0 0 0 = Received (r) 1 0 0 1 0 1 0
  - heading "9. The Received Vector" [level=3]
  - paragraph: The receiver doesn't know $c$ or $e$; they only get the received vector $r$.
  - paragraph:
    - text: "Equation:"
    - code: r = c + e
    - text: (modulo-2 arithmetic).
  - paragraph: The receiver's job is to figure out if $r$ is a valid codeword, and if not, which bit was flipped by $e$.
  - heading "10. The Parity-Check Matrix (H) & Syndrome" [level=3]
  - paragraph:
    - text: The receiver multiplies $r$ by the transpose of the Parity-Check Matrix ($H$) to get the
    - strong: Syndrome ($S$)
    - text: . Think of $S$ as an error fingerprint.
  - paragraph:
    - code: S = r × H^T
  - paragraph: If $S = [0 0 0]$, there are no detected errors. If $S \neq [0 0 0]$, the syndrome precisely matches one of the columns in $H$, telling the receiver exactly which bit index is corrupted.
  - text: S = r × H
  - superscript: T
  - text: Syndrome Vector 1 1 1 Matches H-matrix column 3! Error is at bit index 3.
  - heading "11. Final Decoding" [level=3]
  - paragraph: Once the syndrome identifies the error column, the receiver flips that specific bit back to its correct state.
  - paragraph: Because the code is systematic, the receiver can simply slice off the parity bits to perfectly recover the original $k$-bit message.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Hamming Lab Flow QA', () => {
  4   |   const codes = ['(7,4)', '(15,11)'];
  5   |   const errors = [0, 1, 2];
  6   | 
  7   |   for (const code of codes) {
  8   |     for (const errorCount of errors) {
  9   |       test(`Flow: ${code} with ${errorCount} errors`, async ({ page }) => {
  10  |         const logs: string[] = [];
  11  |         page.on('console', msg => {
  12  |           if (msg.type() === 'error' || msg.type() === 'warn') {
  13  |             logs.push(`[${msg.type()}] ${msg.text()}`);
  14  |           }
  15  |         });
  16  |         page.on('pageerror', err => {
  17  |           logs.push(`[PAGEERROR] ${err.message}`);
  18  |         });
  19  | 
  20  |         await page.goto('/');
  21  | 
  22  |         // wait for canvas
> 23  |         await expect(page.locator('canvas')).toBeVisible({ timeout: 30000 });
      |                                              ^ Error: expect(locator).toBeVisible() failed
  24  | 
  25  |         // Select code
  26  |         if (code === '(15,11)') {
  27  |           await page.getByRole('button', { name: '(15,11)' }).click();
  28  |         } else {
  29  |           await page.getByRole('button', { name: '(7,4)' }).click();
  30  |         }
  31  | 
  32  |         // Wait a moment for transition
  33  |         await page.waitForTimeout(500);
  34  |         await page.screenshot({ path: `qa/S0-Compose-${code}-${errorCount}.png` });
  35  | 
  36  |         // S1 Transmit
  37  |         await page.getByRole('button', { name: /Transmit & Encode/i }).click();
  38  |         await page.waitForTimeout(1000); // camera transition
  39  | 
  40  |         // S2 Lesson A (Steps 1-5)
  41  |         for (let i = 1; i <= 5; i++) {
  42  |           await page.screenshot({ path: `qa/S2-LessonA-Step${i}-${code}-${errorCount}.png` });
  43  |           const nextBtn = page.getByRole('button', { name: /Next|Finish/i });
  44  |           if (await nextBtn.isVisible()) {
  45  |             await nextBtn.click();
  46  |             await page.waitForTimeout(600); // wait for lesson transition
  47  |           }
  48  |         }
  49  | 
  50  |         // S3 Codeword Build
  51  |         // wait for codeword animation
  52  |         await page.waitForTimeout(1500);
  53  |         await page.screenshot({ path: `qa/S3-CodewordBuild-${code}-${errorCount}.png` });
  54  | 
  55  |         // S4 To Channel
  56  |         // Tray should be sliding to channel...
  57  |         await page.waitForTimeout(1500); 
  58  |         await page.screenshot({ path: `qa/S4-Channel-${code}-${errorCount}.png` });
  59  | 
  60  |         // S5 Noise
  61  |         // inject errors
  62  |         if (errorCount > 0) {
  63  |           // Inject noise via HUD button or clicking spheres
  64  |           for (let i = 0; i < errorCount; i++) {
  65  |             const noiseBtn = page.getByRole('button', { name: /Inject Channel Noise/i });
  66  |             if (await noiseBtn.isVisible()) {
  67  |               await noiseBtn.click();
  68  |               await page.waitForTimeout(500);
  69  |             }
  70  |           }
  71  |         }
  72  |         await page.screenshot({ path: `qa/S5-Noise-${code}-${errorCount}.png` });
  73  | 
  74  |         const proceedBtn = page.getByRole('button', { name: /Proceed to Receiver/i });
  75  |         if (await proceedBtn.isVisible()) {
  76  |           await proceedBtn.click();
  77  |         }
  78  |         await page.waitForTimeout(1500); // wait for camera to RX
  79  | 
  80  |         // S6 Lesson B (Steps 6-9)
  81  |         for (let i = 6; i <= 9; i++) {
  82  |           await page.screenshot({ path: `qa/S6-LessonB-Step${i}-${code}-${errorCount}.png` });
  83  |           const nextBtn = page.getByRole('button', { name: /Next|Finish/i });
  84  |           if (await nextBtn.isVisible()) {
  85  |             await nextBtn.click();
  86  |             await page.waitForTimeout(600);
  87  |           }
  88  |         }
  89  | 
  90  |         // S7 Result
  91  |         await page.waitForTimeout(1500);
  92  |         await page.screenshot({ path: `qa/S7-Result-${code}-${errorCount}.png` });
  93  | 
  94  |         // Global: start over
  95  |         const restartBtn = page.getByRole('button', { name: /Start Over/i });
  96  |         if (await restartBtn.isVisible()) {
  97  |           await restartBtn.click();
  98  |           await page.waitForTimeout(1000);
  99  |         }
  100 | 
  101 |         const severeErrors = logs.filter(l => !l.includes('Box3')); // filter out Box3 layout guard if active
  102 |         if (severeErrors.length > 0) {
  103 |           console.error("Browser errors encountered:", severeErrors);
  104 |         }
  105 |         // Not failing on everything immediately just so we get screenshots initially
  106 |       });
  107 |     }
  108 |   }
  109 | });
  110 | 
```