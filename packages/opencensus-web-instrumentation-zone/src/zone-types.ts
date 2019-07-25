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

import { RootSpan } from '@opencensus/web-core';

export interface AsyncTaskData extends TaskData {
  interactionId: string;
  pageView: string;
}

export type AsyncTask = Task & {
  data: AsyncTaskData;
  eventName: string;
  target: HTMLElement;
  // Allows access to the private `_zone` property of a Zone.js Task.
  _zone: Zone;
};

/** Data used to create a new OnPageInteractionStopwatch. */
export interface OnPageInteractionData {
  startLocationHref: string;
  startLocationPath: string;
  eventType: string;
  target: HTMLElement;
  rootSpan: RootSpan;
}

/**
 * Allows monkey-patching XMLHttpRequest and obtain important data for
 * OpenCensus Web such as the request URL or the HTTP method.
 * `HTMLElement` is necessary when the xhr is captured from the tasks target
 *  as the Zone monkey-patch parses xhrs as `HTMLElement & XMLHttpRequest`.
 */
export type XhrWithOcWebData = HTMLElement &
  XMLHttpRequest & {
    __zone_symbol__xhrURL: string;
    _ocweb_method: string;
    // Attribute to tell that `send()` method has been called before it sends
    // any HTTP request.
    _ocweb_has_called_send: boolean;
  };

/**
 * Allows to keep track of performance entries related to a XHR.
 * As some XHRs might generate a CORS pre-flight request, the XHR
 * might have a cors preflight performance resource timing entry or only the
 * main request performance resource timing.
 */
export interface XhrPerformanceResourceTiming {
  corsPreFlightRequest?: PerformanceResourceTiming;
  mainRequest: PerformanceResourceTiming;
}

/**
 * Type to allow the interaction tracker know whether the interaction name can
 * change or not. As part of naming the interaction, the name could be given
 * using the `data-ocweb-id` attribute or as a CSS selector, however when there
 * are route transitions, the name might change to `Navigation URL`.
 */
export interface InteractionName {
  name: string;
  isReplaceable: boolean;
}
