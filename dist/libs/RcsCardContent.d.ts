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
interface ClassificationResult {
    classification: RcsContentClassification;
    billableText: string;
}
export declare const classifyRcsContent: (content: RcsCardContent) => ClassificationResult;
export {};
