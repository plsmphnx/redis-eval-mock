/*!
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 */

// https://www.kyne.com.au/~mark/software/lua-cjson-manual.html

export function encode(this: JSON, value: any) {
    return this.stringify(value);
}

export function decode(this: JSON, value: string) {
    return this.parse(value);
}

module.exports.null = null;

// TODO: Implement configuration methods
