/*!
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 */

import * as deasync from 'deasync';
import { RedisClient } from 'redis';

// https://redis.io/commands/eval
export default class {
    constructor(private readonly $: RedisClient) {}

    // TODO: Reject Redis random commands prior to calling this
    replicate_commands() {
        return true;
    }

    call(cmd: string, ...args: any[]) {
        // The Lua VM can only handle synchronous calls, so we need to force the
        // Redis library (which may be using process ticks to simulate actual
        // network calls) to execute syncronously
        const command: any = deasync(this.$[cmd.toLowerCase()].bind(this.$));
        const res = command(...args);
        return res != null ? res : null;
    }

    pcall(cmd: string, ...args: any[]) {
        try {
            return this.call(cmd, ...args);
        } catch (err) {
            return this.error_reply(String(err));
        }
    }

    error_reply(err: string) {
        return { err };
    }

    status_reply(ok: string) {
        return { ok };
    }
}
