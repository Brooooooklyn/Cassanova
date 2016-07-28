# Cassanova

A bridge that conjunction Teambition & Gitlab & Jenkins

## usage
```bash
mkdir config
touch config/default.json
```

```json
{
  "accountHost": "https://account.teambition.com",
  "email": "your cassanova teambition account",
  "password": "your cassanova teambition password",
  "redis": {
    "your ioredis init config"
  },
  "redisPrefix": "cassanova.redis",
  "jenkins": {
    "host": "your jenkins host"
  },
  "web2": {
    "repo config"
  },
  "repoMap": {
    "your gitlab ssh url: git@xxx.xxx.git": {
      "repoIndex": "web2",
      "master": [ "teambition user id" ],
      "projectId": "teambition projectId",
      "tasklistId": "teambition tasklistId",
      "members": [ "teambition user ids" ]
    }
  },
  "remote": {
    "your sneaky deploy config"
  }
}
```

## sneaky

[homepage](https://github.com/teambition/sneaky)

## teambition apis docs
[wiki](http://docs.teambition.com/wiki/oauth2)

## teambition appstores
[appstore](https://www.teambition.com/appstore/)
