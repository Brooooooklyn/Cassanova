const config = require('config')

export const clientId = config.clientId
export const clientSecret = config.clientSecret

export function getAccessToken (authCode: string): Promise<any> {
  return fetch('https://account.teambition.com/oauth2/access_token', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'post',
    body: `client_id=${clientId}&client_secret=${clientSecret}&code=${authCode}&grant_type=code`
  })
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        return response.json()
      } else {
        return Promise.reject(response)
      }
    })
}
