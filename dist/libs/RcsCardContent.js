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
exports.classifyRcsContent = exports.normalizeRcsContent = void 0;
var RICH_MEDIA = 'Rich media';
var RICH = 'Rich';
var isPresent = function (value) {
    return typeof value === 'string' && value.trim().length > 0;
};
var hasMedia = function (content) {
    if (!content.media)
        return false;
    if (Array.isArray(content.media))
        return content.media.length > 0;
    return isPresent(content.media);
};
var hasWebviewAction = function (content) {
    if (!content.actions)
        return false;
    return content.actions.some(function (action) {
        var type = action.type.toLowerCase();
        var size = typeof action.webview_size === 'string' ? action.webview_size.toUpperCase() : '';
        return type === 'url' && size !== '' && size !== 'NONE';
    });
};
/**
 * Normalizes raw API JSON into the flat RcsCardContent format.
 *
 * The Twilio API returns rich content wrapped under a content-type key:
 *   { "twilio/card": { title: "...", body: null, ... } }
 *
 * This function detects that wrapper and extracts the inner object,
 * setting `content_type` accordingly. If the input is already in the
 * flat format (has a `content_type` string property), it is returned as-is.
 */
var normalizeRcsContent = function (raw) {
    // Already in flat format
    // eslint-disable-next-line camelcase
    if (typeof raw.content_type === 'string') {
        return raw;
    }
    // Look for a wrapper key like "twilio/card", "twilio/media", etc.
    var wrapperKey = Object.keys(raw).find(function (key) { return key.startsWith('twilio/'); });
    if (wrapperKey && typeof raw[wrapperKey] === 'object' && raw[wrapperKey] !== null) {
        var inner = raw[wrapperKey];
        // eslint-disable-next-line camelcase
        return __assign({ content_type: wrapperKey }, inner);
    }
    // Fallback: treat as unknown content type
    // eslint-disable-next-line camelcase
    return __assign({ content_type: 'unknown' }, raw);
};
exports.normalizeRcsContent = normalizeRcsContent;
var classifyRcsContent = function (content) {
    var richMedia = { classification: RICH_MEDIA, billableText: '' };
    // Non-twilio/card content types are always Rich media
    if (content.content_type !== 'twilio/card') {
        return richMedia;
    }
    // Media present -> Rich media
    if (hasMedia(content)) {
        return richMedia;
    }
    // Webview action (webview_size other than NONE) -> Rich media
    if (hasWebviewAction(content)) {
        return richMedia;
    }
    var hasTitle = isPresent(content.title);
    var hasBody = isPresent(content.body);
    var hasSubtitle = isPresent(content.subtitle);
    // Title + subtitle -> Rich media
    if (hasTitle && hasSubtitle) {
        return richMedia;
    }
    // Title + body -> Rich media
    if (hasTitle && hasBody) {
        return richMedia;
    }
    // Title only -> Rich
    if (hasTitle) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return { classification: RICH, billableText: content.title.trim() };
    }
    // Body + subtitle -> Rich (subtitle appended to body)
    if (hasBody && hasSubtitle) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        var text = "".concat(content.body.trim(), "\n").concat(content.subtitle.trim());
        return { classification: RICH, billableText: text };
    }
    // Body only -> Rich
    if (hasBody) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return { classification: RICH, billableText: content.body.trim() };
    }
    // Empty card -> Rich with empty text
    return { classification: RICH, billableText: '' };
};
exports.classifyRcsContent = classifyRcsContent;
//# sourceMappingURL=RcsCardContent.js.map