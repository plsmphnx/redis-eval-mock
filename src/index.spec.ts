/*!
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 */

import * as util from 'util';

import { RedisClient } from 'redis';
import * as evalsha from 'redis-evalsha';
import * as redis from 'redis-mock';

import mockEval from './index';

describe('index', () => {
    let client: RedisClient;
    let scripts: any;
    let doExec: (script: string, keys: string[], args: any[]) => Promise<any>;

    beforeEach(() => {
        client = mockEval(redis.createClient());
        scripts = new evalsha(client);
        doExec = util.promisify(scripts.exec.bind(scripts));
    });

    it('proxies eval commands correctly', async () => {
        scripts.add('empty', 'return nil');
        expect(await doExec('empty', [], [])).toBe(null);
    });

    it('handles secondary cases', async () => {
        scripts.add('empty', 'return nil');
        expect(mockEval(client)).toBe(client);
        expect(() => scripts.exec('empty', [], [])).not.toThrow();
    });
});
