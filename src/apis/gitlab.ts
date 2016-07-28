'use strict'
import { forEach } from 'lodash'
import OAuth from '../oauth'
import { TaskFetch, TasklistFetch, SubtaskFetch } from 'teambition-sdk'
import Teambition from './teambition'
const config = require('config')

export interface IGitlabEvent {
  object_kind: 'tag_push' | 'push'
  before: string
  after: string
  ref: string
  checkout_sha: string
  message: string
  user_id: number
  user_name: string
  user_email: string
  user_avatar: string
  project_id: number
  project: IProject
  commits: ICommit[]
  total_commits_count: number
  repository: IRepository
}

export interface IProject {
  name: string
  description: string
  web_url: string
  avatar_url: string
  git_ssh_url: string
  git_http_url: string
  namespace: string
  visibility_level: number
  path_with_namespace: string
  default_branch: string
  homepage: string
  url: string
  ssh_url: string
  http_url: string
}

export interface ICommit {
  id: string
  message: string
  timestamp: string
  url: string
  author: {
    name: string
    email: string
  }
  added: string[]
  modified: string[]
  removed: string[]
}

export interface IRepository {
  name: string
  url: string
  description: string
  homepage: string
  git_http_url: string
  git_ssh_url: string
  visibility_level: number
}

export class Gitlab {
  async TagEvent(event: IGitlabEvent): Promise<string> {
    const sshUrl = event.repository.git_ssh_url
    const rep = config.repoMap[sshUrl]
    if (rep) {
      const repIndex: string = rep.repoIndex
      const masters: string[] = rep.master
      const projectId = rep.projectId
      const email = event.user_email
      const memberId = await Teambition.getMemberInProject(projectId, email)
      if (memberId && masters.indexOf(memberId) === -1) {
        masters.push(memberId)
      }
      const tasklistId = rep.tasklistId
      const tasklist = await TasklistFetch.get(tasklistId)
      const refs = event.ref.split('/')
      const branch = refs.slice(2, refs.length).join('/')
      const task = await TaskFetch.create({
        _tasklistId: tasklistId,
        _stageId:tasklist.stageIds[0],
        content: `${event.repository.name} tag ${event.ref.split('/')[2]}`,
        involveMembers: masters
      })
      await TaskFetch.updateNote(task._id, this._buildTaskNote(event.project, branch, event.checkout_sha, event.commits))
      return `${config.jenkins.host}?token=${config.mobile.yunzhijia.mobileToken}`
    } else {
      return Promise.reject(new Error(`no repo info found, ssh_url: ${sshUrl}`))
    }
  }

  async pushEvent(event: IGitlabEvent): Promise<string> {
    const sshUrl = event.repository.git_ssh_url
    const rep = config.repoMap[sshUrl]
    if (rep) {
      const repIndex: string = rep.repoIndex
      const masters: string[] = rep.master
      const projectId = rep.projectId
      const email = event.user_email
      const memberId = await Teambition.getMemberInProject(projectId, email)
      if (memberId && masters.indexOf(memberId) === -1) {
        masters.push(memberId)
      }
      const tasklistId = rep.tasklistId
      const tasklist = await TasklistFetch.get(tasklistId)
      if (rep.members && rep.members.length) {
        forEach(rep.members, memberId => {
          if (masters.indexOf(memberId) === -1) {
            masters.push(memberId)
          }
        })
      }
      const refs = event.ref.split('/')
      const branch = refs.slice(2, refs.length).join('/')
      const task = await TaskFetch.create({
        _tasklistId: tasklistId,
        _stageId:tasklist.stageIds[0],
        _executorId: memberId,
        content: `${event.repository.name}, ${event.user_name} 在 ${branch} 的提交`,
        involveMembers: masters
      })
      await TaskFetch.updateNote(task._id, this._buildTaskNote(event.project, branch, event.checkout_sha, event.commits))
      if (repIndex === 'web2') {
        await Promise.all(rep.members.map((_memberId: string) => {
          if (memberId !== _memberId) {
            return SubtaskFetch.create({
              content: 'review 这个 commit 的改动',
              _taskId: task._id,
              _executorId: _memberId
            })
          }else {
            return Promise.resolve()
          }
        }))
      }
      return `${config.jenkins.host}?token=${config.mobile.yunzhijia.mobileToken}`
    } else {
      return Promise.reject(new Error(`no repo info found, ssh_url: ${sshUrl}`))
    }
  }

  private _buildTaskNote(project: IProject, branch: string, sha: string, commits: ICommit[]) {
    let result = ''
    forEach(commits, commit => {
      result += `author: ${commit.author.name},
*  [commit message: ${commit.message}](${project.homepage}/commit/${sha})

`
      if (commit.added && commit.added.length) {
        result += `*  added: `
        forEach(commit.added, added => {
          result += `[${added}](${project.homepage}/commit/${branch}/${added})`
        })
      }
      if (commit.modified && commit.modified.length) {
        result += `*  modified: `
        forEach(commit.modified, modified => {
          result += `[${modified}](${project.homepage}/blob/${branch}/${modified})`
        })
      }
      if (commit.removed && commit.removed.length) {
        result += `*  removed: `
        forEach(commit.removed, removed => {
          result += removed
        })
      }
    })
    return result
  }
}

export default new Gitlab()
