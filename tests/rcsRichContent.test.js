const { RcsRichContentMessage, classifyRcsContent, normalizeRcsContent } = require('../dist');

// Helper to build a minimal twilio/card content object
const card = (fields = {}) => ({ content_type: 'twilio/card', ...fields });

describe('classifyRcsContent', () => {
  describe('Rich classifications', () => {
    test('title only -> Rich', () => {
      const result = classifyRcsContent(card({ title: 'Hello' }));
      expect(result.classification).toBe('Rich');
      expect(result.billableText).toBe('Hello');
    });

    test('body only -> Rich', () => {
      const result = classifyRcsContent(card({ body: 'World' }));
      expect(result.classification).toBe('Rich');
      expect(result.billableText).toBe('World');
    });

    test('body + subtitle -> Rich', () => {
      const result = classifyRcsContent(card({ body: 'Hello', subtitle: 'World' }));
      expect(result.classification).toBe('Rich');
      expect(result.billableText).toBe('Hello\nWorld');
    });

    test('empty card -> Rich with empty text', () => {
      const result = classifyRcsContent(card());
      expect(result.classification).toBe('Rich');
      expect(result.billableText).toBe('');
    });

    test('whitespace-only fields treated as absent', () => {
      const result = classifyRcsContent(card({ title: '   ', body: 'Real content' }));
      expect(result.classification).toBe('Rich');
      expect(result.billableText).toBe('Real content');
    });
  });

  describe('Rich media classifications', () => {
    test('title + subtitle -> Rich media', () => {
      const result = classifyRcsContent(card({ title: 'Hello', subtitle: 'Sub' }));
      expect(result.classification).toBe('Rich media');
    });

    test('title + body -> Rich media', () => {
      const result = classifyRcsContent(card({ title: 'Hello', body: 'World' }));
      expect(result.classification).toBe('Rich media');
    });

    test('title + body + subtitle -> Rich media', () => {
      const result = classifyRcsContent(
        card({ title: 'Hello', body: 'World', subtitle: 'Sub' }),
      );
      expect(result.classification).toBe('Rich media');
    });

    test('media present (string) -> Rich media', () => {
      const result = classifyRcsContent(card({ title: 'Hi', media: 'https://example.com/img.jpg' }));
      expect(result.classification).toBe('Rich media');
    });

    test('media present (array) -> Rich media', () => {
      const result = classifyRcsContent(
        card({ title: 'Hi', media: ['https://example.com/img.jpg'] }),
      );
      expect(result.classification).toBe('Rich media');
    });

    test('empty media array does not trigger Rich media', () => {
      const result = classifyRcsContent(card({ title: 'Hi', media: [] }));
      expect(result.classification).toBe('Rich');
    });

    test('action url with webview_size HALF -> Rich media', () => {
      const result = classifyRcsContent(
        card({ title: 'Hi', actions: [{ type: 'url', webview_size: 'HALF' }] }),
      );
      expect(result.classification).toBe('Rich media');
    });

    test('action url with webview_size TALL -> Rich media', () => {
      const result = classifyRcsContent(
        card({ title: 'Hi', actions: [{ type: 'url', webview_size: 'TALL' }] }),
      );
      expect(result.classification).toBe('Rich media');
    });

    test('action url with webview_size FULL -> Rich media', () => {
      const result = classifyRcsContent(
        card({ title: 'Hi', actions: [{ type: 'url', webview_size: 'FULL' }] }),
      );
      expect(result.classification).toBe('Rich media');
    });

    test('non twilio/card content_type -> Rich media', () => {
      const result = classifyRcsContent({ content_type: 'twilio/media', title: 'Hi' });
      expect(result.classification).toBe('Rich media');
    });
  });

  describe('Actions that do NOT trigger Rich media', () => {
    test('action url with webview_size NONE -> Rich', () => {
      const result = classifyRcsContent(
        card({ title: 'Hi', actions: [{ type: 'url', webview_size: 'NONE' }] }),
      );
      expect(result.classification).toBe('Rich');
    });

    test('action url without webview_size -> Rich', () => {
      const result = classifyRcsContent(
        card({ title: 'Hi', actions: [{ type: 'url', url: 'https://example.com' }] }),
      );
      expect(result.classification).toBe('Rich');
    });

    test('quickreply actions -> Rich', () => {
      const result = classifyRcsContent(
        card({ title: 'Hi', actions: [{ type: 'quickreply', title: 'Yes' }] }),
      );
      expect(result.classification).toBe('Rich');
    });

    test('phone actions -> Rich', () => {
      const result = classifyRcsContent(
        card({ title: 'Hi', actions: [{ type: 'phone', phone: '+15551234567' }] }),
      );
      expect(result.classification).toBe('Rich');
    });

    test('mixed non-webview actions -> Rich', () => {
      const result = classifyRcsContent(
        card({
          title: 'Hi',
          actions: [
            { type: 'quickreply', title: 'Yes' },
            { type: 'url', webview_size: 'NONE' },
            { type: 'phone', phone: '+15551234567' },
          ],
        }),
      );
      expect(result.classification).toBe('Rich');
    });

    test('one webview action among many triggers Rich media', () => {
      const result = classifyRcsContent(
        card({
          title: 'Hi',
          actions: [
            { type: 'quickreply', title: 'Yes' },
            { type: 'url', webview_size: 'HALF' },
            { type: 'phone', phone: '+15551234567' },
          ],
        }),
      );
      expect(result.classification).toBe('Rich media');
    });
  });

  describe('Layout fields have no effect', () => {
    test('orientation does not affect classification', () => {
      const result = classifyRcsContent(card({ title: 'Hi', orientation: 'HORIZONTAL' }));
      expect(result.classification).toBe('Rich');
    });

    test('thumbnailImageAlignment does not affect classification', () => {
      const result = classifyRcsContent(card({ title: 'Hi', thumbnailImageAlignment: 'LEFT' }));
      expect(result.classification).toBe('Rich');
    });

    test('height does not affect classification', () => {
      const result = classifyRcsContent(card({ title: 'Hi', height: 'TALL' }));
      expect(result.classification).toBe('Rich');
    });
  });
});

