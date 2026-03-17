import type { RcsRegion } from '../libs/RcsSegmentedMessage';
type EncodingKind = 'gsm7' | 'unicode' | 'rcs';
export type SmsEncodingSetting = 'auto' | 'GSM-7' | 'UCS-2';
export interface SegmentData {
    index: number;
    capacity: number;
    used: number;
}
export interface CharDetail {
    raw: string;
    codeUnits: number[];
    isGSM7: boolean;
    segmentIndex: number;
}
export interface SmsAnalysis {
    encoding: EncodingKind;
    encodingLabel: string;
    segments: SegmentData[];
    segmentsCount: number;
    characters: number;
    remaining: number;
    messageSize: number;
    totalSize: number;
    unicodeScalars: number;
    nonGsmCharacters: string[];
    warnings: string[];
    charDetails: CharDetail[];
}
export interface RcsAnalysis {
    encoding: EncodingKind;
    encodingLabel: string;
    region: RcsRegion;
    segments: SegmentData[];
    segmentsCount: number;
    characters: number;
    unicodeLength: number;
    remaining: number;
    messageSize: number;
    messageType: string;
}
export {};
