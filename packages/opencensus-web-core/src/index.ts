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

// Export web implementation of core trace classes and types.
export {RootSpan} from './trace/model/root-span';
export {Span} from './trace/model/span';
export {Tracer} from './trace/model/tracer';
export {Tracing} from './trace/model/tracing';
export * from './trace/model/enums';
export * from './trace/model/attribute-keys';

// Re-export types this uses from @opencensus/core.
export {Annotation, Attributes, Config, Exporter, Link, MessageEvent, Propagation, SpanContext, SpanEventListener, TracerConfig, TraceState} from '@opencensus/core';

export * from './common/time-util';
export * from './common/url-util';

// Export global tracing instance.
import {Tracing} from './trace/model/tracing';
const tracing = new Tracing();
export {tracing};
