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
var countUtf8Bytes = function (message) { return new TextEncoder().encode(message).length; };
exports.countUtf8Bytes = countUtf8Bytes;
//# sourceMappingURL=textUtils.js.map