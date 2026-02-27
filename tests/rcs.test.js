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
    expect(rcsMessage.segments[0].capacity).toBe(1600);
    expect(rcsMessage.segments[0].used).toBe(161);
  });

  test('International never segments regardless of length', () => {
    const message = 'a'.repeat(1000);
    const rcsMessage = new RcsSegmentedMessage(message, 'international');

    expect(rcsMessage.segmentsCount).toBe(1);
    expect(rcsMessage.messageType).toBe('Single');
    expect(rcsMessage.segments).toHaveLength(1);
    expect(rcsMessage.segments[0].capacity).toBe(1600);
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

  test('throws on invalid region', () => {
    expect(() => new RcsSegmentedMessage('test', 'USA')).toThrow('Invalid region');
    expect(() => new RcsSegmentedMessage('test', 'intl')).toThrow('Invalid region');
    expect(() => new RcsSegmentedMessage('test', '')).toThrow('Invalid region');
  });
});

describe('RCS International capacity reflects tier limit', () => {
  test('Basic message capacity is 160', () => {
    const rcsMessage = new RcsSegmentedMessage('Hello', 'international');
    expect(rcsMessage.segments[0].capacity).toBe(160);
    expect(rcsMessage.segments[0].used).toBe(5);
  });

  test('Single message capacity is 1600', () => {
    const message = 'a'.repeat(500);
    const rcsMessage = new RcsSegmentedMessage(message, 'international');
    expect(rcsMessage.segments[0].capacity).toBe(1600);
    expect(rcsMessage.segments[0].used).toBe(500);
  });

  test('International with multi-byte characters uses tier capacity', () => {
    // 100 CJK chars × 3 bytes = 300 bytes (Single)
    const message = '中'.repeat(100);
    const rcsMessage = new RcsSegmentedMessage(message, 'international');
    expect(rcsMessage.numberOfBytes).toBe(300);
    expect(rcsMessage.messageType).toBe('Single');
    expect(rcsMessage.segments[0].capacity).toBe(1600);
    expect(rcsMessage.segments[0].used).toBe(300);
  });

  test('International Basic threshold with multi-byte at boundary', () => {
    // 53 CJK chars × 3 bytes = 159 bytes (Basic, under 160)
    const message = '中'.repeat(53);
    const rcsMessage = new RcsSegmentedMessage(message, 'international');
    expect(rcsMessage.numberOfBytes).toBe(159);
    expect(rcsMessage.messageType).toBe('Basic');
  });

  test('International Single threshold with multi-byte at boundary', () => {
    // 54 CJK chars × 3 bytes = 162 bytes (Single, over 160)
    const message = '中'.repeat(54);
    const rcsMessage = new RcsSegmentedMessage(message, 'international');
    expect(rcsMessage.numberOfBytes).toBe(162);
    expect(rcsMessage.messageType).toBe('Single');
  });
});

describe('RCS US segment capacity is always 160', () => {
  test('single segment has capacity 160', () => {
    const rcsMessage = new RcsSegmentedMessage('Hello', 'us');
    expect(rcsMessage.segments[0].capacity).toBe(160);
  });

  test('all segments have capacity 160', () => {
    const message = 'a'.repeat(500);
    const rcsMessage = new RcsSegmentedMessage(message, 'us');
    expect(rcsMessage.segmentsCount).toBe(4);
    rcsMessage.segments.forEach((segment) => {
      expect(segment.capacity).toBe(160);
    });
  });

  test('last segment used is correct remainder', () => {
    const message = 'a'.repeat(500);
    const rcsMessage = new RcsSegmentedMessage(message, 'us');
    // 500 / 160 = 3 full + 20 remainder
    expect(rcsMessage.segments[3].used).toBe(20);
  });
});

describe('RCS totalSize and messageSize', () => {
  test('messageSize is bytes * 8', () => {
    const rcsMessage = new RcsSegmentedMessage('Hello', 'us');
    expect(rcsMessage.messageSize).toBe(5 * 8);
  });

  test('totalSize equals messageSize', () => {
    const rcsMessage = new RcsSegmentedMessage('Hello World!', 'us');
    expect(rcsMessage.totalSize).toBe(rcsMessage.messageSize);
  });

  test('empty message has zero size', () => {
    const rcsMessage = new RcsSegmentedMessage('', 'us');
    expect(rcsMessage.messageSize).toBe(0);
    expect(rcsMessage.totalSize).toBe(0);
  });
});

describe('RCS encodingName', () => {
  test('always returns UTF-8 for US', () => {
    const rcsMessage = new RcsSegmentedMessage('test', 'us');
    expect(rcsMessage.encodingName).toBe('UTF-8');
  });

  test('always returns UTF-8 for international', () => {
    const rcsMessage = new RcsSegmentedMessage('test', 'international');
    expect(rcsMessage.encodingName).toBe('UTF-8');
  });

  test('UTF-8 even for pure ASCII', () => {
    const rcsMessage = new RcsSegmentedMessage('abc');
    expect(rcsMessage.encodingName).toBe('UTF-8');
  });

  test('UTF-8 even for emoji', () => {
    const rcsMessage = new RcsSegmentedMessage('😀');
    expect(rcsMessage.encodingName).toBe('UTF-8');
  });
});

