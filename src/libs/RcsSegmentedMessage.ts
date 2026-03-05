import { countUtf8Bytes } from './textUtils';

export type RcsRegion = 'us' | 'international';
type RcsMessageType = 'Rich' | 'Basic' | 'Single';

interface RcsSegment {
  index: number;
  capacity: number;
  used: number;
}

const RCS_SEGMENT_CAPACITY_BYTES = 160;
const RCS_SINGLE_CAPACITY_BYTES = 1600;
const VALID_REGIONS: readonly RcsRegion[] = ['us', 'international'];

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
    if (!VALID_REGIONS.includes(region)) {
      throw new Error(`Invalid region "${region}". Must be one of: ${VALID_REGIONS.join(', ')}`);
    }
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
      /*
       * International: no segmentation. Billing is classification-based:
       * Basic (≤160 bytes) or Single (>160 bytes).
       * Capacity reflects the tier limit so the UI shows meaningful "remaining."
       */
      this.segmentsCount = 1;
      const isBasic = utf8Bytes <= RCS_SEGMENT_CAPACITY_BYTES;
      this.messageType = isBasic ? 'Basic' : 'Single';
      const capacity = isBasic ? RCS_SEGMENT_CAPACITY_BYTES : RCS_SINGLE_CAPACITY_BYTES;
      this.segments = [{ index: 0, capacity, used: utf8Bytes }];
    }
  }
}
