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

import 'jasmine';
import {parseUrl} from '../src/common/url-util';

describe('parseUrl', () => {
  it('parses a URL into its various components', () => {
    const parsedUrl =
        parseUrl('https://example.com:3000/pathname/?search=test#hash');

    expect(parsedUrl.protocol).toBe('https');
    expect(parsedUrl.hostname).toBe('example.com');
    expect(parsedUrl.port).toBe('3000');
    expect(parsedUrl.host).toBe('example.com:3000');
    expect(parsedUrl.origin).toBe('http://example.com:3000');
    expect(parsedUrl.pathname).toBe('/pathname/');
    expect(parsedUrl.hash).toBe('#hash');
    expect(parsedUrl.search).toBe('?search=test');
  });
});
