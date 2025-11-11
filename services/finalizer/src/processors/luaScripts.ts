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
