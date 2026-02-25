import { countUtf8Bytes } from './textUtils';

export type RcsRegion = 'us' | 'international';
type RcsMessageType = 'Rich' | 'Basic' | 'Single';

interface RcsSegment {
  index: number;
  capacity: number;
  used: number;
}

const RCS_SEGMENT_CAPACITY_BYTES = 160;

export class RcsSegmentedMessage {
  encodingName = 'UTF-8' as const;

  message: string;

  region: RcsRegion;

  numberOfBytes: number;

  messageSize: number;

  totalSize: number;

  segmentsCount: number;

  segments: RcsSegment[];

  messageType: RcsMessageType;

  constructor(message: string, region: RcsRegion = 'us') {
    this.message = message;
    this.region = region;

    const utf8Bytes = countUtf8Bytes(message);
    this.numberOfBytes = utf8Bytes;
    this.messageSize = utf8Bytes * 8;
    this.totalSize = this.messageSize;

    if (utf8Bytes === 0) {
      this.segmentsCount = 0;
      this.messageType = region === 'us' ? 'Rich' : 'Basic';
      this.segments = [];
      return;
    }

    if (region === 'us') {
      this.segmentsCount = Math.ceil(utf8Bytes / RCS_SEGMENT_CAPACITY_BYTES);
      this.messageType = 'Rich';

      this.segments = [];
      let remaining = utf8Bytes;
      for (let index = 0; index < this.segmentsCount; index += 1) {
        const used = Math.min(RCS_SEGMENT_CAPACITY_BYTES, remaining);
        this.segments.push({ index, capacity: RCS_SEGMENT_CAPACITY_BYTES, used });
        remaining -= used;
      }
    } else {
      this.segmentsCount = 1;
      this.messageType = utf8Bytes <= RCS_SEGMENT_CAPACITY_BYTES ? 'Basic' : 'Single';
      this.segments = [{ index: 0, capacity: RCS_SEGMENT_CAPACITY_BYTES, used: utf8Bytes }];
    }
  }
}
