import multer from 'multer'
import fs from 'fs/promises'
import { Router } from 'express'

import { prisma } from '../prisma'

import { badRequest } from '@utils/http/bad-request'
import { serverError } from '@utils/http/server-error'
import { ApolloServer } from '@apollo/server'

const userRoutes = Router()
const upload = multer({ dest: 'uploads/' })

/**
 * @async
 * @function uploadAvatar - função responsável por criar o arquivo de avatar na base
 * de dados
 * @param {Buffer} uploadAvatar.data - o buffer resultante da leitura do arquivo enviado
 * @param {string} uploadAvatar.filename - nome do arquivo enviado
 * @param {string} uploadAvatar.mimetype - tipo do arquivo enviado
 * @param {string} uploadAvatar.user_email - email do usuário atualmente logado no sistema,
 * usado para fazer o relacionamento de avatar com usuário
 */
async function uploadAvatar({
  data,
  filename,
  mimetype,
  user_email,
}: {
  user_email: string
  filename: string
  mimetype: string
  data: Buffer
}) {
  try {
    const avatar = await prisma.avatar.create({
      data: { filename, mimetype, data, user_email },
      select: {
        data: true,
        filename: true,
        mimetype: true,
      },
    })

    return avatar
  } catch (error) {
    throw new Error(`Erro ao fazer upload do arquivo: ${error}`)
  }
}

/** Rota responsável por fazer o upload do avatar do usuário */
userRoutes.post('/upload', upload.single('file'), async (req, res) => {
  const user_email = req.headers.email as string

  // @ts-ignore - o file é adicionado o objeto de request pelo multer, por isso vai existir
  if (!req.file) badRequest({ res, message: 'Nenhum arquivo enviado.' })

  if (!req.headers.email)
    badRequest({ res, message: 'O email do usuário é obrigatório.' })

  // @ts-ignore - o file é adicionado o objeto de request pelo multer, por isso vai existir
  const { originalname, mimetype, destination, filename } = req.file

  try {
    // Lê o conteúdo do arquivo do sistema de arquivos
    const binaryAvatar = await fs.readFile(`${destination}/${filename}`)

    // Salva o arquivo no banco de dados
    const avatar = await uploadAvatar({
      user_email,
      mimetype,
      data: binaryAvatar,
      filename: originalname,
    })

    // Remove o arquivo temporario do server
    await fs.unlink(`${destination}/${filename}`)

    return res
      .status(200)
      .json({ message: 'Arquivo enviado com sucesso', avatar })
  } catch (error) {
    serverError({ res, message: 'Erro ao fazer upload do arquivo' })
  }
})

export { userRoutes }