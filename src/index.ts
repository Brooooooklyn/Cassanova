import 'isomorphic-fetch'
import * as Koa from 'koa'
import { setRouters } from './decorators/router'
import { AppRouter } from './router'
import OAuth from './oauth'
import { setHeaders } from 'teambition-sdk'
const bodyParser = require('koa-bodyparser')

const app = new Koa()

app.use(bodyParser())

app.use(async (ctx, next) => {
  const cookie = await OAuth.getCookie()
    .catch(e => {
      console.error(e)
    })
  if (!cookie) {
    ctx.status = 500
    ctx.body = 'OAuth error'
  } else {
    setHeaders({
      cookie: cookie,
      Accept: 'application/json',
      referer: 'https://www.teambition.com/projects',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2809.0 Safari/537.36'
    })
  }
  next()
})

setRouters(app, [ AppRouter ])

app.listen(5010)

console.log('koa start in port: 5010')
