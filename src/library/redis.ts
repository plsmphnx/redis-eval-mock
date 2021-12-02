/*!
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 */

import * as deasync from 'deasync';
import { RedisClient } from 'redis';

import { nil } from '../utility/lua';

// https://redis.io/commands/eval

// TODO: Reject Redis random commands prior to calling this
export function replicate_commands(this: RedisClient) {
    return true;
}

export function call(this: RedisClient, cmd: string, ...args: any[]) {
    // The Lua VM can only handle synchronous calls, so we need to force the
    // Redis library (which may be using process ticks to simulate actual
    // network calls) to execute syncronously
    const command: any = deasync(this[cmd.toLowerCase()].bind(this));
    const result = command(...args);
    return result != null ? result : nil;
}

export function pcall(this: RedisClient, cmd: string, ...args: any[]) {
    try {
        return call.call(this, cmd, ...args);
    } catch (err) {
        return error_reply.call(this, String(err));
    }
}

export function error_reply(this: RedisClient, err: string) {
    return { err };
}

export function status_reply(this: RedisClient, ok: string) {
    return { ok };
}
