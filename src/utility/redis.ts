/*!
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 */

import { Callback } from 'redis';

// Extract the actual arguments from the supplied arguments
// https://www.npmjs.com/package/redis#sending-commands
export function argument(input: any[]): any[] {
    return input.reduce((args, arg) => args.concat(arg), []);
}

// Extract the callback from the arguments; if there isn't one, return a no-op
export function callback(args: any[]): Callback<any> {
    return typeof args[args.length - 1] === 'function' ? args.pop() : () => {};
}

// Convert the Lua/JS response to what Redis would return
// https://redis.io/commands/eval#conversion-between-lua-and-redis-data-types
export function response(value: any): any {
    switch (typeof value) {
        case 'string':
            return value;
        case 'number':
            return Math.floor(value);
        case 'boolean':
            return value ? 1 : null;
        case 'object':
            if (Array.isArray(value)) {
                return value.map(response);
            }
            if (value) {
                if (typeof value.err === 'string') {
                    throw new Error(value.err);
                }
                if (typeof value.ok === 'string') {
                    return value.ok;
                }
                return [];
            }
        // falls through
        case 'undefined':
        default:
            return null;
    }
}
