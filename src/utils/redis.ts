import * as Redis from 'ioredis'
const config = require('config')
export const redis = new Redis(config.redis)
