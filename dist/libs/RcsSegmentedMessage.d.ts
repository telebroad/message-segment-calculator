export type RcsRegion = 'us' | 'international';
type RcsMessageType = 'Rich' | 'Basic' | 'Single';
interface RcsSegment {
    index: number;
    capacity: number;
    used: number;
}
export declare class RcsSegmentedMessage {
    encodingName: "UTF-8";
    message: string;
    region: RcsRegion;
    numberOfCharacters: number;
    messageSize: number;
    totalSize: number;
    segmentsCount: number;
    segments: RcsSegment[];
    messageType: RcsMessageType;
    constructor(message: string, region?: RcsRegion);
}
export {};
