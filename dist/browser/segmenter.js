"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeRcsRichContent = exports.analyzeRcs = exports.analyzeSms = void 0;
var SegmentedMessage_1 = require("../libs/SegmentedMessage");
var RcsSegmentedMessage_1 = require("../libs/RcsSegmentedMessage");
var RcsRichContentMessage_1 = require("../libs/RcsRichContentMessage");
var getSmsCapacity = function (encodingName, segmentsCount) {
    if (encodingName === 'GSM-7') {
        return segmentsCount > 1 ? 153 : 160;
    }
    return segmentsCount > 1 ? 67 : 70;
};
var countSegmentUsed = function (segment) {
    return segment.reduce(function (total, item) {
        if (item.isReservedChar) {
            return total;
        }
        return total + (item.codeUnits ? item.codeUnits.length : 0);
    }, 0);
};
var analyzeSms = function (message, encoding, smartEncoding) {
    var segmentedMessage = new SegmentedMessage_1.SegmentedMessage(message, encoding, smartEncoding);
    var encodingName = segmentedMessage.encodingName, segmentsCount = segmentedMessage.segmentsCount;
    var encodingKind = encodingName === 'GSM-7' ? 'gsm7' : 'unicode';
    var capacity = getSmsCapacity(encodingName, segmentsCount);
    var segments = segmentedMessage.segments.map(function (segment, index) { return ({
        index: index,
        capacity: capacity,
        used: countSegmentUsed(segment),
    }); });
    var lastSegment = segments[segments.length - 1];
    var remaining = lastSegment ? Math.max(0, capacity - lastSegment.used) : capacity;
    return {
        encoding: encodingKind,
        encodingLabel: encodingName === 'GSM-7' ? 'GSM-7' : 'Unicode (UCS-2)',
        segments: segments,
        segmentsCount: segmentsCount,
        characters: segmentedMessage.numberOfCharacters,
        remaining: remaining,
        messageSize: segmentedMessage.messageSize,
        totalSize: segmentedMessage.totalSize,
        unicodeScalars: segmentedMessage.numberOfUnicodeScalars,
        nonGsmCharacters: segmentedMessage.getNonGsmCharacters(),
        warnings: segmentedMessage.warnings,
    };
};
exports.analyzeSms = analyzeSms;
var buildRcsAnalysis = function (rcsMessage, region, unicodeLength, defaultRemaining, extra) {
    var segments = rcsMessage.segments.map(function (segment) { return ({
        index: segment.index,
        capacity: segment.capacity,
        used: segment.used,
    }); });
    var lastSegment = segments[segments.length - 1];
    var remaining = lastSegment ? Math.max(0, lastSegment.capacity - lastSegment.used) : defaultRemaining;
    return __assign({ encoding: 'rcs', encodingLabel: 'UTF-8', region: region, segments: segments, segmentsCount: rcsMessage.segmentsCount, characters: rcsMessage.numberOfBytes, unicodeLength: unicodeLength, remaining: remaining, messageSize: rcsMessage.messageSize, messageType: rcsMessage.messageType }, extra);
};
var analyzeRcs = function (message, region) {
    var rcsMessage = new RcsSegmentedMessage_1.RcsSegmentedMessage(message, region);
    return buildRcsAnalysis(rcsMessage, region, Array.from(message).length, 160);
};
exports.analyzeRcs = analyzeRcs;
var analyzeRcsRichContent = function (content, region) {
    var rcsMessage = new RcsRichContentMessage_1.RcsRichContentMessage(content, region);
    return buildRcsAnalysis(rcsMessage, region, Array.from(rcsMessage.billableText).length, 0, { inputMode: 'json' });
};
exports.analyzeRcsRichContent = analyzeRcsRichContent;
//# sourceMappingURL=segmenter.js.map