import { Response } from 'express'

/**
 * @function serverError - helper usado para lançar um server error
 * @param {Response} serverError.Response - objeto de resposta retornado pelo
 * próprio express
 * @param {string} [serverError.message] - mensagem opcional a ser retornada ao cliente,
 * se fornecida retorna a mensagem desejada, caso contrário retorna a mensagem default
 */
export const serverError = ({
  res,
  message = 'Error no servidor, tente a operação novamente mais tarde!',
}: {
  res: Response
  message?: string
}) => {
  return res.status(500).json({ message, type: 'BAD_REQUEST' })
}
