import type { SmsAnalysis, RcsAnalysis } from './types';
export interface SmsRenderTargets {
    encodingBadge: HTMLElement;
    encodingValue: HTMLElement;
    characters: HTMLElement;
    segments: HTMLElement;
    remaining: HTMLElement;
    segmentTape: HTMLElement;
    encodingSummary: HTMLElement;
    messageSize: HTMLElement;
    totalSize: HTMLElement;
    unicodeScalars: HTMLElement;
    nonGsmEmpty: HTMLElement;
    nonGsmTable: HTMLTableElement;
    nonGsmTableBody: HTMLElement;
    warnings: HTMLElement;
    error: HTMLElement;
}
export interface RcsRenderTargets {
    encodingBadge: HTMLElement;
    encodingValue: HTMLElement;
    characters: HTMLElement;
    segments: HTMLElement;
    messageType: HTMLElement;
    remaining: HTMLElement;
    size: HTMLElement;
    segmentTape: HTMLElement;
    detailsText: HTMLElement;
    detailSize: HTMLElement;
    detailBytes: HTMLElement;
    detailBilling: HTMLElement;
}
export declare const renderSms: (analysis: SmsAnalysis, targets: SmsRenderTargets, errorMessage?: string) => void;
export declare const renderRcs: (analysis: RcsAnalysis, targets: RcsRenderTargets) => void;
