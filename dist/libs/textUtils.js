"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countUtf8Bytes = exports.splitGraphemes = void 0;
var grapheme_splitter_1 = __importDefault(require("grapheme-splitter"));
var splitGraphemes = function (message) {
    var splitter = new grapheme_splitter_1.default();
    return splitter.splitGraphemes(message).reduce(function (accumulator, grapheme) {
        var result = grapheme === '\r\n' ? grapheme.split('') : [grapheme];
        return accumulator.concat(result);
    }, []);
};
exports.splitGraphemes = splitGraphemes;
var utf8ByteLength = function (codePoint) {
    if (codePoint <= 0x7f)
        return 1;
    if (codePoint <= 0x7ff)
        return 2;
    if (codePoint <= 0xffff)
        return 3;
    return 4;
};
var countUtf8Bytes = function (message) {
    if (typeof TextEncoder !== 'undefined') {
        return new TextEncoder().encode(message).length;
    }
    // Fallback for environments without TextEncoder (Node < 11, older browsers)
    return Array.from(message).reduce(function (bytes, char) {
        var code = char.codePointAt(0);
        return bytes + (code === undefined ? 0 : utf8ByteLength(code));
    }, 0);
};
exports.countUtf8Bytes = countUtf8Bytes;
//# sourceMappingURL=textUtils.js.map