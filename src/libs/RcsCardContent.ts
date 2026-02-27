export interface RcsCardAction {
  type: 'quickreply' | 'url' | 'phone';
  title?: string;
  url?: string;
  phone?: string;
  webview_size?: 'NONE' | 'HALF' | 'TALL' | 'FULL';
}

export interface RcsCardContent {
  content_type: string;
  title?: string;
  body?: string;
  subtitle?: string;
  media?: string | string[];
  actions?: RcsCardAction[];
  orientation?: string;
  thumbnailImageAlignment?: string;
  height?: string;
}

export type RcsContentClassification = 'Rich' | 'Rich media';

const RICH_MEDIA: RcsContentClassification = 'Rich media';
const RICH: RcsContentClassification = 'Rich';

interface ClassificationResult {
  classification: RcsContentClassification;
  billableText: string;
}

const isPresent = (value: string | undefined): value is string => typeof value === 'string' && value.trim().length > 0;

const hasMedia = (content: RcsCardContent): boolean => {
  if (!content.media) return false;
  if (Array.isArray(content.media)) return content.media.length > 0;
  return isPresent(content.media);
};

const hasWebviewAction = (content: RcsCardContent): boolean => {
  if (!content.actions) return false;
  return content.actions.some(
    (action) => action.type === 'url' && isPresent(action.webview_size) && action.webview_size !== 'NONE',
  );
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
