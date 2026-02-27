"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RcsRichContentMessage = void 0;
var textUtils_1 = require("./textUtils");
var RcsCardContent_1 = require("./RcsCardContent");
var RCS_SEGMENT_CAPACITY_BYTES = 160;
var VALID_REGIONS = ['us', 'international'];
var RcsRichContentMessage = /** @class */ (function () {
    function RcsRichContentMessage(content, region) {
        if (region === void 0) { region = 'us'; }
        this.encodingName = 'UTF-8';
        if (!VALID_REGIONS.includes(region)) {
            throw new Error("Invalid region \"".concat(region, "\". Must be one of: ").concat(VALID_REGIONS.join(', ')));
        }
        this.content = content;
        this.region = region;
        var _a = (0, RcsCardContent_1.classifyRcsContent)(content), classification = _a.classification, billableText = _a.billableText;
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
        var utf8Bytes = (0, textUtils_1.countUtf8Bytes)(billableText);
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
            var remaining = utf8Bytes;
            for (var index = 0; index < this.segmentsCount; index += 1) {
                var used = Math.min(RCS_SEGMENT_CAPACITY_BYTES, remaining);
                this.segments.push({ index: index, capacity: RCS_SEGMENT_CAPACITY_BYTES, used: used });
                remaining -= used;
            }
        }
        else {
            this.segmentsCount = 1;
            this.messageType = utf8Bytes <= RCS_SEGMENT_CAPACITY_BYTES ? 'Basic' : 'Single';
            this.segments = [{ index: 0, capacity: utf8Bytes, used: utf8Bytes }];
        }
    }
    return RcsRichContentMessage;
}());
exports.RcsRichContentMessage = RcsRichContentMessage;
//# sourceMappingURL=RcsRichContentMessage.js.map