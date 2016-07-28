'use strict'
const config = require('config')

const USER = config.remote.USER
const PORT = config.remote.PORT
const HOST = config.remote.HOST
const OVERWRITE = true
const NOCHDIR = true
const FILTERS = [
  '+ config',
  '+ config**',
  '+ package.json',
  '+ lib',
  '+ lib**',
  '+ pm2',
  '+ pm2**',
  '- **'
]

sneaky('release', function () {
  let path = `/app/Cassanova`

  this.user = USER
  this.port = PORT
  this.host = HOST
  this.filter = FILTERS.join('\n')
  this.overwrite = OVERWRITE
  this.nochdir = NOCHDIR

  this.description = `Deploy Cassanova`
  this.path = path
  this.before([
    'npm run build'
  ].join(' && '))
  this.after([
    `cd ${path}/source`,
    'npm install --production'
  ].join(' && '))
})
