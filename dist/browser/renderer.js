"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderRcs = exports.renderSms = void 0;
var API_CHAR_LIMIT = 1600;
var clearChildren = function (element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
};
var formatCodePoints = function (value) {
    var codePoints = Array.from(value).map(function (char) {
        var code = char.codePointAt(0);
        if (code === undefined) {
            return '';
        }
        return "U+".concat(code.toString(16).toUpperCase().padStart(4, '0'));
    });
    return codePoints.filter(Boolean).join(' ');
};
var renderSegmentTape = function (container, segments, labelPrefix, unitLabel) {
    clearChildren(container);
    segments.forEach(function (segment) {
        var row = document.createElement('div');
        row.className = 'segment-row';
        var bar = document.createElement('div');
        bar.className = 'segment-bar';
        bar.setAttribute('role', 'meter');
        bar.setAttribute('aria-label', "".concat(labelPrefix, " segment ").concat(segment.index + 1, " fill"));
        bar.setAttribute('aria-valuemin', '0');
        bar.setAttribute('aria-valuemax', String(segment.capacity));
        var cappedValue = Math.min(segment.used, segment.capacity);
        bar.setAttribute('aria-valuenow', String(cappedValue));
        if (segment.used > segment.capacity) {
            bar.setAttribute('aria-valuetext', "".concat(segment.used, " of ").concat(segment.capacity, " (over by ").concat(segment.used - segment.capacity, ")"));
        }
        var fill = document.createElement('div');
        fill.className = 'segment-fill';
        var ratio = segment.capacity > 0 ? segment.used / segment.capacity : 0;
        if (ratio >= 1) {
            fill.classList.add('full');
        }
        else if (ratio >= 0.8) {
            fill.classList.add('near-full');
        }
        var width = segment.capacity > 0 ? Math.min(1, segment.used / segment.capacity) * 100 : 0;
        fill.style.width = "".concat(width, "%");
        bar.appendChild(fill);
        row.appendChild(bar);
        var meta = document.createElement('div');
        meta.className = 'segment-meta';
        var label = document.createElement('span');
        label.textContent = "Segment ".concat(segment.index + 1);
        var count = document.createElement('span');
        count.textContent = "".concat(segment.used, " / ").concat(segment.capacity, " ").concat(unitLabel);
        meta.appendChild(label);
        meta.appendChild(count);
        row.appendChild(meta);
        container.appendChild(row);
    });
};
var SEGMENT_COLORS = ['seg-0', 'seg-1', 'seg-2', 'seg-3', 'seg-4'];
var renderCharDetail = function (container, charDetails) {
    clearChildren(container);
    if (charDetails.length === 0) {
        container.hidden = true;
        return;
    }
    container.hidden = false;
    charDetails.forEach(function (detail) {
        var block = document.createElement('span');
        block.className = "char-block ".concat(SEGMENT_COLORS[detail.segmentIndex % SEGMENT_COLORS.length]);
        if (!detail.isGSM7) {
            block.classList.add('non-gsm');
        }
        var display = detail.raw.trim() === '' ? '\u00B7' : detail.raw;
        block.textContent = display;
        var encoding = detail.isGSM7 ? 'GSM-7' : 'UCS-2';
        var codeHex = detail.codeUnits.map(function (u) { return "0x".concat(u.toString(16).toUpperCase().padStart(4, '0')); }).join(' ');
        var label = "".concat(encoding, " | Segment ").concat(detail.segmentIndex + 1, " | ").concat(codeHex);
        block.title = label;
        block.setAttribute('tabindex', '0');
        block.setAttribute('role', 'img');
        block.setAttribute('aria-label', "".concat(display === '\u00B7' ? 'whitespace' : display, ": ").concat(label));
        container.appendChild(block);
    });
};
var updateNonGsmTable = function (targets, nonGsmCharacters) {
    var uniqueCharacters = Array.from(new Set(nonGsmCharacters));
    clearChildren(targets.nonGsmTableBody);
    if (uniqueCharacters.length === 0) {
        targets.nonGsmTable.hidden = true;
        targets.nonGsmEmpty.textContent = 'None detected';
        targets.nonGsmEmpty.removeAttribute('hidden');
        return;
    }
    targets.nonGsmEmpty.setAttribute('hidden', 'true');
    targets.nonGsmTable.hidden = false;
    uniqueCharacters.forEach(function (character) {
        var row = document.createElement('tr');
        var characterCell = document.createElement('td');
        characterCell.textContent = character;
        var codeCell = document.createElement('td');
        codeCell.textContent = formatCodePoints(character);
        row.appendChild(characterCell);
        row.appendChild(codeCell);
        targets.nonGsmTableBody.appendChild(row);
    });
};
var renderSms = function (analysis, targets, errorMessage) {
    targets.encodingBadge.setAttribute('data-encoding', analysis.encoding);
    targets.encodingValue.textContent = analysis.encodingLabel;
    targets.characters.textContent = analysis.characters.toString();
    targets.segments.textContent = analysis.segmentsCount.toString();
    targets.segments.classList.toggle('is-multi', analysis.segmentsCount > 1);
    targets.remaining.textContent = analysis.remaining.toString();
    targets.remaining.classList.toggle('is-low', analysis.remaining < 20);
    renderSegmentTape(targets.segmentTape, analysis.segments, 'SMS', 'chars');
    renderCharDetail(targets.charDetailContainer, analysis.charDetails);
    targets.messageSize.textContent = "".concat(analysis.messageSize, " bits");
    targets.totalSize.textContent = "".concat(analysis.totalSize, " bits");
    targets.unicodeScalars.textContent = analysis.unicodeScalars.toString();
    if (analysis.encoding === 'gsm7') {
        targets.encodingSummary.textContent =
            'All characters are GSM-7 compatible. Extended GSM-7 characters count as two units.';
    }
    else {
        var unique = Array.from(new Set(analysis.nonGsmCharacters));
        if (unique.length > 0) {
            targets.encodingSummary.textContent = "Unicode detected because of: ".concat(unique.join(' '));
        }
        else {
            targets.encodingSummary.textContent = 'Unicode encoding is required for this message.';
        }
    }
    updateNonGsmTable(targets, analysis.nonGsmCharacters);
    var allWarnings = __spreadArray([], __read(analysis.warnings), false);
    if (analysis.unicodeScalars > API_CHAR_LIMIT) {
        var over = (analysis.unicodeScalars - API_CHAR_LIMIT).toLocaleString();
        allWarnings.push("Message exceeds the ".concat(API_CHAR_LIMIT.toLocaleString(), "-character API limit by ").concat(over, " characters. It will be rejected by the Twilio API."));
    }
    if (allWarnings.length > 0) {
        targets.warnings.textContent = allWarnings.join(' ');
        targets.warnings.removeAttribute('hidden');
    }
    else {
        targets.warnings.textContent = '';
        targets.warnings.setAttribute('hidden', 'true');
    }
    if (errorMessage) {
        targets.error.textContent = errorMessage;
        targets.error.removeAttribute('hidden');
    }
    else {
        targets.error.textContent = '';
        targets.error.setAttribute('hidden', 'true');
    }
};
exports.renderSms = renderSms;
var renderRcs = function (analysis, targets) {
    targets.encodingBadge.setAttribute('data-encoding', analysis.encoding);
    targets.encodingValue.textContent = analysis.encodingLabel;
    targets.messageType.textContent = analysis.messageType;
    targets.characters.textContent = analysis.characters.toString();
    targets.segments.textContent = analysis.segmentsCount.toString();
    targets.segments.classList.toggle('is-multi', analysis.segmentsCount > 1);
    targets.remaining.textContent = analysis.remaining.toString();
    targets.remaining.classList.toggle('is-low', analysis.remaining < 20);
    targets.size.textContent = "".concat(analysis.messageSize, " bits");
    targets.segmentTape.style.display = '';
    renderSegmentTape(targets.segmentTape, analysis.segments, 'RCS', 'bytes');
    if (analysis.region === 'us') {
        targets.detailsText.textContent = 'US destinations are billed per 160 UTF-8 byte Rich segment.';
        var suffix = analysis.segmentsCount === 1 ? '' : 's';
        targets.detailBilling.textContent = "".concat(analysis.segmentsCount, " Rich segment").concat(suffix);
    }
    else {
        targets.detailsText.textContent =
            'International destinations are billed as a single Basic (≤160) or Single (>160) message.';
        targets.detailBilling.textContent = "".concat(analysis.messageType, " message");
    }
    targets.detailSize.textContent = "".concat(analysis.messageSize, " bits");
    targets.detailBytes.textContent = "".concat(analysis.characters, " bytes");
    targets.charCount.textContent = "".concat(analysis.unicodeLength, " / ").concat(API_CHAR_LIMIT.toLocaleString());
    if (analysis.unicodeLength > API_CHAR_LIMIT) {
        var over = (analysis.unicodeLength - API_CHAR_LIMIT).toLocaleString();
        targets.warning.textContent = "Message exceeds the ".concat(API_CHAR_LIMIT.toLocaleString(), "-character API limit by ").concat(over, " characters. It will be rejected by the Twilio API.");
        targets.warning.removeAttribute('hidden');
    }
    else {
        targets.warning.textContent = '';
        targets.warning.setAttribute('hidden', 'true');
    }
};
exports.renderRcs = renderRcs;
//# sourceMappingURL=renderer.js.map