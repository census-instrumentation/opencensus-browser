/**
 * Copyright 2019, OpenCensus Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  isSampled,
  makeRandomSamplingDecision,
} from '../src/initial-load-sampling';

describe('Initial Load Util', () => {
  describe('isSampled', () => {
    it('returns true if sampling bit is set', () => {
      expect(isSampled({ traceId: '', spanId: '', options: 1 })).toBe(true);
      expect(isSampled({ traceId: '', spanId: '', options: 5 })).toBe(true);
    });
    it('returns false if sampling bit is not set', () => {
      expect(isSampled({ traceId: '', spanId: '', options: 0 })).toBe(false);
      expect(isSampled({ traceId: '', spanId: '', options: 4 })).toBe(false);
    });
  });

  describe('makeRandomSamplingDecision', () => {
    it('returns 1 if random decision is less than sample rate', () => {
      spyOn(Math, 'random').and.returnValue(0.5);
      expect(makeRandomSamplingDecision(1)).toBe(1);
    });
    it('returns 0 if random decision is greater than sample rate', () => {
      spyOn(Math, 'random').and.returnValue(0.7);
      expect(makeRandomSamplingDecision(0.5)).toBe(0);
    });
  });
});
