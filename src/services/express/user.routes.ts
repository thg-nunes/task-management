import path from 'path'
import multer from 'multer'
import fs from 'fs/promises'
import { Router } from 'express'

import { prisma } from '../prisma'

import { badRequest } from '@utils/http/bad-request'
import { serverError } from '@utils/http/server-error'

const userRoutes = Router()
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    )
    const mimetype = filetypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    }

    cb(new Error('Apenas arquivos jpeg, jpg e png são permitidos!'))
  },
})

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
  user_id,
}: {
  user_id: string
  filename: string
  mimetype: string
  data: Buffer
}) {
  try {
    const avatarAlreadyExists = await prisma.avatar.findFirst({
      where: { user_id },
    })

    if (avatarAlreadyExists) {
      return await prisma.avatar.update({ data: { data }, where: { user_id } })
    }

    const avatar = await prisma.avatar.create({
      data: { filename, mimetype, data, user_id },
      select: {
        data: true,
        filename: true,
        mimetype: true,
        user_id: true,
      },
    })

    return avatar
  } catch (error) {
    throw new Error(`Erro ao fazer upload do arquivo: ${error}`)
  }
}

userRoutes.get('/avatar/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params

    const avatar = await prisma.avatar.findFirst({
      where: { user_id },
      select: { mimetype: true, data: true },
    })

    if (!avatar) return

    res.setHeader('Content-Type', avatar.mimetype)
    res.send(avatar.data)
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar o arquivo' })
  }
})

/** Rota responsável por fazer o upload do avatar do usuário */
userRoutes.post('/upload', upload.single('file'), async (req, res) => {
  const user_id = req.headers.user_id as string

  // @ts-ignore - o file é adicionado o objeto de request pelo multer, por isso vai existir
  if (!req.file) badRequest({ res, message: 'Nenhum arquivo enviado.' })

  if (!req.headers.user_id)
    badRequest({ res, message: 'O id do usuário é obrigatório.' })

  // @ts-ignore - o file é adicionado o objeto de request pelo multer, por isso vai existir
  const { originalname, mimetype, destination, filename } = req.file

  try {
    // Lê o conteúdo do arquivo do sistema de arquivos
    const binaryAvatar = await fs.readFile(`${destination}/${filename}`)

    // Salva o arquivo no banco de dados
    const avatar = await uploadAvatar({
      user_id,
      mimetype,
      data: binaryAvatar,
      filename: originalname,
    })

    // Remove o arquivo temporario do server
    await fs.unlink(`${destination}/${filename}`)

    return res
      .status(200)
      .json({ message: 'Arquivo enviado com sucesso', user_id: avatar.user_id })
  } catch (error) {
    serverError({ res, message: 'Erro ao fazer upload do arquivo' })
  }
})

export { userRoutes }
