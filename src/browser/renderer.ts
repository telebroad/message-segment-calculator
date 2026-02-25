import type { SegmentData, SmsAnalysis, RcsAnalysis } from './types';

export interface SmsRenderTargets {
  encodingBadge: HTMLElement;
  encodingValue: HTMLElement;
  characters: HTMLElement;
  segments: HTMLElement;
  remaining: HTMLElement;
  segmentTape: HTMLElement;
  encodingSummary: HTMLElement;
  messageSize: HTMLElement;
  totalSize: HTMLElement;
  unicodeScalars: HTMLElement;
  nonGsmEmpty: HTMLElement;
  nonGsmTable: HTMLTableElement;
  nonGsmTableBody: HTMLElement;
  warnings: HTMLElement;
  error: HTMLElement;
}

export interface RcsRenderTargets {
  encodingBadge: HTMLElement;
  encodingValue: HTMLElement;
  characters: HTMLElement;
  segments: HTMLElement;
  messageType: HTMLElement;
  remaining: HTMLElement;
  size: HTMLElement;
  segmentTape: HTMLElement;
  detailsText: HTMLElement;
  detailSize: HTMLElement;
  detailBytes: HTMLElement;
  detailBilling: HTMLElement;
}

const clearChildren = (element: HTMLElement): void => {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
};

const formatCodePoints = (value: string): string => {
  const codePoints = Array.from(value).map((char) => {
    const code = char.codePointAt(0);
    if (!code) {
      return '';
    }
    return `U+${code.toString(16).toUpperCase()}`;
  });
  return codePoints.filter(Boolean).join(' ');
};

const renderSegmentTape = (
  container: HTMLElement,
  segments: SegmentData[],
  labelPrefix: string,
  unitLabel: string,
): void => {
  clearChildren(container);

  segments.forEach((segment) => {
    const row = document.createElement('div');
    row.className = 'segment-row';

    const bar = document.createElement('div');
    bar.className = 'segment-bar';
    bar.setAttribute('role', 'meter');
    bar.setAttribute('aria-label', `${labelPrefix} segment ${segment.index + 1} fill`);
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', String(segment.capacity));

    const cappedValue = Math.min(segment.used, segment.capacity);
    bar.setAttribute('aria-valuenow', String(cappedValue));
    if (segment.used > segment.capacity) {
      bar.setAttribute(
        'aria-valuetext',
        `${segment.used} of ${segment.capacity} (over by ${segment.used - segment.capacity})`,
      );
    }

    const fill = document.createElement('div');
    fill.className = 'segment-fill';

    const ratio = segment.capacity > 0 ? segment.used / segment.capacity : 0;
    if (ratio >= 1) {
      fill.classList.add('full');
    } else if (ratio >= 0.8) {
      fill.classList.add('near-full');
    }

    const width = segment.capacity > 0 ? Math.min(1, segment.used / segment.capacity) * 100 : 0;
    fill.style.width = `${width}%`;

    bar.appendChild(fill);
    row.appendChild(bar);

    const meta = document.createElement('div');
    meta.className = 'segment-meta';

    const label = document.createElement('span');
    label.textContent = `Segment ${segment.index + 1}`;

    const count = document.createElement('span');
    count.textContent = `${segment.used} / ${segment.capacity} ${unitLabel}`;

    meta.appendChild(label);
    meta.appendChild(count);

    row.appendChild(meta);
    container.appendChild(row);
  });
};

const updateNonGsmTable = (targets: SmsRenderTargets, nonGsmCharacters: string[]): void => {
  const uniqueCharacters = Array.from(new Set(nonGsmCharacters));
  clearChildren(targets.nonGsmTableBody);

  if (uniqueCharacters.length === 0) {
    targets.nonGsmTable.hidden = true;
    targets.nonGsmEmpty.textContent = 'None detected';
    targets.nonGsmEmpty.removeAttribute('hidden');
    return;
  }

  targets.nonGsmEmpty.setAttribute('hidden', 'true');
  targets.nonGsmTable.hidden = false;

  uniqueCharacters.forEach((character) => {
    const row = document.createElement('tr');

    const characterCell = document.createElement('td');
    characterCell.textContent = character;

    const codeCell = document.createElement('td');
    codeCell.textContent = formatCodePoints(character);

    row.appendChild(characterCell);
    row.appendChild(codeCell);
    targets.nonGsmTableBody.appendChild(row);
  });
};

