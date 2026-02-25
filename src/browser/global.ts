import { SegmentedMessage, RcsSegmentedMessage } from '../index';

const root = (typeof window !== 'undefined' ? window : globalThis) as Record<string, unknown>;

root.SegmentedMessage = SegmentedMessage;
root.RcsSegmentedMessage = RcsSegmentedMessage;
