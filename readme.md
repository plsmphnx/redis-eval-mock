# redis-eval-mock

[![build status](https://github.com/plsmphnx/redis-eval-mock/workflows/build/badge.svg)](https://github.com/plsmphnx/redis-eval-mock/actions?query=workflow%3Abuild+branch%3Amaster)
[![codecov](https://codecov.io/gh/plsmphnx/redis-eval-mock/branch/master/graph/badge.svg)](https://codecov.io/gh/plsmphnx/redis-eval-mock)
[![npm version](https://img.shields.io/npm/v/redis-eval-mock.svg)](https://npmjs.org/package/redis-eval-mock)

Provides a mock of the `EVAL` functionality in Redis using `lua.vm.js` in order
to test Lua scripts. It is intended to be used along with an existing mock of
the `redis` library, and calls back into it for Redis calls executed from Lua.
In addition, it provides mocks of the `cjson` and `cmsgpack` libraries provided
by default to Lua by Redis.

## API

### _default_(client)

Replaces the implementations of `eval` and `evalsha` in _client_ with functional
mocks. Returns the client. The implementation does not currently include a mock
script cache, so `evalsha` will always throw a `NOSCRIPT` error.

## Example

```ts
import * as redis from 'redis';
import * as mock from 'redis-mock';

import mockEval from 'redis-eval-mock';

jest.spyOn(redis, 'createClient').mockImplementation(() =>
    mockEval(mock.createClient())
);
```

## Contributing

This project has adopted the
[Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the
[Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any
additional questions or comments.
