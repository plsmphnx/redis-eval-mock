/*!
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 */

// https://www.kyne.com.au/~mark/software/lua-cjson-manual.html
export default class {
    constructor(private readonly $: JSON) {}

    encode(value: any) {
        return this.$.stringify(value, (_, val) =>
            val === this.null ? null : val
        );
    }

    decode(value: string) {
        return this.$.parse(value, (_, val) =>
            val === null ? this.null : val
        );
    }

    null = NULL;

    // TODO: Implement configuration methods
}

// Arbitrary null userdata constant
class NULL {} // tslint:disable-line
