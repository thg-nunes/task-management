import jwt from 'jsonwebtoken'

export const createJWT = (
  payload: string | object | Buffer,
  options?: jwt.SignOptions,
) => {
  return jwt.sign(payload, process.env.JWT_SECRET, options)
}
