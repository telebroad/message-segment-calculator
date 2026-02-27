export interface RcsCardAction {
  type: string;
  title?: string | null;
  url?: string | null;
  phone?: string | null;
  webview_size?: string | null;
}

export interface RcsCardContent {
  content_type: string;
  title?: string | null;
  body?: string | null;
  subtitle?: string | null;
  media?: string | string[] | null;
  actions?: RcsCardAction[] | null;
  orientation?: string | null;
  thumbnailImageAlignment?: string | null;
  height?: string | null;
}

export type RcsContentClassification = 'Rich' | 'Rich media';

const RICH_MEDIA: RcsContentClassification = 'Rich media';
const RICH: RcsContentClassification = 'Rich';

interface ClassificationResult {
  classification: RcsContentClassification;
  billableText: string;
}

const isPresent = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const hasMedia = (content: RcsCardContent): boolean => {
  if (!content.media) return false;
  if (Array.isArray(content.media)) return content.media.length > 0;
  return isPresent(content.media);
};

const hasWebviewAction = (content: RcsCardContent): boolean => {
  if (!content.actions) return false;
  return content.actions.some((action) => {
    const type = action.type.toLowerCase();
    const size = typeof action.webview_size === 'string' ? action.webview_size.toUpperCase() : '';
    return type === 'url' && size !== '' && size !== 'NONE';
  });
};

/**
 * Normalizes raw API JSON into the flat RcsCardContent format.
 *
 * The Twilio API returns rich content wrapped under a content-type key:
 *   { "twilio/card": { title: "...", body: null, ... } }
 *
 * This function detects that wrapper and extracts the inner object,
 * setting `content_type` accordingly. If the input is already in the
 * flat format (has a `content_type` string property), it is returned as-is.
 */
export const normalizeRcsContent = (raw: Record<string, unknown>): RcsCardContent => {
  // Already in flat format
  // eslint-disable-next-line camelcase
  if (typeof raw.content_type === 'string') {
    return raw as unknown as RcsCardContent;
  }

  // Look for a wrapper key like "twilio/card", "twilio/media", etc.
  const wrapperKey = Object.keys(raw).find((key) => key.startsWith('twilio/'));
  if (wrapperKey && typeof raw[wrapperKey] === 'object' && raw[wrapperKey] !== null) {
    const inner = raw[wrapperKey] as Record<string, unknown>;
    // eslint-disable-next-line camelcase
    return { content_type: wrapperKey, ...inner } as unknown as RcsCardContent;
  }

  // Fallback: treat as unknown content type
  // eslint-disable-next-line camelcase
  return { content_type: 'unknown', ...raw } as unknown as RcsCardContent;
};

export const classifyRcsContent = (content: RcsCardContent): ClassificationResult => {
  const richMedia = { classification: RICH_MEDIA, billableText: '' };

  // Non-twilio/card content types are always Rich media
  if (content.content_type !== 'twilio/card') {
    return richMedia;
  }

  // Media present -> Rich media
  if (hasMedia(content)) {
    return richMedia;
  }

  // Webview action (webview_size other than NONE) -> Rich media
  if (hasWebviewAction(content)) {
    return richMedia;
  }

  const hasTitle = isPresent(content.title);
  const hasBody = isPresent(content.body);
  const hasSubtitle = isPresent(content.subtitle);

  // Title + subtitle -> Rich media
  if (hasTitle && hasSubtitle) {
    return richMedia;
  }

  // Title + body -> Rich media
  if (hasTitle && hasBody) {
    return richMedia;
  }

  // Title only -> Rich
  if (hasTitle) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return { classification: RICH, billableText: content.title!.trim() };
  }

  // Body + subtitle -> Rich (subtitle appended to body)
  if (hasBody && hasSubtitle) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const text = `${content.body!.trim()}\n${content.subtitle!.trim()}`;
    return { classification: RICH, billableText: text };
  }

  // Body only -> Rich
  if (hasBody) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return { classification: RICH, billableText: content.body!.trim() };
  }

  // Empty card -> Rich with empty text
  return { classification: RICH, billableText: '' };
};
