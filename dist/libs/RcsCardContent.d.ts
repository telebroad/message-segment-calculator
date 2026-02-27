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
interface ClassificationResult {
    classification: RcsContentClassification;
    billableText: string;
}
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
export declare const normalizeRcsContent: (raw: Record<string, unknown>) => RcsCardContent;
export declare const classifyRcsContent: (content: RcsCardContent) => ClassificationResult;
export {};
