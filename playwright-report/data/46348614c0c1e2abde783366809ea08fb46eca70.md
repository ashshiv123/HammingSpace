# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: qa-flow.spec.ts >> Hamming Lab Flow QA >> Flow: (15,11) with 2 errors
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

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - banner [ref=f1e4]:
    - generic [ref=f1e5]:
      - generic [ref=f1e6]: HammingSpace
      - navigation [ref=f1e11]:
        - link "Theory" [ref=f1e12] [cursor=pointer]:
          - /url: /
        - link "Simulation" [ref=f1e13] [cursor=pointer]:
          - /url: /simulation
  - main [ref=f1e16]:
    - complementary [ref=f1e17]:
      - navigation [ref=f1e18]:
        - heading "Topics" [level=4] [ref=f1e19]
        - button "1. Hamming Space" [ref=f1e20]
        - button "2. Linear Block Codes & Parity" [ref=f1e22]
        - 'button "3. Parameters: The (n, k) Code" [ref=f1e24]'
        - button "4. Parity Bit Formula" [ref=f1e26]
        - button "5. Constructing the G Matrix" [ref=f1e28]
        - button "6. Codeword Formation" [ref=f1e30]
        - button "7. Transmission" [ref=f1e32]
        - button "8. Channel Noise" [ref=f1e34]
        - button "9. The Received Vector" [ref=f1e36]
        - button "10. The Parity-Check Matrix (H) & Syndrome" [ref=f1e38]
        - button "11. Final Decoding" [ref=f1e40]
    - generic [ref=f1e42]:
      - generic [ref=f1e43]:
        - heading "Theory & Architecture" [level=1] [ref=f1e44]
        - paragraph [ref=f1e45]: Understanding the math and geometry behind the (7,4) Hamming code simulation.
      - generic [ref=f1e46]:
        - generic [ref=f1e47]:
          - heading "1. Hamming Space" [level=3] [ref=f1e48]
          - generic [ref=f1e49]:
            - generic [ref=f1e50]:
              - paragraph [ref=f1e51]: Coding theory is fundamentally geometric, even though it's taught algebraically. A "Hamming Space" maps codewords as physical points in an $n$-dimensional hypercube.
              - paragraph [ref=f1e52]: In this space, valid messages (codewords) are placed far enough apart so that if a few bits flip (causing the point to drift), it's still physically closer to the original codeword than to any other valid one.
            - paragraph [ref=f1e67]: Valid codewords (blue) with correction radii in n-dimensional space.
        - generic [ref=f1e68]:
          - heading "2. Linear Block Codes & Parity" [level=3] [ref=f1e69]
          - generic [ref=f1e70]:
            - generic [ref=f1e71]:
              - paragraph [ref=f1e72]: A Linear Block Code maps a fixed-length $k$-bit message to an $n$-bit codeword by appending $n-k$ redundant parity bits. This extra padding is what allows the receiver to detect and fix errors.
              - paragraph [ref=f1e73]: The term "linear" means that adding any two valid codewords together (via XOR) produces another valid codeword.
            - generic [ref=f1e75]:
              - generic [ref=f1e77]:
                - generic [ref=f1e78]: Data (k)
                - generic [ref=f1e79]: Parity (n-k)
              - img [ref=f1e80]:
                - generic [ref=f1e82]: k = 4 bits
                - generic [ref=f1e84]: r = 3 bits
                - generic [ref=f1e86]: n = 7 bits (Codeword)
        - generic [ref=f1e87]:
          - 'heading "3. Parameters: The (n, k) Code" [level=3] [ref=f1e88]'
          - generic [ref=f1e90]:
            - paragraph [ref=f1e91]:
              - text: Codes are typically defined by their parameters
              - strong [ref=f1e92]: (n, k)
              - text: ":"
            - list [ref=f1e93]:
              - listitem [ref=f1e94]:
                - strong [ref=f1e95]: "n"
                - text: = Total number of bits in the transmitted block.
              - listitem [ref=f1e96]:
                - strong [ref=f1e97]: k
                - text: = Number of actual data/message bits.
              - listitem [ref=f1e98]:
                - strong [ref=f1e99]: n-k (or r)
                - text: = Number of parity bits.
            - paragraph [ref=f1e100]:
              - text: A famous example is the
              - strong [ref=f1e101]: (7, 4) Hamming Code
              - text: ", which sends 4 bits of data using 7 total bits (3 parity bits). It can correct exactly 1 bit error."
        - generic [ref=f1e102]:
          - heading "4. Parity Bit Formula" [level=3] [ref=f1e103]
          - generic [ref=f1e104]:
            - generic [ref=f1e105]:
              - paragraph [ref=f1e106]: How do we know we need exactly 3 parity bits for 4 data bits? We use the Hamming bound formula to ensure we have enough unique combinations to identify every possible single-bit error.
              - paragraph [ref=f1e107]:
                - text: "The formula is:"
                - code [ref=f1e108]: 2^r ≥ k + r + 1
              - paragraph [ref=f1e109]: For $k=4$, $r=2$ gives $4 \ge 7$ (False). But $r=3$ gives $8 \ge 8$ (True). So we need 3 parity bits.
            - generic [ref=f1e111]:
              - generic [ref=f1e112]:
                - generic [ref=f1e113]:
                  - text: "2"
                  - superscript [ref=f1e114]: r
                - text: ≥ m + r + 1
              - generic [ref=f1e115]:
                - generic [ref=f1e116]: m = 4 (Data)
                - generic [ref=f1e117]: r = ? (Parity)
                - generic [ref=f1e118]:
                  - generic [ref=f1e119]: "If r=2: 4 ≥ 4+2+1 ❌"
                  - generic [ref=f1e120]: "If r=3: 8 ≥ 4+3+1 ✅"
        - generic [ref=f1e121]:
          - heading "5. Constructing the G Matrix" [level=3] [ref=f1e122]
          - generic [ref=f1e124]:
            - paragraph [ref=f1e125]: The Generator Matrix ($G$) is the blueprint for creating codewords. For a systematic code (where the original message appears exactly at the start of the codeword), $G$ is constructed by joining an Identity Matrix ($I$) with a Parity Matrix ($P$).
            - paragraph [ref=f1e126]: $G = [ I_k | P ]$
            - code [ref=f1e129]: G = [ 1 0 0 0 | 1 1 0 0 1 0 0 | 0 1 1 0 0 1 0 | 1 1 1 0 0 0 1 | 1 0 1 ]
        - generic [ref=f1e130]:
          - heading "6. Codeword Formation" [level=3] [ref=f1e131]
          - generic [ref=f1e132]:
            - generic [ref=f1e133]:
              - paragraph [ref=f1e134]: To encode our message $m$, we multiply it by the Generator matrix $G$. All math is done in Galois Field 2 (GF(2)), meaning addition is done via XOR and there are no carries.
              - paragraph [ref=f1e135]:
                - text: "Equation:"
                - code [ref=f1e136]: c = m × G
              - paragraph [ref=f1e137]: If $m = [1 0 1 1]$, the resulting codeword $c$ will have the message in the first 4 bits, and the calculated parity in the last 3 bits.
            - generic [ref=f1e140]:
              - generic [ref=f1e141]: "[1 0 1 1]"
              - generic [ref=f1e142]: ×
              - generic [ref=f1e143]:
                - generic [ref=f1e144]: 1 0 0 0 | 1 1 0
                - generic [ref=f1e145]: 0 1 0 0 | 0 1 1
                - generic [ref=f1e146]: 0 0 1 0 | 1 1 1
                - generic [ref=f1e147]: 0 0 0 1 | 1 0 1
              - generic [ref=f1e148]: =
              - generic [ref=f1e149]: "[1 0 1 1 | 0 1 0]"
        - generic [ref=f1e150]:
          - heading "7. Transmission" [level=3] [ref=f1e151]
          - paragraph [ref=f1e154]: Once formed, the codeword $c$ is transmitted over a communication channel (like a fiber optic cable, deep space radio wave, or writing to a hard drive).
        - generic [ref=f1e155]:
          - heading "8. Channel Noise" [level=3] [ref=f1e156]
          - generic [ref=f1e157]:
            - generic [ref=f1e158]:
              - paragraph [ref=f1e159]: The physical world is noisy. Cosmic rays, thermal noise, or scratches can flip bits. In coding theory, we model this by adding an "error vector" $e$ to our codeword.
              - paragraph [ref=f1e160]: If the third bit flips, $e = [0 0 1 0 0 0 0]$.
            - generic [ref=f1e162]:
              - generic [ref=f1e163]:
                - generic [ref=f1e164]: Transmitted (c)
                - generic [ref=f1e165]:
                  - generic [ref=f1e166]: "1"
                  - generic [ref=f1e167]: "0"
                  - generic [ref=f1e168]: "1"
                  - generic [ref=f1e169]: "1"
                  - generic [ref=f1e170]: "0"
                  - generic [ref=f1e171]: "1"
                  - generic [ref=f1e172]: "0"
              - generic [ref=f1e173]:
                - generic [ref=f1e174]: + Noise (e)
                - generic [ref=f1e175]:
                  - generic [ref=f1e176]: "0"
                  - generic [ref=f1e177]: "0"
                  - generic [ref=f1e178]: "1"
                  - generic [ref=f1e179]: "0"
                  - generic [ref=f1e180]: "0"
                  - generic [ref=f1e181]: "0"
                  - generic [ref=f1e182]: "0"
              - generic [ref=f1e183]:
                - generic [ref=f1e184]: = Received (r)
                - generic [ref=f1e185]:
                  - generic [ref=f1e186]: "1"
                  - generic [ref=f1e187]: "0"
                  - generic [ref=f1e188]: "0"
                  - generic [ref=f1e189]: "1"
                  - generic [ref=f1e190]: "0"
                  - generic [ref=f1e191]: "1"
                  - generic [ref=f1e192]: "0"
        - generic [ref=f1e193]:
          - heading "9. The Received Vector" [level=3] [ref=f1e194]
          - generic [ref=f1e196]:
            - paragraph [ref=f1e197]: The receiver doesn't know $c$ or $e$; they only get the received vector $r$.
            - paragraph [ref=f1e198]:
              - text: "Equation:"
              - code [ref=f1e199]: r = c + e
              - text: (modulo-2 arithmetic).
            - paragraph [ref=f1e200]: The receiver's job is to figure out if $r$ is a valid codeword, and if not, which bit was flipped by $e$.
        - generic [ref=f1e201]:
          - heading "10. The Parity-Check Matrix (H) & Syndrome" [level=3] [ref=f1e202]
          - generic [ref=f1e203]:
            - generic [ref=f1e204]:
              - paragraph [ref=f1e205]:
                - text: The receiver multiplies $r$ by the transpose of the Parity-Check Matrix ($H$) to get the
                - strong [ref=f1e206]: Syndrome ($S$)
                - text: . Think of $S$ as an error fingerprint.
              - paragraph [ref=f1e207]:
                - code [ref=f1e208]: S = r × H^T
              - paragraph [ref=f1e209]: If $S = [0 0 0]$, there are no detected errors. If $S \neq [0 0 0]$, the syndrome precisely matches one of the columns in $H$, telling the receiver exactly which bit index is corrupted.
            - generic [ref=f1e211]:
              - generic [ref=f1e213]:
                - text: S = r × H
                - superscript [ref=f1e214]: T
              - generic [ref=f1e215]:
                - generic [ref=f1e216]: Syndrome Vector
                - generic [ref=f1e217]:
                  - generic [ref=f1e218]: "1"
                  - generic [ref=f1e219]: "1"
                  - generic [ref=f1e220]: "1"
                - generic [ref=f1e221]:
                  - generic [ref=f1e222]: Matches H-matrix column 3!
                  - generic [ref=f1e223]: Error is at bit index 3.
        - generic [ref=f1e224]:
          - heading "11. Final Decoding" [level=3] [ref=f1e225]
          - generic [ref=f1e227]:
            - paragraph [ref=f1e228]: Once the syndrome identifies the error column, the receiver flips that specific bit back to its correct state.
            - paragraph [ref=f1e229]: Because the code is systematic, the receiver can simply slice off the parity bits to perfectly recover the original $k$-bit message.
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
  26  |         await page.locator('select').selectOption(code);
  27  | 
  28  |         // Wait a moment for transition
  29  |         await page.waitForTimeout(500);
  30  |         await page.screenshot({ path: `qa/S0-Compose-${code}-${errorCount}.png` });
  31  | 
  32  |         // S1 Transmit
  33  |         await page.getByRole('button', { name: /Transmit & Encode/i }).click();
  34  |         await page.waitForTimeout(1000); // camera transition
  35  | 
  36  |         // S2 Lesson A (Steps 1-5)
  37  |         for (let i = 1; i <= 5; i++) {
  38  |           await page.screenshot({ path: `qa/S2-LessonA-Step${i}-${code}-${errorCount}.png` });
  39  |           const nextBtn = page.getByRole('button', { name: /Continue|Finish/i });
  40  |           if (await nextBtn.isVisible()) {
  41  |             await nextBtn.click();
  42  |             await page.waitForTimeout(600); // wait for lesson transition
  43  |           }
  44  |         }
  45  | 
  46  |         // S3 Codeword Build
  47  |         // wait for codeword animation
  48  |         await page.waitForTimeout(1500);
  49  |         await page.screenshot({ path: `qa/S3-CodewordBuild-${code}-${errorCount}.png` });
  50  | 
  51  |         // S4 To Channel
  52  |         // Tray should be sliding to channel...
  53  |         await page.waitForTimeout(1500); 
  54  |         await page.screenshot({ path: `qa/S4-Channel-${code}-${errorCount}.png` });
  55  | 
  56  |         // S5 Noise
  57  |         // inject errors
  58  |         if (errorCount > 0) {
  59  |           // Inject noise via HUD button or clicking spheres
  60  |           for (let i = 0; i < errorCount; i++) {
  61  |             const noiseBtn = page.getByRole('button', { name: /Inject Channel Noise/i });
  62  |             if (await noiseBtn.isVisible()) {
  63  |               await noiseBtn.click();
  64  |               await page.waitForTimeout(500);
  65  |             }
  66  |           }
  67  |         }
  68  |         await page.screenshot({ path: `qa/S5-Noise-${code}-${errorCount}.png` });
  69  | 
  70  |         const proceedBtn = page.getByRole('button', { name: /Proceed to Receiver/i });
  71  |         if (await proceedBtn.isVisible()) {
  72  |           await proceedBtn.click();
  73  |         }
  74  |         await page.waitForTimeout(1500); // wait for camera to RX
  75  | 
  76  |         // S6 Lesson B (Steps 6-9)
  77  |         for (let i = 6; i <= 9; i++) {
  78  |           await page.screenshot({ path: `qa/S6-LessonB-Step${i}-${code}-${errorCount}.png` });
  79  |           const nextBtn = page.getByRole('button', { name: /Continue|Finish/i });
  80  |           if (await nextBtn.isVisible()) {
  81  |             await nextBtn.click();
  82  |             await page.waitForTimeout(600);
  83  |           }
  84  |         }
  85  | 
  86  |         // S7 Result
  87  |         await page.waitForTimeout(1500);
  88  |         await page.screenshot({ path: `qa/S7-Result-${code}-${errorCount}.png` });
  89  | 
  90  |         // Global: start over
  91  |         const restartBtn = page.getByRole('button', { name: /Start Over|Reset/i });
  92  |         if (await restartBtn.isVisible()) {
  93  |           await restartBtn.click();
  94  |           await page.waitForTimeout(1000);
  95  |         }
  96  | 
  97  |         const severeErrors = logs.filter(l => !l.includes('Box3')); // filter out Box3 layout guard if active
  98  |         if (severeErrors.length > 0) {
  99  |           console.error("Browser errors encountered:", severeErrors);
  100 |         }
  101 |         // Not failing on everything immediately just so we get screenshots initially
  102 |       });
  103 |     }
  104 |   }
  105 | });
  106 | 
```