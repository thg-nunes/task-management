import { Response } from 'express'

/**
 * @function badRequest - helper usado para lançar um bad request
 * @param {Response} badRequest.Response - objeto de resposta retornado pelo
 * próprio express
 * @param {string} badRequest.message - mensagem a ser retornada ao cliente
 */
export const badRequest = ({
  res,
  message,
}: {
  res: Response
  message: string
}) => {
  return res.status(400).json({ message, type: 'BAD_REQUEST' })
}
