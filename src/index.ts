/*!
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 */

import * as msgpack from 'msgpack5';
import { Callback, RedisClient } from 'redis';
import { LuaFactory } from 'wasmoon';

import cjson from './library/cjson';
import cmsgpack from './library/cmsgpack';
import redis from './library/redis';
import * as Redis from './utility/redis';

const EVAL = Symbol();

export default async function <T extends Partial<RedisClient>>(
    client: T
): Promise<T> {
    // If we've already mocked this client, just return it
    if (client[EVAL]) {
        return client;
    }

    const send_command =
        client.send_command && client.send_command.bind(client);
    const lua = await new LuaFactory().createEngine();

    // Mock the libraries provided by Redis
    lua.global.set('redis', new redis(client as any));
    lua.global.set('cjson', new cjson(JSON));
    lua.global.set('cmsgpack', new cmsgpack(msgpack()));

    client[EVAL] = {
        // There is no script cache, so always return NOSCRIPT
        evalsha(...input: any[]) {
            Redis.callback(Redis.argument(input))(Error('NOSCRIPT'), null);
        },

        // Use the Lua engine to evaluate the provided script
        eval(...input: any[]) {
            const args = Redis.argument(input);
            const cb = Redis.callback(args);
            (async () => {
                const script = String(args.shift());
                const count = parseInt(args.shift(), 10);

                // Redis passes all arguments as strings
                lua.global.set('KEYS', args.slice(0, count).map(String));
                lua.global.set('ARGV', args.slice(count).map(String));

                return Redis.response(await lua.doString(script));
            })().then(
                res => cb(null, res),
                err => cb(err, null)
            );
        },

        // Ensure eval commands are sent to the new methods
        send_command(command: string, args: any[] = [], cb?: Callback<any>) {
            return command in client[EVAL] || !send_command
                ? client[command](...args, cb)
                : send_command(command, args, cb);
        },
    };

    return Object.assign(client, client[EVAL]);
}
