const { countUtf8Bytes } = require('../dist/libs/textUtils');

describe('countUtf8Bytes', () => {
  test('empty string is 0 bytes', () => {
    expect(countUtf8Bytes('')).toBe(0);
  });

  test('ASCII characters are 1 byte each', () => {
    expect(countUtf8Bytes('Hello')).toBe(5);
  });

  test('2-byte characters (Latin accented)', () => {
    // é is U+00E9 → 2 bytes
    expect(countUtf8Bytes('é')).toBe(2);
    // ñ is U+00F1 → 2 bytes
    expect(countUtf8Bytes('ñ')).toBe(2);
  });

  test('3-byte characters (CJK)', () => {
    // 中 is U+4E2D → 3 bytes
    expect(countUtf8Bytes('中')).toBe(3);
    // 日 is U+65E5 → 3 bytes
    expect(countUtf8Bytes('日')).toBe(3);
  });

  test('4-byte characters (emoji)', () => {
    // 😀 is U+1F600 → 4 bytes
    expect(countUtf8Bytes('😀')).toBe(4);
    // 🌍 is U+1F30D → 4 bytes
    expect(countUtf8Bytes('🌍')).toBe(4);
  });

  test('mixed character widths', () => {
    // H(1) + é(2) + 中(3) + 😀(4) = 10
    expect(countUtf8Bytes('Hé中😀')).toBe(10);
  });

  test('flag emoji (regional indicator pair)', () => {
    // 🇺🇸 = U+1F1FA(4) + U+1F1F8(4) = 8 bytes
    expect(countUtf8Bytes('🇺🇸')).toBe(8);
  });

  test('ZWJ emoji sequence', () => {
    // 👨‍👩‍👧 = 👨(4) + ZWJ(3) + 👩(4) + ZWJ(3) + 👧(4) = 18
    expect(countUtf8Bytes('👨\u200D👩\u200D👧')).toBe(18);
  });

  test('newline characters', () => {
    expect(countUtf8Bytes('\n')).toBe(1);
    expect(countUtf8Bytes('\r\n')).toBe(2);
    expect(countUtf8Bytes('\t')).toBe(1);
  });

  test('null character is 1 byte', () => {
    expect(countUtf8Bytes('\0')).toBe(1);
  });

  test('boundary code points', () => {
    // U+007F (last 1-byte) → 1 byte
    expect(countUtf8Bytes('\u007F')).toBe(1);
    // U+0080 (first 2-byte) → 2 bytes
    expect(countUtf8Bytes('\u0080')).toBe(2);
    // U+07FF (last 2-byte) → 2 bytes
    expect(countUtf8Bytes('\u07FF')).toBe(2);
    // U+0800 (first 3-byte) → 3 bytes
    expect(countUtf8Bytes('\u0800')).toBe(3);
    // U+FFFF (last 3-byte) → 3 bytes
    expect(countUtf8Bytes('\uFFFF')).toBe(3);
  });

  test('long ASCII string byte count', () => {
    const message = 'a'.repeat(1600);
    expect(countUtf8Bytes(message)).toBe(1600);
  });

  test('long multi-byte string byte count', () => {
    // 400 CJK chars × 3 bytes = 1200
    const message = '中'.repeat(400);
    expect(countUtf8Bytes(message)).toBe(1200);
  });

  test('matches TextEncoder output for complex strings', () => {
    const testStrings = [
      'Hello, World!',
      'café ☕',
      '你好世界',
      '😀🎉🚀💯',
      'Mix: abc αβγ 中文 😀',
      'a'.repeat(1000) + '😀'.repeat(100),
    ];
    const encoder = new TextEncoder();
    testStrings.forEach((str) => {
      expect(countUtf8Bytes(str)).toBe(encoder.encode(str).length);
    });
  });
});
