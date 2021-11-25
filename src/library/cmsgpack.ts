/*!
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 */

import { MessagePack } from 'msgpack5';
import { LuaMultiReturn } from 'wasmoon';

// https://github.com/antirez/lua-cmsgpack
export default class {
    constructor(private readonly $: MessagePack) {}

    pack(...args: any[]) {
        return mp_pack(this.$, args);
    }

    unpack(msgpack: string) {
        const results = mp_unpack_full(this.$, msgpack, 0, 0);
        return LuaMultiReturn.from(results.slice(1));
    }

    unpack_one(msgpack: string, offset = 0) {
        const results = mp_unpack_full(this.$, msgpack, 1, offset);
        return LuaMultiReturn.from(results.slice(0, 2));
    }

    unpack_limit(msgpack: string, limit: number, offset = 0) {
        const results = mp_unpack_full(this.$, msgpack, limit, offset);
        return LuaMultiReturn.from(results);
    }
}

// The Lua-to-JS string translation appears to truncate at nulls,
// so use the safe base64 rather than the more accurate binary
const ENCODING = 'base64';

function mp_pack(msgpack: MessagePack, args: any[]): string {
    return msgpack.encode(args).toString(ENCODING);
}

function mp_unpack_full(
    msgpack: MessagePack,
    value: string,
    limit: number,
    offset: number
): [number, ...any[]] {
    const results = msgpack.decode(Buffer.from(value, ENCODING)) as any[];

    if (limit < 0 || offset < 0) {
        throw RangeError(
            `Invalid request to unpack with offset of ${offset} and limit of ${limit}.`
        );
    }
    const end = Math.min(offset + (limit || Infinity), results.length);

    return [end === results.length ? -1 : end, ...results.slice(offset, end)];
}