describe('RcsRichContentMessage — US Rich segmentation', () => {
  test('title-only: short message is 1 Rich segment', () => {
    const msg = new RcsRichContentMessage(card({ title: 'Hello' }), 'us');
    expect(msg.messageType).toBe('Rich');
    expect(msg.segmentsCount).toBe(1);
    expect(msg.numberOfBytes).toBe(5);
    expect(msg.billableText).toBe('Hello');
  });

  test('title-only: 160 bytes stays in one segment', () => {
    const msg = new RcsRichContentMessage(card({ title: 'a'.repeat(160) }), 'us');
    expect(msg.segmentsCount).toBe(1);
    expect(msg.numberOfBytes).toBe(160);
  });

  test('title-only: 161 bytes splits into two segments', () => {
    const msg = new RcsRichContentMessage(card({ title: 'a'.repeat(161) }), 'us');
    expect(msg.segmentsCount).toBe(2);
  });

  test('body-only: long message segments correctly', () => {
    const msg = new RcsRichContentMessage(card({ body: 'a'.repeat(500) }), 'us');
    expect(msg.segmentsCount).toBe(4);
    expect(msg.segments[3].used).toBe(20);
  });

  test('body + subtitle: segments based on combined text', () => {
    // body(100) + \n(1) + subtitle(60) = 161 bytes -> 2 segments
    const msg = new RcsRichContentMessage(
      card({ body: 'a'.repeat(100), subtitle: 'b'.repeat(60) }),
      'us',
    );
    expect(msg.messageType).toBe('Rich');
    expect(msg.numberOfBytes).toBe(161);
    expect(msg.segmentsCount).toBe(2);
  });

  test('JIRA example: title 486 chars + 3 suggested replies = 486 chars billed', () => {
    const msg = new RcsRichContentMessage(
      card({
        title: 'a'.repeat(486),
        actions: [
          { type: 'quickreply', title: 'SR1 twenty five chars..' },
          { type: 'quickreply', title: 'SR2 twenty five chars..' },
          { type: 'quickreply', title: 'SR3 twenty five chars..' },
        ],
      }),
      'us',
    );
    expect(msg.messageType).toBe('Rich');
    expect(msg.numberOfBytes).toBe(486);
    expect(msg.segmentsCount).toBe(4);
  });

  test('empty Rich card: 0 segments', () => {
    const msg = new RcsRichContentMessage(card(), 'us');
    expect(msg.messageType).toBe('Rich');
    expect(msg.segmentsCount).toBe(0);
    expect(msg.numberOfBytes).toBe(0);
  });
});

