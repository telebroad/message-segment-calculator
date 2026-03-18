import { test, expect, Page } from '@playwright/test';

test.describe('Character detail view', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#message-input');
  });

  const typeMessage = async (page: Page, text: string) => {
    const input = page.locator('#message-input');
    await input.fill(text);
  };

  test('GSM-7 message shows all chars in segment colors, no red highlights', async ({ page }) => {
    await typeMessage(page, 'Hello World');

    const container = page.locator('#sms-char-detail');
    await expect(container).not.toBeHidden();

    const blocks = container.locator('.char-block');
    await expect(blocks).toHaveCount(11);

    for (const block of await blocks.all()) {
      const className = await block.getAttribute('class');
      expect(className).toMatch(/seg-\d/);
      expect(className).not.toContain('non-gsm');
    }
  });

  test('non-GSM characters show red border (non-gsm class)', async ({ page }) => {
    await typeMessage(page, 'Hello 😀');

    const container = page.locator('#sms-char-detail');
    const nonGsmBlocks = container.locator('.char-block.non-gsm');
    await expect(nonGsmBlocks).toHaveCount(1);

    const emojiBlock = nonGsmBlocks.first();
    await expect(emojiBlock).toHaveText('😀');
  });

  test('tooltip shows correct encoding and hex code units for GSM-7 message', async ({ page }) => {
    await typeMessage(page, 'A');

    const block = page.locator('.char-block').first();
    const title = await block.getAttribute('title');

    expect(title).toContain('GSM-7');
    expect(title).toContain('Segment 1');
    expect(title).toContain('0x0041');
  });

  test('tooltip shows UCS-2 encoding for all chars in a mixed message', async ({ page }) => {
    await typeMessage(page, '@😀');

    const blocks = page.locator('.char-block');
    await expect(blocks).toHaveCount(2);

    const atTitle = await blocks.first().getAttribute('title');
    expect(atTitle).toContain('UCS-2');
    expect(atTitle).toContain('0x0040');

    const emojiTitle = await blocks.nth(1).getAttribute('title');
    expect(emojiTitle).toContain('UCS-2');
  });

  test('char blocks are keyboard-focusable with aria-label', async ({ page }) => {
    await typeMessage(page, 'Hi');

    const firstBlock = page.locator('.char-block').first();
    await expect(firstBlock).toHaveAttribute('tabindex', '0');
    await expect(firstBlock).toHaveAttribute('role', 'img');

    const ariaLabel = await firstBlock.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain('GSM-7');
  });

  test('multi-segment message shows different colors per segment', async ({ page }) => {
    const longMessage = 'A'.repeat(161);
    await typeMessage(page, longMessage);

    const blocks = page.locator('.char-block');
    await expect(blocks).toHaveCount(161);

    const firstClass = await blocks.first().getAttribute('class');
    expect(firstClass).toContain('seg-0');

    const lastClass = await blocks.last().getAttribute('class');
    expect(lastClass).toContain('seg-1');
  });

  test('whitespace characters display as middle dot', async ({ page }) => {
    await typeMessage(page, 'A B');

    const blocks = page.locator('.char-block');
    await expect(blocks).toHaveCount(3);

    const spaceBlock = blocks.nth(1);
    await expect(spaceBlock).toHaveText('\u00B7');
  });

  test('empty message hides the char detail container', async ({ page }) => {
    const container = page.locator('#sms-char-detail');
    // Empty input: container has hidden attribute and no char blocks
    await expect(container).toHaveAttribute('hidden', '');
    await expect(container.locator('.char-block')).toHaveCount(0);

    await typeMessage(page, 'Hi');
    await expect(container).not.toHaveAttribute('hidden', '');
    await expect(container.locator('.char-block')).toHaveCount(2);

    await typeMessage(page, '');
    await expect(container).toHaveAttribute('hidden', '');
    await expect(container.locator('.char-block')).toHaveCount(0);
  });

  test('segment tape still renders alongside char detail', async ({ page }) => {
    await typeMessage(page, 'Hello');

    await expect(page.locator('#sms-segment-tape')).toBeVisible();
    await expect(page.locator('#sms-char-detail')).not.toBeHidden();
  });

  test('char detail section is collapsible', async ({ page }) => {
    await typeMessage(page, 'Hello');

    const section = page.locator('#sms-char-detail-section');
    await expect(section).toHaveAttribute('open', '');

    await section.locator('summary').click();
    await expect(section).not.toHaveAttribute('open', '');

    await section.locator('summary').click();
    await expect(section).toHaveAttribute('open', '');
  });
});
