"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var segmenter_1 = require("./segmenter");
var renderer_1 = require("./renderer");
var getElement = function (id) {
    var element = document.getElementById(id);
    if (!element) {
        throw new Error("Missing element: ".concat(id));
    }
    return element;
};
var getRadioValue = function (name) {
    var input = document.querySelector("input[name=\"".concat(name, "\"]:checked"));
    return input ? input.value : '';
};
var init = function () {
    var messageInput = getElement('message-input');
    var inputCharacters = getElement('input-characters');
    var encodingSelect = getElement('sms-encoding');
    var smsTargets = {
        encodingBadge: getElement('sms-encoding-badge'),
        encodingValue: getElement('sms-encoding-value'),
        characters: getElement('sms-characters'),
        segments: getElement('sms-segments'),
        remaining: getElement('sms-remaining'),
        segmentTape: getElement('sms-segment-tape'),
        encodingSummary: getElement('sms-encoding-explainer'),
        messageSize: getElement('sms-size'),
        totalSize: getElement('sms-total-size'),
        unicodeScalars: getElement('sms-scalars'),
        nonGsmEmpty: getElement('sms-non-gsm-empty'),
        nonGsmTable: getElement('sms-non-gsm-table'),
        nonGsmTableBody: getElement('sms-non-gsm-tbody'),
        warnings: getElement('sms-warnings'),
        error: getElement('sms-error'),
    };
    var rcsTargets = {
        encodingBadge: getElement('rcs-encoding-badge'),
        encodingValue: getElement('rcs-encoding-value'),
        characters: getElement('rcs-characters'),
        segments: getElement('rcs-segments'),
        messageType: getElement('rcs-type'),
        remaining: getElement('rcs-remaining'),
        size: getElement('rcs-size'),
        segmentTape: getElement('rcs-segment-tape'),
        detailsText: getElement('rcs-encoding-explainer'),
        detailSize: getElement('rcs-size-detail'),
        detailBytes: getElement('rcs-bytes-detail'),
        detailBilling: getElement('rcs-billing-detail'),
    };
    var updateAll = function () {
        var message = messageInput.value;
        inputCharacters.textContent = Array.from(message).length.toString();
        var encoding = encodingSelect.value;
        var smartEncoding = getRadioValue('smart-encoding') === 'yes';
        var rcsRegion = getRadioValue('rcs-region');
        var smsError;
        var smsAnalysis;
        try {
            smsAnalysis = (0, segmenter_1.analyzeSms)(message, encoding, smartEncoding);
        }
        catch (error) {
            smsError = error instanceof Error ? error.message : 'Unable to calculate SMS segments.';
            smsAnalysis = (0, segmenter_1.analyzeSms)(message, 'auto', smartEncoding);
        }
        (0, renderer_1.renderSms)(smsAnalysis, smsTargets, smsError);
        var rcsAnalysis = (0, segmenter_1.analyzeRcs)(message, rcsRegion || 'us');
        (0, renderer_1.renderRcs)(rcsAnalysis, rcsTargets);
    };
    messageInput.addEventListener('input', updateAll);
    encodingSelect.addEventListener('change', updateAll);
    document.querySelectorAll('input[name="smart-encoding"]').forEach(function (input) {
        input.addEventListener('change', updateAll);
    });
    document.querySelectorAll('input[name="rcs-region"]').forEach(function (input) {
        input.addEventListener('change', updateAll);
    });
    updateAll();
};
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
}
else {
    init();
}
//# sourceMappingURL=main.js.map