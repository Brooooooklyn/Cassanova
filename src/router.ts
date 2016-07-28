import { IRouterContext } from 'koa-router'
import { router } from './decorators/router'
import { getAccessToken } from './apis/oauth'
import Gitlab from './apis/gitlab'
import Jenkins from './apis/jenkins'

@router('/api')
export class AppRouter {
  @router({
    path: '/access/:code',
    method: 'get'
  })
  async getAccess(ctx: IRouterContext, next: (...args: any[]) => Promise<any>) {
    const code = ctx.params.code
    let err: any
    const result = await getAccessToken(code).catch(e => {
      err = e
    })
    if (result) {
      ctx.body = result
    } else {
      ctx.status = 400
    }
    await next()
  }

  @router({
    path: '/gitlab/tag',
    method: 'post'
  })
  async gitlabTag(ctx: IRouterContext, next: (...args: any[]) => Promise<any>) {
    const message = ctx.request['body']
    if (message) {
      const uri = await Gitlab.TagEvent(message)
        .catch(e => {
          console.error(e)
        })
      ctx.body = 'hello'
    }else {
      ctx.body = 'no message'
      ctx.status = 400
    }
    await next()
  }

  @router({
    path: '/gitlab/push',
    method: 'post'
  })
  async gitlabPush(ctx: IRouterContext, next: (...args: any[]) => Promise<any>) {
    const message = ctx.request['body']
    if (message) {
      console.log('push message', JSON.stringify(message, null, 2))
      await Gitlab.pushEvent(message)
        .catch(e => {
          console.error(e)
        })
      ctx.body = 'hello'
    }else {
      ctx.body = 'no message'
      ctx.status = 400
    }
    await next()
  }
}
