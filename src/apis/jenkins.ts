'use strict'

export class Jenkins {
  postBuild(uri: string) {
    return fetch(uri, {
      method: 'post'
    }).then(resp => {
      if (resp.ok) {
        return resp.json()
      }else {
        return Promise.reject(resp)
      }
    })
  }
}

export default new Jenkins()
