import { analyzeRcs, analyzeSms } from './segmenter';
import { renderRcs, renderSms } from './renderer';
import type { RcsRegion } from '../libs/RcsSegmentedMessage';
import type { SmsEncodingSetting } from './types';
import type { SmsRenderTargets, RcsRenderTargets } from './renderer';

const getElement = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing element: ${id}`);
  }
  return element as T;
};

const getRadioValue = (name: string): string => {
  const input = document.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement | null;
  return input ? input.value : '';
};

const init = (): void => {
  const messageInput = getElement<HTMLTextAreaElement>('message-input');
  const inputCharacters = getElement<HTMLElement>('input-characters');
  const encodingSelect = getElement<HTMLSelectElement>('sms-encoding');

  const smsTargets: SmsRenderTargets = {
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
    nonGsmTable: getElement<HTMLTableElement>('sms-non-gsm-table'),
    nonGsmTableBody: getElement('sms-non-gsm-tbody'),
    warnings: getElement('sms-warnings'),
    error: getElement('sms-error'),
  };

  const rcsTargets: RcsRenderTargets = {
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

  const updateAll = (): void => {
    const message = messageInput.value;
    inputCharacters.textContent = Array.from(message).length.toString();

    const encoding = encodingSelect.value as SmsEncodingSetting;
    const smartEncoding = getRadioValue('smart-encoding') === 'yes';
    const rcsRegion = getRadioValue('rcs-region') as RcsRegion;

    let smsError: string | undefined;
    let smsAnalysis;
    try {
      smsAnalysis = analyzeSms(message, encoding, smartEncoding);
    } catch (error) {
      smsError = error instanceof Error ? error.message : 'Unable to calculate SMS segments.';
      smsAnalysis = analyzeSms(message, 'auto', smartEncoding);
    }

    renderSms(smsAnalysis, smsTargets, smsError);

    const rcsAnalysis = analyzeRcs(message, rcsRegion || 'us');
    renderRcs(rcsAnalysis, rcsTargets);
  };

  messageInput.addEventListener('input', updateAll);
  encodingSelect.addEventListener('change', updateAll);

  document.querySelectorAll('input[name="smart-encoding"]').forEach((input) => {
    input.addEventListener('change', updateAll);
  });

  document.querySelectorAll('input[name="rcs-region"]').forEach((input) => {
    input.addEventListener('change', updateAll);
  });

  updateAll();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
