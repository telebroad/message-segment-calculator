import { RcsCardContent } from './RcsCardContent';
import type { RcsRegion } from './RcsSegmentedMessage';
type RcsRichMessageType = 'Rich' | 'Basic' | 'Single' | 'Rich media';
interface RcsSegment {
    index: number;
    capacity: number;
    used: number;
}
export declare class RcsRichContentMessage {
    encodingName: "UTF-8";
    content: RcsCardContent;
    region: RcsRegion;
    billableText: string;
    numberOfBytes: number;
    messageSize: number;
    totalSize: number;
    segmentsCount: number;
    segments: RcsSegment[];
    messageType: RcsRichMessageType;
    constructor(content: RcsCardContent, region?: RcsRegion);
}
export {};
