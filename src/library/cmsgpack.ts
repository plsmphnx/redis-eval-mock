/*!
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 */

import { MessagePack } from 'msgpack5';

import { returns } from '../utility/lua';

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

// https://github.com/antirez/lua-cmsgpack

export function pack(this: MessagePack, ...args: any[]) {
    return mp_pack(this, args);
}

export function unpack(this: MessagePack, msgpack: string) {
    const results = mp_unpack_full(this, msgpack, 0, 0);
    returns(...results.slice(1));
}

export function unpack_one(this: MessagePack, msgpack: string, offset = 0) {
    const results = mp_unpack_full(this, msgpack, 1, offset);
    returns(...results.slice(0, 2));
}

export function unpack_limit(
    this: MessagePack,
    msgpack: string,
    limit: number,
    offset = 0
) {
    const results = mp_unpack_full(this, msgpack, limit, offset);
    returns(...results);
}
