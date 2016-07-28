'use strict'
import { MemberFetch, MemberSchema, setAPIHost } from 'teambition-sdk'
import { redis } from '../utils/redis'
import { forEach } from 'lodash'
import { Observable } from 'rxjs'
const config = require('config')

export class Teambition {

  async getMemberInProject(projectId: string, email: string) {
    let members: MemberSchema[] = await redis.get(`${config.redisPrefix}-project:members/${projectId}`).then((res: string) => JSON.parse(res))
    let result: string
    if (members && members.length) {
      result = this._filterMember(members, email)
      if (result) {
        return result
      }
    }
    members = await MemberFetch.getProjectMembers(projectId)
    await redis.set(`${config.redisPrefix}-project:members/${projectId}`, JSON.stringify(members))
    result = this._filterMember(members, email)
    return result
  }

  private _filterMember(members: MemberSchema[], email: string) {
    let result: string
    forEach(members, member => {
      if (member.email === email) {
        result = member._id
        return false
      }else {
        return true
      }
    })
    return result
  }

}

export default new Teambition()
