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

/**
 * @fileoverview Trace related enums. These can't be directly imported from
 * `@opencensus/core`, because that will create a runtime dependency on it.
 * That is because TypeScript enums have a runtime existence, unlike interfaces.
 * A runtime dependency on `@opencensus/core` is not good for OpenCensus Web,
 * because then it would need to depend on other Node libraries.
 * These enums are based on @opencensus/core and the Trace protos. See:
 * https://github.com/census-instrumentation/opencensus-proto/blob/master/src/opencensus/proto/trace/v1/trace.proto
 * https://github.com/census-instrumentation/opencensus-node/blob/master/packages/opencensus-core/src/trace/model/types.ts#L44
 */

/**
 * Type of link. The relationship of the current span relative to the linked
 * span.
 */
export enum LinkType {
  /**
   * The relationship of the two spans is unknown, or known but other
   * than parent-child.
   */
  UNSPECIFIED = 0,
  /** The linked span is a child of the current span. */
  CHILD_LINKED_SPAN = 1,
  /** The linked span is a parent of the current span. */
  PARENT_LINKED_SPAN = 2,
}

/**
 * Type of span. Can be used to specify additional relationships between spans
 * in addition to a parent/child relationship.
 */
export enum SpanKind {
  /** Unspecified */
  UNSPECIFIED = 0,
  /**
   * Indicates that the span covers server-side handling of an RPC or other
   * remote network request.
   */
  SERVER = 1,
  /**
   * Indicates that the span covers the client-side wrapper around an RPC or
   * other remote request.
   */
  CLIENT = 2,
}

/** An enumeration of canonical status codes. */
export enum CanonicalCode {
  /**
   * Not an error; returned on success
   */
  OK = 0,
  /**
   * The operation was cancelled (typically by the caller).
   */
  CANCELLED = 1,
  /**
   * Unknown error.  An example of where this error may be returned is
   * if a status value received from another address space belongs to
   * an error-space that is not known in this address space.  Also
   * errors raised by APIs that do not return enough error information
   * may be converted to this error.
   */
  UNKNOWN = 2,
  /**
   * Client specified an invalid argument.  Note that this differs
   * from FAILED_PRECONDITION.  INVALID_ARGUMENT indicates arguments
   * that are problematic regardless of the state of the system
   * (e.g., a malformed file name).
   */
  INVALID_ARGUMENT = 3,
  /**
   * Deadline expired before operation could complete.  For operations
   * that change the state of the system, this error may be returned
   * even if the operation has completed successfully.  For example, a
   * successful response from a server could have been delayed long
   * enough for the deadline to expire.
   */
  DEADLINE_EXCEEDED = 4,
  /**
   * Some requested entity (e.g., file or directory) was not found.
   */
  NOT_FOUND = 5,
  /**
   * Some entity that we attempted to create (e.g., file or directory)
   * already exists.
   */
  ALREADY_EXISTS = 6,
  /**
   * The caller does not have permission to execute the specified
   * operation.  PERMISSION_DENIED must not be used for rejections
   * caused by exhausting some resource (use RESOURCE_EXHAUSTED
   * instead for those errors).  PERMISSION_DENIED must not be
   * used if the caller can not be identified (use UNAUTHENTICATED
   * instead for those errors).
   */
  PERMISSION_DENIED = 7,
  /**
   * Some resource has been exhausted, perhaps a per-user quota, or
   * perhaps the entire file system is out of space.
   */
  RESOURCE_EXHAUSTED = 8,
  /**
   * Operation was rejected because the system is not in a state
   * required for the operation's execution.  For example, directory
   * to be deleted may be non-empty, an rmdir operation is applied to
   * a non-directory, etc.
   *
   * A litmus test that may help a service implementor in deciding
   * between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE:
   *
   *  - Use UNAVAILABLE if the client can retry just the failing call.
   *  - Use ABORTED if the client should retry at a higher-level
   *    (e.g., restarting a read-modify-write sequence).
   *  - Use FAILED_PRECONDITION if the client should not retry until
   *    the system state has been explicitly fixed.  E.g., if an "rmdir"
   *    fails because the directory is non-empty, FAILED_PRECONDITION
   *    should be returned since the client should not retry unless
   *    they have first fixed up the directory by deleting files from it.
   *  - Use FAILED_PRECONDITION if the client performs conditional
   *    REST Get/Update/Delete on a resource and the resource on the
   *    server does not match the condition. E.g., conflicting
   *    read-modify-write on the same resource.
   */
  FAILED_PRECONDITION = 9,
  /**
   * The operation was aborted, typically due to a concurrency issue
   * like sequencer check failures, transaction aborts, etc.
   *
   * See litmus test above for deciding between FAILED_PRECONDITION,
   * ABORTED, and UNAVAILABLE.
   */
  ABORTED = 10,
  /**
   * Operation was attempted past the valid range.  E.g., seeking or
   * reading past end of file.
   *
   * Unlike INVALID_ARGUMENT, this error indicates a problem that may
   * be fixed if the system state changes. For example, a 32-bit file
   * system will generate INVALID_ARGUMENT if asked to read at an
   * offset that is not in the range [0,2^32-1], but it will generate
   * OUT_OF_RANGE if asked to read from an offset past the current
   * file size.
   *
   * There is a fair bit of overlap between FAILED_PRECONDITION and
   * OUT_OF_RANGE.  We recommend using OUT_OF_RANGE (the more specific
   * error) when it applies so that callers who are iterating through
   * a space can easily look for an OUT_OF_RANGE error to detect when
   * they are done.
   */
  OUT_OF_RANGE = 11,
  /**
   * Operation is not implemented or not supported/enabled in this service.
   */
  UNIMPLEMENTED = 12,
  /**
   * Internal errors.  Means some invariants expected by underlying
   * system has been broken.  If you see one of these errors,
   * something is very broken.
   */
  INTERNAL = 13,
  /**
   * The service is currently unavailable.  This is a most likely a
   * transient condition and may be corrected by retrying with
   * a backoff.
   *
   * See litmus test above for deciding between FAILED_PRECONDITION,
   * ABORTED, and UNAVAILABLE.
   */
  UNAVAILABLE = 14,
  /**
   * Unrecoverable data loss or corruption.
   */
  DATA_LOSS = 15,
  /**
   * The request does not have valid authentication credentials for the
   * operation.
   */
  UNAUTHENTICATED = 16,
}

/** An event describing a message sent/received between Spans. */
export enum MessageEventType {
  /** Unknown event type. */
  UNSPECIFIED = 0,
  /** Indicates a sent message. */
  SENT = 1,
  /** Indicates a received message. */
  RECEIVED = 2,
}
