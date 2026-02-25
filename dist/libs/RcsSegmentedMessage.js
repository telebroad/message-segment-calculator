"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RcsSegmentedMessage = void 0;
var textUtils_1 = require("./textUtils");
var RcsSegmentedMessage = /** @class */ (function () {
    function RcsSegmentedMessage(message, region) {
        if (region === void 0) { region = 'us'; }
        this.encodingName = 'UTF-8';
        this.message = message;
        this.region = region;
        var utf8Bytes = (0, textUtils_1.countUtf8Bytes)(message);
        this.numberOfCharacters = utf8Bytes;
        this.messageSize = utf8Bytes * 8;
        this.totalSize = this.messageSize;
        var capacity = 160;
        if (region === 'us') {
            var rawSegmentsCount = Math.ceil(utf8Bytes / capacity);
            this.segmentsCount = Math.max(1, rawSegmentsCount);
            this.messageType = 'Rich';
            this.segments = [];
            var remaining = utf8Bytes;
            for (var index = 0; index < this.segmentsCount; index += 1) {
                var used = Math.min(capacity, remaining);
                this.segments.push({ index: index, capacity: capacity, used: used });
                remaining -= used;
            }
        }
        else {
            this.segmentsCount = 1;
            this.messageType = utf8Bytes <= capacity ? 'Basic' : 'Single';
            this.segments = [{ index: 0, capacity: capacity, used: utf8Bytes }];
        }
    }
    return RcsSegmentedMessage;
}());
exports.RcsSegmentedMessage = RcsSegmentedMessage;
//# sourceMappingURL=RcsSegmentedMessage.js.map