import { RcsRegion } from '../libs/RcsSegmentedMessage';
import type { SmsAnalysis, SmsEncodingSetting, RcsAnalysis } from './types';
export declare const analyzeSms: (message: string, encoding: SmsEncodingSetting, smartEncoding: boolean) => SmsAnalysis;
export declare const analyzeRcs: (message: string, region: RcsRegion) => RcsAnalysis;
