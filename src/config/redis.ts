import { createClient } from 'redis'
import 'dotenv/config'

const redisClient = createClient({
  url: "redis://localhost:6379",
})

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err)
})

redisClient.connect()

export default redisClient
