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
  getInitialLoadSpanContext,
} from '@opencensus/web-initial-load';
import { OCAgentExporter } from '@opencensus/web-exporter-ocagent';
import { WindowWithInteractionGlobals } from './zone-types';

const windowWithInteractionGlobals = window as WindowWithInteractionGlobals;

/** Trace endpoint in the OC agent. */
const TRACE_ENDPOINT = '/v1/trace';

import { InteractionTracker } from './interaction-tracker';
import { doPatching } from './monkey-patching';
import { tracing } from '@opencensus/web-core';

function setupExporter() {
  if (!windowWithInteractionGlobals.ocAgent) {
    console.log('Not configured to export page load spans.');
    return;
  }

  tracing.registerExporter(
    new OCAgentExporter({
      agentEndpoint: `${windowWithInteractionGlobals.ocAgent}${TRACE_ENDPOINT}`,
    })
  );
}

export function startInteractionTracker() {
  // Do not start the interaction tracker if it is not sampled. This decision
  // is done in the Initial Load page module using the Initial Load Span
  // Context.
  // If it is sampled, all the interactions will be sampled, otherwise,
  // none of them are sampled.
  if (!isSampled(getInitialLoadSpanContext())) return;

  doPatching();
  setupExporter();
  InteractionTracker.startTracking();
}
