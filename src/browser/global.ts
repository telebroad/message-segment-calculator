import { SegmentedMessage, RcsSegmentedMessage } from '..';

// Resolve the global object with fallbacks for older runtimes (Safari < 12.1, IE11)
function getGlobalRoot(): Record<string, unknown> {
  if (typeof globalThis !== 'undefined') return globalThis as Record<string, unknown>;
  if (typeof self !== 'undefined') return self as unknown as Record<string, unknown>;
  if (typeof window !== 'undefined') return window as unknown as Record<string, unknown>;
  if (typeof global !== 'undefined') return global as unknown as Record<string, unknown>;
  return {};
}

const root = getGlobalRoot();

root.SegmentedMessage = SegmentedMessage;
root.RcsSegmentedMessage = RcsSegmentedMessage;
