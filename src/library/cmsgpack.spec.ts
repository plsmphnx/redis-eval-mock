/*!
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 */

import * as util from 'util';

import { RedisClient } from 'redis';
import * as redis from 'redis-mock';

import mockEval from '../index';

describe('cmsgpack', () => {
    let client: RedisClient;
    let doEval: (script: string, keys: number, ...args: any[]) => Promise<any>;

    beforeEach(async () => {
        client = await mockEval(redis.createClient());
        doEval = util.promisify(client.eval.bind(client));
    });

    it('packs multiple arguments and unpacks multiple returns', async () => {
        const args = [1, 'two', false];

        const packed = await doEval('return cmsgpack.pack(table.unpack(ARGV))', 0, ...args);
        expect(typeof packed).toBe('string');

        const unpacked = await doEval('return { cmsgpack.unpack(ARGV[1]) }', 0, packed);
        expect(Array.isArray(unpacked)).toBe(true);
        expect(unpacked).toEqual(args.map(String));
    });

    it('round-trips all data types', async () => {
        const packed = await doEval('return cmsgpack.pack("string", 1, true, { "array" })', 0);
        expect(
            await doEval(
                `
                local str, num, bool, ary = cmsgpack.unpack(ARGV[1])
                return str == "string" and num == 1 and bool == true and ary[1] == "array"
                `,
                0,
                packed
            )
        ).toBe(1);
    });

    it('round-trips zeros', async () => {
        const packed = await doEval('return cmsgpack.pack("first", 0, "second")', 0);
        expect(
            await doEval(
                `
                local first, zero, second = cmsgpack.unpack(ARGV[1])
                return first == "first" and zero == 0 and second == "second"
                `,
                0,
                packed
            )
        ).toBe(1);
    });

    it('allows indexed returns', async () => {
        expect(
            await doEval(
                `
                local message = cmsgpack.pack("first", "second")
                local index, first, second
                index, first = cmsgpack.unpack_one(message, index)
                index, second = cmsgpack.unpack_limit(message, 1, index)
                return first == "first" and second == "second" and index == -1
                `,
                0
            )
        ).toBe(1);
    });
});
