import { countUtf8Bytes } from './textUtils';
import { RcsCardContent, classifyRcsContent } from './RcsCardContent';
import type { RcsRegion } from './RcsSegmentedMessage';

type RcsRichMessageType = 'Rich' | 'Basic' | 'Single' | 'Rich media';

interface RcsSegment {
  index: number;
  capacity: number;
  used: number;
}

const RCS_SEGMENT_CAPACITY_BYTES = 160;
const VALID_REGIONS: readonly RcsRegion[] = ['us', 'international'];

export class RcsRichContentMessage {
  encodingName = 'UTF-8' as const;

  content: RcsCardContent;

  region: RcsRegion;

  billableText: string;

  numberOfBytes: number;

  messageSize: number;

  totalSize: number;

  segmentsCount: number;

  segments: RcsSegment[];

  messageType: RcsRichMessageType;

  constructor(content: RcsCardContent, region: RcsRegion = 'us') {
    if (!VALID_REGIONS.includes(region)) {
      throw new Error(`Invalid region "${region}". Must be one of: ${VALID_REGIONS.join(', ')}`);
    }

    this.content = content;
    this.region = region;

    const { classification, billableText } = classifyRcsContent(content);
    this.billableText = billableText;

    if (classification === 'Rich media') {
      this.messageType = 'Rich media';
      this.numberOfBytes = 0;
      this.messageSize = 0;
      this.totalSize = 0;
      this.segmentsCount = 0;
      this.segments = [];
      return;
    }

    // Rich classification — segment based on billableText
    const utf8Bytes = countUtf8Bytes(billableText);
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
      this.segments = [{ index: 0, capacity: utf8Bytes, used: utf8Bytes }];
    }
  }
}
