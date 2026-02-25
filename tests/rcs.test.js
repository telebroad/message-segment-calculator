const { RcsSegmentedMessage } = require('../dist');

describe('RCS US segmentation', () => {
  test('160 UTF-8 bytes stays in one Rich segment', () => {
    const message = 'a'.repeat(160);
    const rcsMessage = new RcsSegmentedMessage(message, 'us');

    expect(rcsMessage.segmentsCount).toBe(1);
    expect(rcsMessage.messageType).toBe('Rich');
    expect(rcsMessage.numberOfCharacters).toBe(160);
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
});

describe('RCS International billing', () => {
  test('160 UTF-8 bytes is Basic', () => {
    const message = 'a'.repeat(160);
    const rcsMessage = new RcsSegmentedMessage(message, 'international');

    expect(rcsMessage.segmentsCount).toBe(1);
    expect(rcsMessage.messageType).toBe('Basic');
  });

  test('161 UTF-8 bytes is Single', () => {
    const message = 'a'.repeat(161);
    const rcsMessage = new RcsSegmentedMessage(message, 'international');

    expect(rcsMessage.segmentsCount).toBe(1);
    expect(rcsMessage.messageType).toBe('Single');
  });
});

describe('RCS UTF-8 byte counting', () => {
  test('emoji counts as 4 bytes', () => {
    const rcsMessage = new RcsSegmentedMessage('😄', 'us');
    expect(rcsMessage.numberOfCharacters).toBe(4);
    expect(rcsMessage.messageSize).toBe(32);
  });
});
