import 'isomorphic-fetch'
import { Fetch } from './utils/fetch'
import { redis } from './utils/redis'
const config = require('config')

export class OAuth {

  getCookie(): Promise<string> {
    const request = fetch(`${config.accountHost}/login`, {
      method: 'post',
      redirect: 'manual',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `email=${encodeURIComponent(config.email)}&password=${config.password}`
    }).then(resp => {
      return resp.headers
        .getAll('set-cookie')
        .map(val => val.split('; ')[0])
        .join(';')
    }).then(cookie => {
      console.log(cookie)
      if (cookie && typeof cookie === 'string') {
        redis.set(`${config.redisNamespace}-cookie`, cookie)
        return cookie
      }else {
        throw new Error(`cookie not vaild: ${cookie}`)
      }
    })
    const redisPromise: Promise<string> = redis.get(`${config.redisPrefix}-cookie`)
      .then((cookie: string): string | Promise<string> => {
        if (!cookie) {
          return request
        }else {
          return cookie
        }
      })
    return redisPromise
  }
}

export default new OAuth()
