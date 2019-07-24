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

import { SpanContext } from '@opencensus/web-types';

/**
 * Store the Span Context generated for the initial load.
 */
let initialLoadSpanContext: SpanContext;

const IS_SAMPLED_BIT = 0x1;

/**
 * Returns whether sampling hint bit of the intial load span context `options`
 * is set.
 * The used Span Context is the one set by `setInitialLoadSpanContext`.
 */
export function isSampled() {
  const options = initialLoadSpanContext.options;
  if (!options) return false;
  return !!(options & IS_SAMPLED_BIT);
}

/**
 * Random sampling decision using `Math.random`.
 */
export function makeRandomSamplingDecision(sampleRate: number): number {
  // Math.random returns a number in the 0-1 range (inclusive of 0 but not 1).
  // That means we should use the strict `<` operator to compare it to the
  // sample rate. A value of 1 for `options` indicates trace sampling.
  return Math.random() < sampleRate ? 1 : 0;
}

/**
 * Set the initial load span context to pass it around OpenCensus Web.
 * This allows the interaction tracker and the user interactions to be related
 * to the initial load page, for instance, the user interactions will have the
 * same sampling decision as the initial load.
 */
export function setInitialLoadSpanContext(spanContext: SpanContext) {
  initialLoadSpanContext = spanContext;
}