describe('RcsRichContentMessage — US Rich media', () => {
  test('title + body -> Rich media, 0 segments', () => {
    const msg = new RcsRichContentMessage(
      card({ title: 'Hello', body: 'World' }),
      'us',
    );
    expect(msg.messageType).toBe('Rich media');
    expect(msg.segmentsCount).toBe(0);
    expect(msg.numberOfBytes).toBe(0);
    expect(msg.segments).toHaveLength(0);
  });

  test('media present -> Rich media', () => {
    const msg = new RcsRichContentMessage(
      card({ title: 'Hi', media: ['https://example.com/img.jpg'] }),
      'us',
    );
    expect(msg.messageType).toBe('Rich media');
    expect(msg.segmentsCount).toBe(0);
  });

  test('webview action -> Rich media', () => {
    const msg = new RcsRichContentMessage(
      card({ title: 'Hi', actions: [{ type: 'url', webview_size: 'FULL' }] }),
      'us',
    );
    expect(msg.messageType).toBe('Rich media');
  });
});

describe('RcsRichContentMessage — International', () => {
  test('Rich title-only <= 160 bytes -> Basic', () => {
    const msg = new RcsRichContentMessage(card({ title: 'Hello' }), 'international');
    expect(msg.messageType).toBe('Basic');
    expect(msg.segmentsCount).toBe(1);
  });

  test('Rich title-only > 160 bytes -> Single', () => {
    const msg = new RcsRichContentMessage(
      card({ title: 'a'.repeat(161) }),
      'international',
    );
    expect(msg.messageType).toBe('Single');
    expect(msg.segmentsCount).toBe(1);
  });

  test('Rich media -> Rich media regardless of region', () => {
    const msg = new RcsRichContentMessage(
      card({ title: 'Hello', body: 'World' }),
      'international',
    );
    expect(msg.messageType).toBe('Rich media');
    expect(msg.segmentsCount).toBe(0);
  });
});

describe('RcsRichContentMessage — region validation', () => {
  test('defaults to US region', () => {
    const msg = new RcsRichContentMessage(card({ title: 'test' }));
    expect(msg.region).toBe('us');
  });

  test('throws on invalid region', () => {
    expect(() => new RcsRichContentMessage(card({ title: 'test' }), 'USA')).toThrow(
      'Invalid region',
    );
  });
});

describe('RcsRichContentMessage — encodingName', () => {
  test('always returns UTF-8', () => {
    const msg = new RcsRichContentMessage(card({ title: 'test' }), 'us');
    expect(msg.encodingName).toBe('UTF-8');
  });
});

describe('RcsRichContentMessage — multi-byte characters', () => {
  test('emoji in title counted correctly', () => {
    const msg = new RcsRichContentMessage(card({ title: '😄' }), 'us');
    expect(msg.numberOfBytes).toBe(4);
    expect(msg.segmentsCount).toBe(1);
  });

  test('CJK characters in body counted correctly', () => {
    // 54 CJK chars × 3 bytes = 162 bytes -> 2 US segments
    const msg = new RcsRichContentMessage(card({ body: '中'.repeat(54) }), 'us');
    expect(msg.numberOfBytes).toBe(162);
    expect(msg.segmentsCount).toBe(2);
  });
});

describe('normalizeRcsContent', () => {
  test('passes through flat format with content_type', () => {
    const input = { content_type: 'twilio/card', title: 'Hello' };
    const result = normalizeRcsContent(input);
    expect(result.content_type).toBe('twilio/card');
    expect(result.title).toBe('Hello');
  });

  test('unwraps "twilio/card" wrapper key', () => {
    const input = { 'twilio/card': { title: 'Hello', body: null, subtitle: null } };
    const result = normalizeRcsContent(input);
    expect(result.content_type).toBe('twilio/card');
    expect(result.title).toBe('Hello');
    expect(result.body).toBeNull();
  });

  test('unwraps "twilio/media" wrapper key', () => {
    const input = { 'twilio/media': { title: 'Image' } };
    const result = normalizeRcsContent(input);
    expect(result.content_type).toBe('twilio/media');
    expect(result.title).toBe('Image');
  });

  test('fallback for unknown structure', () => {
    const input = { foo: 'bar' };
    const result = normalizeRcsContent(input);
    expect(result.content_type).toBe('unknown');
  });
});

