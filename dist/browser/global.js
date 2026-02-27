"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var __1 = require("..");
// Resolve the global object with fallbacks for older runtimes (Safari < 12.1, IE11)
function getGlobalRoot() {
    if (typeof globalThis !== 'undefined')
        return globalThis;
    if (typeof self !== 'undefined')
        return self;
    if (typeof window !== 'undefined')
        return window;
    if (typeof global !== 'undefined')
        return global;
    return {};
}
var root = getGlobalRoot();
root.SegmentedMessage = __1.SegmentedMessage;
root.RcsSegmentedMessage = __1.RcsSegmentedMessage;
root.RcsRichContentMessage = __1.RcsRichContentMessage;
//# sourceMappingURL=global.js.map