export const ACQUIRE_HOLD_LUA = `
local payload = cjson.decode(ARGV[1])
local categoryCount = table.getn(payload.entries)
local holdKeyIndex = categoryCount + 1
local expirationSetIndex = categoryCount + 2
local holdKey = KEYS[holdKeyIndex]
local expirationSetKey = KEYS[expirationSetIndex]

if redis.call('EXISTS', holdKey) == 1 then
	return cjson.encode({ success = false, error = 'HOLD_ALREADY_EXISTS' })
end

for i = 1, categoryCount do
	local inventoryKey = KEYS[i]
	local entry = payload.entries[i]
	local requestQty = tonumber(entry.quantity)
	if requestQty <= 0 then
		return cjson.encode({ success = false, error = 'INVALID_QUANTITY', categoryId = entry.categoryId })
	end
	local available = tonumber(redis.call('HGET', inventoryKey, 'available') or '0')
	if available < requestQty then
		return cjson.encode({
			success = false,
			error = 'INSUFFICIENT_STOCK',
			categoryId = entry.categoryId,
			available = available
		})
	end
end

for i = 1, categoryCount do
	local inventoryKey = KEYS[i]
	local entry = payload.entries[i]
	local requestQty = tonumber(entry.quantity)
	redis.call('HINCRBY', inventoryKey, 'available', -requestQty)
	redis.call('HINCRBY', inventoryKey, 'pending', requestQty)
	redis.call('HINCRBY', inventoryKey, 'version', 1)
end

redis.call('HMSET', holdKey,
	'token', payload.holdToken,
	'status', 'held',
	'createdAt', payload.createdAtIso,
	'expiresAt', payload.expiresAtIso,
	'expiresAtEpoch', tostring(payload.expiresAtEpoch),
	'metadata', cjson.encode(payload.metadata or {}),
	'entries', cjson.encode(payload.entries),
	'traceId', payload.traceId or ''
)
redis.call('EXPIRE', holdKey, payload.ttlSeconds)
redis.call('ZADD', expirationSetKey, payload.expiresAtEpoch, payload.holdToken)

local responseEntries = {}
for i = 1, categoryCount do
	local inventoryKey = KEYS[i]
	local entry = payload.entries[i]
	local available = tonumber(redis.call('HGET', inventoryKey, 'available') or '0')
	local pending = tonumber(redis.call('HGET', inventoryKey, 'pending') or '0')
	local total = tonumber(redis.call('HGET', inventoryKey, 'total') or '0')
	responseEntries[i] = {
		categoryId = entry.categoryId,
		available = available,
		pending = pending,
		total = total
	}
end

return cjson.encode({
	success = true,
	holdToken = payload.holdToken,
	expiresAt = payload.expiresAtIso,
	expiresAtEpoch = payload.expiresAtEpoch,
	entries = responseEntries
})
`;

export const CLAIM_HOLD_LUA = `
local holdKey = KEYS[1]
local payload = cjson.decode(ARGV[1])

if redis.call('EXISTS', holdKey) == 0 then
	return cjson.encode({ success = false, error = 'HOLD_NOT_FOUND' })
end

local status = redis.call('HGET', holdKey, 'status')
local expiresAtEpoch = tonumber(redis.call('HGET', holdKey, 'expiresAtEpoch') or '0')

if status ~= 'held' then
	return cjson.encode({ success = false, error = 'HOLD_NOT_ACTIVE', status = status })
end

if expiresAtEpoch <= payload.nowEpoch then
	return cjson.encode({ success = false, error = 'HOLD_EXPIRED' })
end

redis.call('HSET', holdKey, 'status', payload.nextStatus)
redis.call('HSET', holdKey, 'orderReference', payload.orderReference or '')
if payload.extendTtlSeconds and payload.extendTtlSeconds > 0 then
	redis.call('EXPIRE', holdKey, payload.extendTtlSeconds)
end

local response = {
	success = true,
	entries = cjson.decode(redis.call('HGET', holdKey, 'entries')),
	expiresAtEpoch = expiresAtEpoch,
	expiresAt = redis.call('HGET', holdKey, 'expiresAt')
}

return cjson.encode(response)
`;

export const RELEASE_HOLD_LUA = `
local categoryCount = tonumber(ARGV[2])
local payload = cjson.decode(ARGV[1])
local holdKeyIndex = categoryCount + 1
local expirationSetIndex = categoryCount + 2
local holdKey = KEYS[holdKeyIndex]
local expirationSetKey = KEYS[expirationSetIndex]

if redis.call('EXISTS', holdKey) == 0 then
	return cjson.encode({ success = false, error = 'HOLD_NOT_FOUND' })
end

local currentStatus = redis.call('HGET', holdKey, 'status')
if currentStatus ~= 'held' then
	return cjson.encode({ success = false, error = 'HOLD_NOT_RELEASABLE', status = currentStatus })
end

local holdEntries = cjson.decode(redis.call('HGET', holdKey, 'entries'))
for i = 1, categoryCount do
	local inventoryKey = KEYS[i]
	local entry = holdEntries[i]
	local quantity = tonumber(entry.quantity)
	redis.call('HINCRBY', inventoryKey, 'pending', -quantity)
	redis.call('HINCRBY', inventoryKey, 'available', quantity)
	redis.call('HINCRBY', inventoryKey, 'version', 1)
end

redis.call('HSET', holdKey, 'status', payload.releaseStatus)
redis.call('HSET', holdKey, 'releasedAt', payload.releasedAtIso)
redis.call('HSET', holdKey, 'releaseReason', payload.reason or '')
redis.call('PERSIST', holdKey)
redis.call('EXPIRE', holdKey, payload.retainSeconds)
redis.call('ZREM', expirationSetKey, payload.holdToken)

return cjson.encode({ success = true, holdToken = payload.holdToken })
`;

export const FINALIZE_HOLD_LUA = `
local categoryCount = tonumber(ARGV[2])
local payload = cjson.decode(ARGV[1])
local holdKeyIndex = categoryCount + 1
local expirationSetIndex = categoryCount + 2
local holdKey = KEYS[holdKeyIndex]
local expirationSetKey = KEYS[expirationSetIndex]

if redis.call('EXISTS', holdKey) == 0 then
	return cjson.encode({ success = false, error = 'HOLD_NOT_FOUND' })
end

local currentStatus = redis.call('HGET', holdKey, 'status')
if currentStatus ~= 'checkout_pending' and currentStatus ~= 'checkout_committed' then
	return cjson.encode({ success = false, error = 'HOLD_NOT_FINALIZABLE', status = currentStatus })
end

local holdEntries = cjson.decode(redis.call('HGET', holdKey, 'entries'))
for i = 1, categoryCount do
	local inventoryKey = KEYS[i]
	local entry = holdEntries[i]
	local quantity = tonumber(entry.quantity)
	redis.call('HINCRBY', inventoryKey, 'pending', -quantity)
	redis.call('HINCRBY', inventoryKey, 'sold', quantity)
	redis.call('HINCRBY', inventoryKey, 'version', 1)
end

redis.call('HSET', holdKey, 'status', 'finalized')
redis.call('HSET', holdKey, 'finalizedAt', payload.finalizedAtIso)
redis.call('HSET', holdKey, 'orderId', payload.orderId)
redis.call('HSET', holdKey, 'paymentReference', payload.paymentReference or '')
redis.call('PERSIST', holdKey)
redis.call('EXPIRE', holdKey, payload.retainSeconds)
redis.call('ZREM', expirationSetKey, payload.holdToken)

return cjson.encode({ success = true, holdToken = payload.holdToken })
`;