describe('classifyRcsContent — null field handling', () => {
  test('null title treated as absent', () => {
    const result = classifyRcsContent(card({ title: null, body: 'Hello' }));
    expect(result.classification).toBe('Rich');
    expect(result.billableText).toBe('Hello');
  });

  test('null body treated as absent', () => {
    const result = classifyRcsContent(card({ title: 'Hello', body: null }));
    expect(result.classification).toBe('Rich');
    expect(result.billableText).toBe('Hello');
  });

  test('null subtitle treated as absent', () => {
    const result = classifyRcsContent(card({ title: 'Hello', subtitle: null }));
    expect(result.classification).toBe('Rich');
  });

  test('null media treated as absent', () => {
    const result = classifyRcsContent(card({ title: 'Hello', media: null }));
    expect(result.classification).toBe('Rich');
  });

  test('null actions treated as absent', () => {
    const result = classifyRcsContent(card({ title: 'Hello', actions: null }));
    expect(result.classification).toBe('Rich');
  });
});

describe('classifyRcsContent — uppercase action types (real API format)', () => {
  test('URL with webview_size NONE -> Rich', () => {
    const result = classifyRcsContent(
      card({ title: 'Hi', actions: [{ type: 'URL', webview_size: 'NONE' }] }),
    );
    expect(result.classification).toBe('Rich');
  });

  test('URL with webview_size FULL -> Rich media', () => {
    const result = classifyRcsContent(
      card({ title: 'Hi', actions: [{ type: 'URL', webview_size: 'FULL' }] }),
    );
    expect(result.classification).toBe('Rich media');
  });

  test('QUICK_REPLY actions -> Rich', () => {
    const result = classifyRcsContent(
      card({ title: 'Hi', actions: [{ type: 'QUICK_REPLY', title: 'Yes' }] }),
    );
    expect(result.classification).toBe('Rich');
  });

  test('PHONE actions -> Rich', () => {
    const result = classifyRcsContent(
      card({ title: 'Hi', actions: [{ type: 'PHONE', phone: '+15551234567' }] }),
    );
    expect(result.classification).toBe('Rich');
  });
});

describe('End-to-end: real Twilio API JSON format', () => {
  test('title-only with URL(NONE) and QUICK_REPLY -> Rich', () => {
    const raw = {
      'twilio/card': {
        title: 'a]'.repeat(160),
        body: null,
        subtitle: null,
        media: [],
        actions: [
          { type: 'URL', title: 'Visit', url: 'https://example.com', webview_size: 'NONE' },
          { type: 'QUICK_REPLY', title: 'Yes' },
          { type: 'QUICK_REPLY', title: 'No' },
        ],
      },
    };
    const content = normalizeRcsContent(raw);
    const result = classifyRcsContent(content);
    expect(result.classification).toBe('Rich');
    expect(result.billableText).toBe('a]'.repeat(160));
  });

  test('body + subtitle with title null -> Rich', () => {
    const raw = {
      'twilio/card': {
        title: null,
        body: 'Your order has shipped',
        subtitle: 'Track it now',
        media: null,
        actions: [],
      },
    };
    const content = normalizeRcsContent(raw);
    const result = classifyRcsContent(content);
    expect(result.classification).toBe('Rich');
    expect(result.billableText).toBe('Your order has shipped\nTrack it now');
  });

  test('title + subtitle present -> Rich media', () => {
    const raw = {
      'twilio/card': {
        title: 'Order Update',
        body: null,
        subtitle: 'Details inside',
        media: [],
        actions: [],
      },
    };
    const content = normalizeRcsContent(raw);
    const result = classifyRcsContent(content);
    expect(result.classification).toBe('Rich media');
  });

  test('RcsRichContentMessage with normalized API payload', () => {
    const raw = {
      'twilio/card': {
        title: 'Hello from Twilio RCS!',
        body: null,
        subtitle: null,
        media: [],
        actions: [
          { type: 'QUICK_REPLY', title: 'Yes' },
          { type: 'QUICK_REPLY', title: 'No' },
        ],
      },
    };
    const content = normalizeRcsContent(raw);
    const msg = new RcsRichContentMessage(content, 'us');
    expect(msg.messageType).toBe('Rich');
    expect(msg.numberOfBytes).toBe(22);
    expect(msg.segmentsCount).toBe(1);
  });
});