export const renderSms = (analysis: SmsAnalysis, targets: SmsRenderTargets, errorMessage?: string): void => {
  targets.encodingBadge.setAttribute('data-encoding', analysis.encoding);
  targets.encodingValue.textContent = analysis.encodingLabel;
  targets.characters.textContent = analysis.characters.toString();
  targets.segments.textContent = analysis.segmentsCount.toString();
  targets.segments.classList.toggle('is-multi', analysis.segmentsCount > 1);
  targets.remaining.textContent = analysis.remaining.toString();
  targets.remaining.classList.toggle('is-low', analysis.remaining < 20);

  renderSegmentTape(targets.segmentTape, analysis.segments, 'SMS', 'chars');

  targets.messageSize.textContent = `${analysis.messageSize} bits`;
  targets.totalSize.textContent = `${analysis.totalSize} bits`;
  targets.unicodeScalars.textContent = analysis.unicodeScalars.toString();

  if (analysis.encoding === 'gsm7') {
    targets.encodingSummary.textContent =
      'All characters are GSM-7 compatible. Extended GSM-7 characters count as two units.';
  } else {
    const unique = Array.from(new Set(analysis.nonGsmCharacters));
    if (unique.length > 0) {
      targets.encodingSummary.textContent = `Unicode detected because of: ${unique.join(' ')}`;
    } else {
      targets.encodingSummary.textContent = 'Unicode encoding is required for this message.';
    }
  }

  updateNonGsmTable(targets, analysis.nonGsmCharacters);

  if (analysis.warnings.length > 0) {
    targets.warnings.textContent = analysis.warnings.join(' ');
    targets.warnings.removeAttribute('hidden');
  } else {
    targets.warnings.textContent = '';
    targets.warnings.setAttribute('hidden', 'true');
  }

  if (errorMessage) {
    targets.error.textContent = errorMessage;
    targets.error.removeAttribute('hidden');
  } else {
    targets.error.textContent = '';
    targets.error.setAttribute('hidden', 'true');
  }
};

export const renderRcs = (analysis: RcsAnalysis, targets: RcsRenderTargets): void => {
  targets.encodingBadge.setAttribute('data-encoding', analysis.encoding);
  targets.encodingValue.textContent = analysis.encodingLabel;
  targets.characters.textContent = analysis.characters.toString();
  targets.segments.textContent = analysis.segmentsCount.toString();
  targets.segments.classList.toggle('is-multi', analysis.segmentsCount > 1);
  targets.messageType.textContent = analysis.messageType;
  targets.remaining.textContent = analysis.remaining.toString();
  targets.remaining.classList.toggle('is-low', analysis.remaining < 20);
  targets.size.textContent = `${analysis.messageSize} bits`;

  renderSegmentTape(targets.segmentTape, analysis.segments, 'RCS', 'bytes');

  if (analysis.region === 'us') {
    targets.detailsText.textContent = 'US destinations are billed per 160 UTF-8 byte Rich segment.';
    const suffix = analysis.segmentsCount === 1 ? '' : 's';
    targets.detailBilling.textContent = `${analysis.segmentsCount} Rich segment${suffix}`;
  } else {
    targets.detailsText.textContent =
      'International destinations are billed as a single Basic (≤160) or Single (>160) message.';
    targets.detailBilling.textContent = `${analysis.messageType} message`;
  }

  targets.detailSize.textContent = `${analysis.messageSize} bits`;
  targets.detailBytes.textContent = `${analysis.characters} bytes`;
};
