/*!
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 */

import * as util from 'util';

import { RedisClient } from 'redis';
import * as redis from 'redis-mock';

import mockEval from '../index';

describe('cjson', () => {
    let client: RedisClient;
    let doEval: (script: string, keys: number, ...args: any[]) => Promise<any>;

    beforeEach(() => {
        client = mockEval(redis.createClient());
        doEval = util.promisify(client.eval.bind(client));
    });

    it('decodes null to its internal constant', async () => {
        expect(await doEval('return cjson.decode(ARGV[1]) == cjson.null', 0, 'null')).toBe(1);
        expect(await doEval('return cjson.decode(ARGV[1]) == nil', 0, 'null')).toBe(null);
    });

    it('encodes provided arguments', async () => {
        expect(await doEval('return cjson.encode(ARGV)', 0, 1, 'two', false)).toBe('["1","two","false"]');
    });
});
