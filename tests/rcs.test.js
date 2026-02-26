const { RcsSegmentedMessage } = require('../dist');

describe('RCS US segmentation', () => {
  test('empty message has 0 segments', () => {
    const rcsMessage = new RcsSegmentedMessage('', 'us');
    expect(rcsMessage.segmentsCount).toBe(0);
    expect(rcsMessage.numberOfBytes).toBe(0);
    expect(rcsMessage.messageSize).toBe(0);
    expect(rcsMessage.segments).toHaveLength(0);
    expect(rcsMessage.messageType).toBe('Rich');
  });

  test('single character is one Rich segment', () => {
    const rcsMessage = new RcsSegmentedMessage('a', 'us');
    expect(rcsMessage.segmentsCount).toBe(1);
    expect(rcsMessage.messageType).toBe('Rich');
    expect(rcsMessage.numberOfBytes).toBe(1);
  });

  test('160 UTF-8 bytes stays in one Rich segment', () => {
    const message = 'a'.repeat(160);
    const rcsMessage = new RcsSegmentedMessage(message, 'us');

    expect(rcsMessage.segmentsCount).toBe(1);
    expect(rcsMessage.messageType).toBe('Rich');
    expect(rcsMessage.numberOfBytes).toBe(160);
    expect(rcsMessage.messageSize).toBe(1280);
  });

  test('161 UTF-8 bytes splits into two Rich segments', () => {
    const message = 'a'.repeat(161);
    const rcsMessage = new RcsSegmentedMessage(message, 'us');

    expect(rcsMessage.segmentsCount).toBe(2);
    expect(rcsMessage.messageType).toBe('Rich');
    expect(rcsMessage.segments[0].used).toBe(160);
    expect(rcsMessage.segments[1].used).toBe(1);
  });

  test('320 bytes fills exactly two segments', () => {
    const message = 'a'.repeat(320);
    const rcsMessage = new RcsSegmentedMessage(message, 'us');

    expect(rcsMessage.segmentsCount).toBe(2);
    expect(rcsMessage.segments[0].used).toBe(160);
    expect(rcsMessage.segments[1].used).toBe(160);
  });

  test('321 bytes spills into third segment', () => {
    const message = 'a'.repeat(321);
    const rcsMessage = new RcsSegmentedMessage(message, 'us');

    expect(rcsMessage.segmentsCount).toBe(3);
    expect(rcsMessage.segments[2].used).toBe(1);
  });

  test('very long message (1000 bytes) segments correctly', () => {
    const message = 'a'.repeat(1000);
    const rcsMessage = new RcsSegmentedMessage(message, 'us');

    expect(rcsMessage.segmentsCount).toBe(7);
    expect(rcsMessage.numberOfBytes).toBe(1000);
    // First 6 segments full, last has remainder
    expect(rcsMessage.segments[5].used).toBe(160);
    expect(rcsMessage.segments[6].used).toBe(40);
  });
});

describe('RCS International billing', () => {
  test('empty message has 0 segments', () => {
    const rcsMessage = new RcsSegmentedMessage('', 'international');
    expect(rcsMessage.segmentsCount).toBe(0);
    expect(rcsMessage.segments).toHaveLength(0);
    expect(rcsMessage.messageType).toBe('Basic');
  });

  test('160 UTF-8 bytes is Basic', () => {
    const message = 'a'.repeat(160);
    const rcsMessage = new RcsSegmentedMessage(message, 'international');

    expect(rcsMessage.segmentsCount).toBe(1);
    expect(rcsMessage.messageType).toBe('Basic');
    expect(rcsMessage.segments[0].capacity).toBe(160);
    expect(rcsMessage.segments[0].used).toBe(160);
  });

  test('161 UTF-8 bytes is Single', () => {
    const message = 'a'.repeat(161);
    const rcsMessage = new RcsSegmentedMessage(message, 'international');

    expect(rcsMessage.segmentsCount).toBe(1);
    expect(rcsMessage.messageType).toBe('Single');
    // International capacity matches usage (no segmentation concept)
    expect(rcsMessage.segments[0].capacity).toBe(161);
    expect(rcsMessage.segments[0].used).toBe(161);
  });

  test('International never segments regardless of length', () => {
    const message = 'a'.repeat(1000);
    const rcsMessage = new RcsSegmentedMessage(message, 'international');

    expect(rcsMessage.segmentsCount).toBe(1);
    expect(rcsMessage.messageType).toBe('Single');
    expect(rcsMessage.segments).toHaveLength(1);
    expect(rcsMessage.segments[0].capacity).toBe(1000);
  });
});

describe('RCS UTF-8 byte counting', () => {
  test('ASCII characters are 1 byte each', () => {
    const rcsMessage = new RcsSegmentedMessage('Hello', 'us');
    expect(rcsMessage.numberOfBytes).toBe(5);
  });

  test('2-byte characters (e.g. accented Latin)', () => {
    // é is U+00E9, encoded as 2 UTF-8 bytes
    const rcsMessage = new RcsSegmentedMessage('é', 'us');
    expect(rcsMessage.numberOfBytes).toBe(2);
  });

  test('3-byte characters (e.g. CJK)', () => {
    // 中 is U+4E2D, encoded as 3 UTF-8 bytes
    const rcsMessage = new RcsSegmentedMessage('中', 'us');
    expect(rcsMessage.numberOfBytes).toBe(3);
  });

  test('4-byte emoji', () => {
    const rcsMessage = new RcsSegmentedMessage('😄', 'us');
    expect(rcsMessage.numberOfBytes).toBe(4);
    expect(rcsMessage.messageSize).toBe(32);
  });

  test('mixed ASCII and multi-byte characters', () => {
    // "Hi 😀!" = H(1) + i(1) + space(1) + 😀(4) + !(1) = 8 bytes
    const rcsMessage = new RcsSegmentedMessage('Hi 😀!', 'us');
    expect(rcsMessage.numberOfBytes).toBe(8);
  });

  test('multi-byte characters at segment boundary', () => {
    // Fill 159 bytes with ASCII, then add a 2-byte char
    // Total: 161 bytes, should split into 2 segments
    const message = 'a'.repeat(159) + 'é';
    const rcsMessage = new RcsSegmentedMessage(message, 'us');
    expect(rcsMessage.numberOfBytes).toBe(161);
    expect(rcsMessage.segmentsCount).toBe(2);
  });

  test('defaults to US region', () => {
    const rcsMessage = new RcsSegmentedMessage('test');
    expect(rcsMessage.region).toBe('us');
    expect(rcsMessage.messageType).toBe('Rich');
  });
});
