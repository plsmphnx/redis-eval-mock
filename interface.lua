-- Copyright (c) Microsoft Corporation.
-- Licensed under the MIT License.

-- Mimic Lua pairs for JS objects
function js.pairs(value)
    local keys = js.global.Object:keys(value)
    local i = 0
    return function()
        -- Lua treats numeric keys as actually numeric
        local key = tonumber(keys[i]) or keys[i]
        i = i + 1
        return key, value[key]
    end
end

-- Marshal a value to JS from Lua
function js.from(...)
    local value = ...
    if type(value) == 'table' then
        -- Treat tables with numeric keys as arrays, string keys as objects
        value = value[1] ~= nil and js.global:Array() or js.global:Object()
        for key, val in pairs(...) do
            -- Convert from Lua's 1-indexing to JS's 0-indexing
            if type(key) == 'number' then
                key = key - 1
            end
            -- Recursively marshal values
            value[key] = js.from(val)
        end
    end
    -- Continue processing further arguments
    if value ~= nil then
        return value, js.from(select(2, ...))
    end
end

-- Marshal a value from JS to Lua
function js.to(...)
    local value = ...
    if js.global.Object:is(js.null, value) then
        -- Convert null values to the null constant
        -- to allow for strict userdata comparison
        value = js.null
    elseif type(value) == 'userdata' then
        -- Treat non-null userdata (JS objects) as tables
        value = {}
        for key, val in js.pairs(...) do
            -- Convert from JS's 0-indexing to Lua's 1-indexing
            if type(key) == 'number' then
                key = key + 1
            end
            -- Recursively marshal values
            value[key] = js.to(val)
        end
    end
    -- Continue processing further arguments
    if value ~= nil then
        return value, js.to(select(2, ...))
    end
end

-- Marshal a function call between JS and Lua
function js.call(fn, ...)
    -- Use pcall to catch thrown values for special handling
    local single, result = pcall(fn, js.from(...))
    if single then
        -- If the function did not throw, return its result
        return js.to(result)
    elseif js.global.Array:isArray(result) then
        -- If the function threw an array, unpack it as a multi-return
        return unpack(js.to(result))
    else
        -- If the function threw anything else, stringify it as an error
        error(js.global:String(result))
    end
end