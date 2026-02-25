import { SegmentedMessage, RcsSegmentedMessage } from '..';

const root = globalThis as Record<string, unknown>;

root.SegmentedMessage = SegmentedMessage;
root.RcsSegmentedMessage = RcsSegmentedMessage;
