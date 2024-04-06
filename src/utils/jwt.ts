import jwt from 'jsonwebtoken'

import { UserIsLoggedIn } from '@schema/users/types'

export const createJWT = (
  payload: string | object | Buffer,
  options?: jwt.SignOptions,
) => {
  return jwt.sign(payload, process.env.JWT_SECRET, options)
}

export const userIsAuthenticated = (cookie: string) => {
  const [auth_token, refresh_token] = cookie.split('; ')

  const payload = jwt.verify(
    auth_token.split('=')[1],
    process.env.JWT_SECRET,
    // { Desativar só quando tiver a lógica de refresh token no front-end, pq aí vai lançar um erro, e o client vai ser responsavel por criar a fila de req e atualizar o token em cada uma delas
    //   ignoreExpiration: false,
    // },
  ) as UserIsLoggedIn

  return payload
}
