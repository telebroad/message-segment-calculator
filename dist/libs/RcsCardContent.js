"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyRcsContent = void 0;
var RICH_MEDIA = 'Rich media';
var RICH = 'Rich';
var isPresent = function (value) { return typeof value === 'string' && value.trim().length > 0; };
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
    return content.actions.some(function (action) { return action.type === 'url' && isPresent(action.webview_size) && action.webview_size !== 'NONE'; });
};
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