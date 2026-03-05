"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RcsSegmentedMessage = void 0;
var textUtils_1 = require("./textUtils");
var RCS_SEGMENT_CAPACITY_BYTES = 160;
var RCS_SINGLE_CAPACITY_BYTES = 1600;
var VALID_REGIONS = ['us', 'international'];
var RcsSegmentedMessage = /** @class */ (function () {
    function RcsSegmentedMessage(message, region) {
        if (region === void 0) { region = 'us'; }
        this.encodingName = 'UTF-8';
        if (!VALID_REGIONS.includes(region)) {
            throw new Error("Invalid region \"".concat(region, "\". Must be one of: ").concat(VALID_REGIONS.join(', ')));
        }
        this.message = message;
        this.region = region;
        var utf8Bytes = (0, textUtils_1.countUtf8Bytes)(message);
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
            /*
             * International: no segmentation. Capacity reflects the billing tier limit
             * so the UI shows meaningful remaining capacity.
             * Basic (≤160 bytes) or Single (>160 bytes).
             */
            this.segmentsCount = 1;
            var isBasic = utf8Bytes <= RCS_SEGMENT_CAPACITY_BYTES;
            this.messageType = isBasic ? 'Basic' : 'Single';
            var capacity = isBasic ? RCS_SEGMENT_CAPACITY_BYTES : RCS_SINGLE_CAPACITY_BYTES;
            this.segments = [{ index: 0, capacity: capacity, used: utf8Bytes }];
        }
    }
    return RcsSegmentedMessage;
}());
exports.RcsSegmentedMessage = RcsSegmentedMessage;
//# sourceMappingURL=RcsSegmentedMessage.js.map