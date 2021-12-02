/*!
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 */

import * as util from 'util';

import { RedisClient } from 'redis';
import * as redis from 'redis-mock';

import mockEval from '../index';

describe('redis', () => {
    let client: RedisClient;
    let doEval: (script: string, keys: number, ...args: any[]) => Promise<any>;

    beforeEach(() => {
        client = mockEval(redis.createClient());
        doEval = util.promisify(client.eval.bind(client));
    });

    it('calls into the underlying library for commands', async () => {
        jest.spyOn(client, 'set');
        jest.spyOn(client, 'get');

        const key = 'key';
        expect(await doEval('return redis.call("set", KEYS[1], "4.5")', 1, key)).toBe('OK');
        expect(await doEval('return redis.call("get", KEYS[1])', 1, key)).toBe('4.5');
        expect(await doEval('return tonumber(redis.call("get", KEYS[1]))', 1, key)).toBe(4);

        expect(client.set).toHaveBeenCalledTimes(1);
        expect(client.get).toHaveBeenCalledTimes(2);
    });

    it('catches a thrown error when called with pcall', async () => {
        const key = 'fail';
        expect(await doEval('return redis.call("lpush", KEYS[1], "value")', 1, key)).toBe(1);
        expect(await doEval('return redis.pcall("get", KEYS[1]).err', 1, key)).toEqual(expect.any(String));
    });

    it('handles status and error replies', async () => {
        expect(await doEval('return redis.status_reply("status")', 0)).toBe('status');
        await expect(doEval('return redis.error_reply("error")', 0)).rejects.toThrow();
    });

    it('translates an empty response', async () => {
        expect(await doEval('return redis.call("get", KEYS[1]) == nil', 1, 'empty')).toBe(1);
    });
});
