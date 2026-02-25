import { countUtf8Bytes } from './textUtils';

export type RcsRegion = 'us' | 'international';
export type RcsMessageType = 'Rich' | 'Basic' | 'Single';

export interface RcsSegment {
  index: number;
  capacity: number;
  used: number;
}

export class RcsSegmentedMessage {
  encodingName: 'UTF-8' = 'UTF-8';

  message: string;

  region: RcsRegion;

  numberOfCharacters: number;

  messageSize: number;

  totalSize: number;

  segmentsCount: number;

  segments: RcsSegment[];

  messageType: RcsMessageType;

  constructor(message: string, region: RcsRegion = 'us') {
    this.message = message;
    this.region = region;

    const utf8Bytes = countUtf8Bytes(message);
    this.numberOfCharacters = utf8Bytes;
    this.messageSize = utf8Bytes * 8;
    this.totalSize = this.messageSize;

    const capacity = 160;

    if (region === 'us') {
      const rawSegmentsCount = Math.ceil(utf8Bytes / capacity);
      this.segmentsCount = Math.max(1, rawSegmentsCount);
      this.messageType = 'Rich';

      this.segments = [];
      let remaining = utf8Bytes;
      for (let index = 0; index < this.segmentsCount; index += 1) {
        const used = Math.min(capacity, remaining);
        this.segments.push({ index, capacity, used });
        remaining -= used;
      }
    } else {
      this.segmentsCount = 1;
      this.messageType = utf8Bytes <= capacity ? 'Basic' : 'Single';
      this.segments = [{ index: 0, capacity, used: utf8Bytes }];
    }
  }
}
