import jwt from 'jsonwebtoken'

import { UserIsLoggedIn } from '@schema/users/types'
import { AppError } from './appError'

export const createJWT = (
  payload: string | object | Buffer,
  options?: jwt.SignOptions,
) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '3d',
    ...options,
  })
}

export const returnsTokenAndRefreshToken = (cookie: string = '') => {
  const tokens = cookie.split('; ')
  let auth_token: string, refresh_token: string

  tokens.forEach((token) => {
    if (token.startsWith('authToken=')) {
      auth_token = token.split('=')[1]
    } else if (token.startsWith('refresh_token=')) {
      refresh_token = token.split('=')[1]
    }
  })

  return { auth_token, refresh_token }
}

export const userIsAuthenticated = (cookie: string = '') => {
  const { auth_token } = returnsTokenAndRefreshToken(cookie)

  try {
    const payload = jwt.verify(auth_token, process.env.JWT_SECRET, {
      ignoreExpiration: false,
    }) as UserIsLoggedIn

    return payload
  } catch (error) {
    throw new AppError('User_id é necessário.', 'FORBIDDEN')
  }
}
