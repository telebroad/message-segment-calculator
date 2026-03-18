const { analyzeSms } = require('../dist/browser/segmenter');

describe('charDetails extraction', () => {
  test('GSM-7 message has correct encoding and code units', () => {
    const result = analyzeSms('AB', 'auto', false);
    expect(result.charDetails).toHaveLength(2);
    expect(result.charDetails[0]).toMatchObject({
      raw: 'A',
      isGSM7: true,
      segmentIndex: 0,
      messageEncoding: 'GSM-7',
    });
    expect(result.charDetails[0].codeUnits).toEqual([65]);
  });

  test('UCS-2 message shows correct encoding for all chars', () => {
    const result = analyzeSms('@😀', 'auto', false);
    expect(result.encoding).toBe('unicode');
    expect(result.charDetails).toHaveLength(2);

    // '@' is GSM-compatible but message encoding is UCS-2
    const atDetail = result.charDetails[0];
    expect(atDetail.raw).toBe('@');
    expect(atDetail.isGSM7).toBe(true);
    expect(atDetail.messageEncoding).toBe('UCS-2');
    expect(atDetail.codeUnits).toEqual([0x0040]); // UTF-16, not GSM septet

    // Emoji is non-GSM
    const emojiDetail = result.charDetails[1];
    expect(emojiDetail.isGSM7).toBe(false);
    expect(emojiDetail.messageEncoding).toBe('UCS-2');
  });

  test('multi-segment message assigns correct segment indices', () => {
    const longMessage = 'A'.repeat(161); // forces 2 GSM-7 segments
    const result = analyzeSms(longMessage, 'auto', false);
    expect(result.charDetails).toHaveLength(161);
    expect(result.charDetails[0].segmentIndex).toBe(0);
    expect(result.charDetails[152].segmentIndex).toBe(0); // last char in segment 1
    expect(result.charDetails[153].segmentIndex).toBe(1); // first char in segment 2
    expect(result.charDetails[160].segmentIndex).toBe(1);
  });

  test('UDH entries are excluded from charDetails', () => {
    const longMessage = 'A'.repeat(161);
    const result = analyzeSms(longMessage, 'auto', false);
    // All charDetails should be user characters, no UDH
    result.charDetails.forEach((detail) => {
      expect(detail.raw).toBe('A');
    });
  });

  test('empty message returns empty charDetails', () => {
    const result = analyzeSms('', 'auto', false);
    expect(result.charDetails).toEqual([]);
  });
});
