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

import * as coreTypes from '@opencensus/core';
import * as apiTypes from './api-types';

/**
 * Converts a RootSpan type from @opencensus/core to the Span JSON structure
 * expected by the OpenCensus Agent's HTTP/JSON (grpc-gateway) API.
 */
export function adaptRootSpan(rootSpan: coreTypes.RootSpan): apiTypes.Span[] {
  const adaptedSpans: apiTypes.Span[] = rootSpan.spans.map(adaptSpan);
  adaptedSpans.unshift(adaptSpan(rootSpan));
  return adaptedSpans;
}

function adaptString(value: string): apiTypes.TruncatableString {
  return {value};
}

/** Converts hexadecimal string to base64 string. */
function hexToBase64(hexStr: string): string {
  const hexStrLen = hexStr.length;
  let hexAsciiCharsStr = '';
  for (let i = 0; i < hexStrLen; i += 2) {
    const hexPair = hexStr.substring(i, i + 2);
    // tslint:disable-next-line:ban Needed to parse hexadecimal.
    const hexVal = parseInt(hexPair, 16);
    hexAsciiCharsStr += String.fromCharCode(hexVal);
  }
  return btoa(hexAsciiCharsStr);
}

function adaptTraceState(coreTraceState?: coreTypes.TraceState):
    apiTypes.TraceState {
  if (!coreTraceState || !coreTraceState.length) return {};
  const entries = coreTraceState.split(',');
  const apiTraceState: apiTypes.TraceState = {};
  for (const entry of entries) {
    const [key, value] = entry.split('=');
    apiTraceState[key] = value;
  }
  return apiTraceState;
}

function adaptSpanKind(coreKind: string): apiTypes.SpanKind {
  switch (coreKind) {
    case 'SERVER': {
      return apiTypes.SpanKind.SERVER;
    }
    case 'CLIENT': {
      return apiTypes.SpanKind.CLIENT;
    }
    default: { return apiTypes.SpanKind.UNSPECIFIED; }
  }
}

function adaptValue(value: boolean|string|number): apiTypes.AttributeValue {
  const valType = typeof value;
  if (valType === 'boolean') {
    return {boolValue: value as boolean};
  }
  if (valType === 'number') {
    return {doubleValue: value as number};
  }
  return {stringValue: adaptString(String(value))};
}

function adaptAttributes(attributes: coreTypes.Attributes):
    apiTypes.Attributes {
  const attributeMap: apiTypes.AttributeMap = {};
  for (const key of Object.keys(attributes)) {
    attributeMap[key] = adaptValue(attributes[key]);
  }
  return {attributeMap};
}

function adaptAnnotation(annotation: coreTypes.Annotation): apiTypes.TimeEvent {
  return {
    time: new Date(annotation.timestamp).toISOString(),
    annotation: {
      description: adaptString(annotation.description),
      attributes: adaptAttributes(annotation.attributes),
    },
  };
}

function adaptMessageEventType(type: string): apiTypes.MessageEventType {
  switch (type) {
    case 'SENT': {
      return apiTypes.MessageEventType.SENT;
    }
    case 'RECEIVED': {
      return apiTypes.MessageEventType.RECEIVED;
    }
    default: { return apiTypes.MessageEventType.UNSPECIFIED; }
  }
}

function adaptMessageEvent(messageEvent: coreTypes.MessageEvent):
    apiTypes.TimeEvent {
  return {
    time: new Date(messageEvent.timestamp).toISOString(),
    messageEvent: {
      // tslint:disable-next-line:ban Needed to parse hexadecimal.
      id: String(parseInt(messageEvent.id, 16)),
      type: adaptMessageEventType(messageEvent.type),
    },
  };
}

function adaptTimeEvents(
    annotations: coreTypes.Annotation[],
    messageEvents: coreTypes.MessageEvent[]): apiTypes.TimeEvents {
  return {
    timeEvent: annotations.map(adaptAnnotation)
                   .concat(messageEvents.map(adaptMessageEvent)),
  };
}

function adaptLinkType(type: string): apiTypes.LinkType {
  switch (type) {
    case 'CHILD_LINKED_SPAN': {
      return apiTypes.LinkType.CHILD_LINKED_SPAN;
    }
    case 'PARENT_LINKED_SPAN': {
      return apiTypes.LinkType.PARENT_LINKED_SPAN;
    }
    default: { return apiTypes.LinkType.UNSPECIFIED; }
  }
}

function adaptLink(link: coreTypes.Link): apiTypes.Link {
  return {
    traceId: hexToBase64(link.traceId),
    spanId: hexToBase64(link.spanId),
    type: adaptLinkType(link.type),
    attributes: adaptAttributes(link.attributes),
  };
}

function adaptLinks(links: coreTypes.Link[]): apiTypes.Links {
  return {link: links.map(adaptLink)};
}

function adaptSpan(span: coreTypes.Span): apiTypes.Span {
  // The stackTrace and childSpanCount attributes are not currently supported by
  // opencensus-web.
  return {
    traceId: hexToBase64(span.traceId),
    spanId: hexToBase64(span.id),
    tracestate: adaptTraceState(span.traceState),
    parentSpanId: hexToBase64(span.parentSpanId),
    name: adaptString(span.name),
    kind: adaptSpanKind(span.kind),
    startTime: span.startTime.toISOString(),
    endTime: span.endTime.toISOString(),
    attributes: adaptAttributes(span.attributes),
    timeEvents: adaptTimeEvents(span.annotations, span.messageEvents),
    links: adaptLinks(span.links),
    status: adaptStatus(span.status),
    sameProcessAsParentSpan: !span.remoteParent,
  };
}

function adaptStatus(code: number): apiTypes.Status {
  return code ? {code} : {};
}
