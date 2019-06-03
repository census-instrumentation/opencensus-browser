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

import { randomTraceId } from '@opencensus/web-core';

// Allows us to monkey patch Zone prototype without TS compiler errors.
declare const Zone: ZoneType & { prototype: Zone };

export interface AsyncTaskData {
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

export class InteractionTracker {
  // Allows to track several events triggered by the same user interaction in the right Zone.
  private currentEventTracingZone?: Zone = undefined;

  // Delay of 50 ms to reset currentEventTracingZone.
  private readonly RESET_TRACING_ZONE_DELAY: number = 50;

  constructor() {
    // Keep track of interaction tracker for monkey-patched methods.
    const interactionTracker: InteractionTracker = this;

    const runTask = Zone.prototype.runTask;
    Zone.prototype.runTask = function(
      task: AsyncTask,
      applyThis: unknown,
      applyArgs: unknown
    ) {
      const time = Date.now();

      console.warn('Running task');
      console.log(task);
      console.log(task.zone);

      let taskZone = this;
      if (isTrackedElement(task)) {
        console.log('Click detected');

        if (interactionTracker.currentEventTracingZone === undefined) {
          // Timeout to reset currentEventTracingZone to allow the creation of a new
          // zone for a new user interaction.
          Zone.root.run(() =>
            setTimeout(
              () => (interactionTracker.currentEventTracingZone = undefined),
              interactionTracker.RESET_TRACING_ZONE_DELAY
            )
          );

          const traceId = randomTraceId();
          interactionTracker.currentEventTracingZone = Zone.root.fork({
            name: traceId,
            properties: {
              isTracingZone: true,
              traceId,
            },
          });
          console.log('New zone:');
          console.log(interactionTracker.currentEventTracingZone);
        }

        // Change the zone task.
        task._zone = interactionTracker.currentEventTracingZone;
        taskZone = interactionTracker.currentEventTracingZone;
      } else {
        // If we already are in a tracing zone, just run the task in our tracing zone.
        if (task.zone && task.zone.get('isTracingZone')) {
          taskZone = task.zone;
        }
      }
      try {
        return runTask.call(taskZone as {}, task, applyThis, applyArgs);
      } finally {
        console.log('Run task finished.');
        console.log('Time to complete: ' + (Date.now() - time));
      }
    };

    const scheduleTask = Zone.prototype.scheduleTask;
    Zone.prototype.scheduleTask = function<T extends Task>(task: T): T {
      console.warn('Scheduling task');
      console.log(task);

      let taskZone: Zone = this;
      if (task.zone && task.zone && task.zone.get('isTracingZone')) {
        taskZone = task.zone;
      }
      try {
        return scheduleTask.call(taskZone as {}, task) as T;
      } finally {
      }
    };

    const cancelTask = Zone.prototype.cancelTask;
    Zone.prototype.cancelTask = function(task: AsyncTask) {
      console.warn('Cancel task');
      console.log(task);

      let taskZone: Zone = this;
      if (task.zone && task.zone.get('isTracingZone')) {
        taskZone = task.zone;
      }

      try {
        return cancelTask.call(taskZone as {}, task);
      } finally {
      }
    };
  }
}

function isTrackedElement(task: AsyncTask): boolean {
  return !!(task.eventName && task.eventName === 'click');
}
