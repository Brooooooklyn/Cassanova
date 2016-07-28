import * as Koa from 'koa'
import * as Router from 'koa-router'

const koaRouter = new Router()

const routerMap = new Map()
const routerSet = new Set()

koaRouter.options('*', async (ctx: Router.IRouterContext, next: any) => {
  ctx.status = 200
  ctx.res.setHeader('Allow', 'GET,PUT,DELETE,POST,OPTIONS')
  await next()
})

export type ValidType = 'get' | 'post' | 'put' | 'delete'

export function router(config: {
  path: string
  method: ValidType
} | string): Function {
  if (typeof config === 'string') {
    return function(target: any) {
      routerMap.set(target, config)
    }
  }else {
    return function(target: any, key: string, desc: PropertyDescriptor) {
      let path = config['path']
      const method = config['method']
      routerSet.add(() => {
        const constructor = target.constructor
        const parentPath = routerMap.get(constructor)
        if (typeof parentPath !== 'undefined') {
          path = parentPath + path
        }
        koaRouter[method](path, async (ctx: Router.IRouterContext, next: any) => {
          let result: any
          try {
            result = await desc.value.call(this, ctx, next)
          }catch (e) {
            console.error(e)
            ctx.throw(400, e)
          }
          return result
        })
      })
    }
  }
}

export function setRouters(app: Koa, RouterClass: any[]): void {
  RouterClass.forEach(Router => {
    return new Router()
  })

  routerSet.forEach(Func => {
    Func()
  })

  app.use(koaRouter.routes())

  app.use(async (ctx) => {
    ctx.res.setHeader('Access-Control-Allow-Origin', ctx.request.header.origin || '*')
    ctx.res.setHeader('Access-Control-Allow-Credentials', 'true')
    ctx.res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
    ctx.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, AUTHORIZATION, X-Socket-Id')
  })
}
