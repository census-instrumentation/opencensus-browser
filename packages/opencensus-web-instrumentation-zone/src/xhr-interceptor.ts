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

import { AsyncTask, XHRWithUrl } from './zone-types';
import {
  RootSpan,
  Span,
  ATTRIBUTE_HTTP_STATUS_CODE,
  ATTRIBUTE_HTTP_METHOD,
  parseUrl,
  SpanKind,
} from '@opencensus/web-core';
import { getXhrPerfomanceData } from './perf-resource-timing-selector';
import { traceOriginMatchesOrSameOrigin, isTrackedTask } from './util';
import { spanContextToTraceParent } from '@opencensus/web-propagation-tracecontext';
import {
  annotationsForPerfTimeFields,
  PerformanceResourceTimingExtended,
  PERFORMANCE_ENTRY_EVENTS,
  getResourceSpan,
} from '@opencensus/web-instrumentation-perf';

// Map intended to keep track of current XHR objects
// associated to a span.
const xhrSpans = new Map<XHRWithUrl, Span>();

// Keeps track of the current xhr tasks that are running. This is
// useful to clear the Performance Resource Timing entries when no
// xhr tasks are being intercepted.
let xhrTasksCount = 0;

/**
 * Intercepts task as XHR if it is a tracked task and its target object is
 * instance of `XMLHttpRequest`.
 * In case the task is intercepted, sets the Trace Context Header to it and
 * creates a child span related to this XHR in case it is OPENED.
 * In case the XHR is DONE, end the child span.
 * @param task
 */
export function interceptXhrTask(task: AsyncTask) {
  if (!isTrackedTask(task)) return;
  if (!(task.target instanceof XMLHttpRequest)) return;

  const xhr = task.target as XHRWithUrl;
  if (xhr.readyState === XMLHttpRequest.OPENED) {
    incrementXhrTaskCount();
    const rootSpan: RootSpan = task.zone.get('data').rootSpan;
    setTraceparentContextHeader(xhr, rootSpan);
  } else if (xhr.readyState === XMLHttpRequest.DONE) {
    endXhrSpan(xhr);
    decrementXhrTaskCount();
  }
}

function setTraceparentContextHeader(
  xhr: XHRWithUrl,
  rootSpan: RootSpan
): void {
  // `__zone_symbol__xhrURL` is set by the Zone monkey-path.
  const xhrUrl = xhr.__zone_symbol__xhrURL;
  const childSpan = rootSpan.startChildSpan({
    name: parseUrl(xhrUrl).pathname,
    kind: SpanKind.CLIENT,
  });
  // Associate the child span to the XHR so it allows to
  // find the correct span when the request is DONE.
  xhrSpans.set(xhr, childSpan);
  if (traceOriginMatchesOrSameOrigin(xhrUrl)) {
    xhr.setRequestHeader(
      'traceparent',
      spanContextToTraceParent({
        traceId: rootSpan.traceId,
        spanId: childSpan.id,
      })
    );
  }
}

function endXhrSpan(xhr: XHRWithUrl): void {
  const span = xhrSpans.get(xhr);
  if (span) {
    // TODO: Investigate more to send the the status code a `number` rather
    // than `string`. Once it is able to send as a number, change it.
    span.addAttribute(ATTRIBUTE_HTTP_STATUS_CODE, xhr.status.toString());
    span.addAttribute(ATTRIBUTE_HTTP_METHOD, xhr._ocweb_method);
    span.end();
    joinPerfResourceDataToSpan(xhr, span);
    xhrSpans.delete(xhr);
  }
}

// If xhr task count is 0, clear the Performance Resource Timings.
// This is done in order to help the browser Performance resource timings
// selector algorithm to take only the data related to the current XHRs running.
function maybeClearPerfResourceBuffer(): void {
  if (xhrTasksCount === 0) performance.clearResourceTimings();
}

function joinPerfResourceDataToSpan(xhr: XHRWithUrl, span: Span) {
  const perfResourceTimings = getXhrPerfomanceData(xhr.responseURL, span);
  if (perfResourceTimings instanceof Array) {
    // This case is true when the resource timings data associates two entries
    // to the span, where the first entry is the CORS pre-flight request and
    // the second is the actual HTTP request. Create a child span which is
    // related to the CORS pre-flight and use the second entry to add
    // annotations to the span.
    const corsPerfTiming = perfResourceTimings[0] as PerformanceResourceTimingExtended;
    const actualXhrPerfTiming = perfResourceTimings[1] as PerformanceResourceTimingExtended;
    setCorsPerfTimingAsChildSpan(corsPerfTiming, span);
    span.annotations = annotationsForPerfTimeFields(
      actualXhrPerfTiming,
      PERFORMANCE_ENTRY_EVENTS
    );
  } else if (perfResourceTimings) {
    span.annotations = annotationsForPerfTimeFields(
      perfResourceTimings as PerformanceResourceTimingExtended,
      PERFORMANCE_ENTRY_EVENTS
    );
  }
}

function setCorsPerfTimingAsChildSpan(
  performanceTiming: PerformanceResourceTimingExtended,
  span: Span
): void {
  const corsSpan = getResourceSpan(performanceTiming, span.traceId, span.id);
  corsSpan.name = 'CORS';
  span.spans.push(corsSpan);
}

function incrementXhrTaskCount(): void {
  xhrTasksCount++;
}

function decrementXhrTaskCount(): void {
  if (xhrTasksCount > 0) xhrTasksCount--;
  maybeClearPerfResourceBuffer();
}
