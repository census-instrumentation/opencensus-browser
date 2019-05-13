# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

- Add support for object(```SpanOptions```) as an argument for ```startChildSpan``` function, similar to ```startRootSpan```.

## 0.0.2 - 2019-04-29

Fix: add JS bundles and source maps to the NPM files for @opencensus/web-all 
(#66), which were incorrectly not included before. This enables linking the JS
bundles in `<script>` tags via the unpkg.com or jsdelivr.com CDNs for NPM files.

## 0.0.1 - 2019-04-26

- TypeScript interfaces and enums extracted from the `@opencensus/core`
    package of [opencensus-node][opencensus-node-url]
- Initial `Tracer` and `Span` implementations. The tracer only supports a single
    root span at a time within a browser tab.
- Exporter to write traces to the OpenCensus Agent via its [HTTP/JSON feature][oc-agent-http-url].
- Instrumentation to generate trace spans for the resource timing waterfall of
    an initial page load.
- Option to link the initial HTML load client span with its server-side span by
  having the client write a `traceparent` global variable in
  [trace context W3C draft format][trace-context-url].
- WebPack build scripts to generate JS bundles to enable adding instrumentation
  of the initial page load spans and exporting them to the OpenCensus agent.

[oc-agent-http-url]: https://github.com/census-instrumentation/opencensus-service/tree/master/receiver#writing-with-httpjson
[opencensus-node-url]: http://github.com/census-instrumentation/opencensus-node
[trace-context-url]: https://www.w3.org/TR/trace-context/