describe('RCS edge cases', () => {
  test('whitespace-only message counts bytes correctly', () => {
    const rcsMessage = new RcsSegmentedMessage('   ', 'us');
    expect(rcsMessage.numberOfBytes).toBe(3);
    expect(rcsMessage.segmentsCount).toBe(1);
  });

  test('newlines count as 1 byte each', () => {
    const rcsMessage = new RcsSegmentedMessage('\n\n\n', 'us');
    expect(rcsMessage.numberOfBytes).toBe(3);
  });

  test('CRLF counts as 2 bytes', () => {
    const rcsMessage = new RcsSegmentedMessage('\r\n', 'us');
    expect(rcsMessage.numberOfBytes).toBe(2);
  });

  test('message stores original text', () => {
    const text = 'Hello 世界 🌍';
    const rcsMessage = new RcsSegmentedMessage(text, 'us');
    expect(rcsMessage.message).toBe(text);
  });

  test('region is stored correctly', () => {
    const us = new RcsSegmentedMessage('test', 'us');
    const intl = new RcsSegmentedMessage('test', 'international');
    expect(us.region).toBe('us');
    expect(intl.region).toBe('international');
  });

  test('segment indices are sequential starting at 0', () => {
    const message = 'a'.repeat(500);
    const rcsMessage = new RcsSegmentedMessage(message, 'us');
    rcsMessage.segments.forEach((segment, i) => {
      expect(segment.index).toBe(i);
    });
  });

  test('all segment bytes sum to total bytes', () => {
    const message = 'a'.repeat(500);
    const rcsMessage = new RcsSegmentedMessage(message, 'us');
    const totalUsed = rcsMessage.segments.reduce((sum, s) => sum + s.used, 0);
    expect(totalUsed).toBe(rcsMessage.numberOfBytes);
  });

  test('compound emoji (flag) byte count', () => {
    // 🇺🇸 = U+1F1FA U+1F1F8 = 4 + 4 = 8 bytes
    const rcsMessage = new RcsSegmentedMessage('🇺🇸', 'us');
    expect(rcsMessage.numberOfBytes).toBe(8);
  });

  test('ZWJ emoji sequence byte count', () => {
    // 👨‍👩‍👧 = multiple code points joined by ZWJ
    const rcsMessage = new RcsSegmentedMessage('👨\u200D👩\u200D👧', 'us');
    // 👨(4) + ZWJ(3) + 👩(4) + ZWJ(3) + 👧(4) = 18 bytes
    expect(rcsMessage.numberOfBytes).toBe(18);
  });
});

describe('RCS API character limit boundary', () => {
  test('exactly 1,600 ASCII chars is within the limit', () => {
    const message = 'a'.repeat(1600);
    const rcsMessage = new RcsSegmentedMessage(message, 'us');
    expect(rcsMessage.numberOfBytes).toBe(1600);
    expect(rcsMessage.segmentsCount).toBe(10);
  });

  test('1,601 ASCII chars exceeds the limit', () => {
    const message = 'a'.repeat(1601);
    const rcsMessage = new RcsSegmentedMessage(message, 'us');
    expect(rcsMessage.numberOfBytes).toBe(1601);
    // The library correctly calculates segments; the 1,600 limit
    // is enforced at the API layer, not the library layer
    expect(rcsMessage.segmentsCount).toBe(11);
  });

  test('1,600 multi-byte chars produces more than 1,600 bytes', () => {
    // 1,600 × é(2 bytes) = 3,200 bytes
    const message = 'é'.repeat(1600);
    const rcsMessage = new RcsSegmentedMessage(message, 'us');
    expect(rcsMessage.numberOfBytes).toBe(3200);
  });
});

describe('RCS performance', () => {
  test('handles 10,000 byte messages efficiently', () => {
    const start = Date.now();
    const message = 'a'.repeat(10000);
    const rcsMessage = new RcsSegmentedMessage(message, 'us');
    const elapsed = Date.now() - start;

    expect(rcsMessage.segmentsCount).toBe(63);
    expect(elapsed).toBeLessThan(100);
  });

  test('handles large multi-byte messages efficiently', () => {
    const start = Date.now();
    // 5,000 emoji × 4 bytes = 20,000 bytes
    const message = '😀'.repeat(5000);
    const rcsMessage = new RcsSegmentedMessage(message, 'us');
    const elapsed = Date.now() - start;

    expect(rcsMessage.numberOfBytes).toBe(20000);
    expect(rcsMessage.segmentsCount).toBe(125);
    expect(elapsed).toBeLessThan(100);
  });
});
