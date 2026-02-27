import { RcsRegion } from '../libs/RcsSegmentedMessage';
import type { RcsCardContent } from '../libs/RcsCardContent';
import type { SmsAnalysis, SmsEncodingSetting, RcsAnalysis } from './types';
export declare const analyzeSms: (message: string, encoding: SmsEncodingSetting, smartEncoding: boolean) => SmsAnalysis;
export declare const analyzeRcs: (message: string, region: RcsRegion) => RcsAnalysis;
export declare const analyzeRcsRichContent: (content: RcsCardContent, region: RcsRegion) => RcsAnalysis;
