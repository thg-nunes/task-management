import jwt from 'jsonwebtoken'

import { UserIsLoggedIn } from '@schema/users/types'

export const createJWT = (
  payload: string | object | Buffer,
  options?: jwt.SignOptions,
) => {
  return jwt.sign(payload, process.env.JWT_SECRET, options)
}

export const userIsAuthenticated = (cookie: string = '') => {
  const tokens = cookie.split('; ')
  let auth_token: string, refresh_token: string

  tokens.forEach((token) => {
    if (token.startsWith('authToken=')) {
      auth_token = token.split('=')[1]
    } else if (token.startsWith('refresh_token=')) {
      refresh_token = token.split('=')[1]
    }
  })

  try {
    const payload = jwt.verify(
      auth_token,
      process.env.JWT_SECRET,
      // { Desativar só quando tiver a lógica de refresh token no front-end, pq aí vai lançar um erro, e o client vai ser responsavel por criar a fila de req e atualizar o token em cada uma delas
      //   ignoreExpiration: false,
      // },
    ) as UserIsLoggedIn

    return payload
  } catch (error) {
    return undefined
  }
}
