import bcrypt from 'bcrypt'

export const passwordHash = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10)
}

type PasswordCompareHashParams = {
  password: string
  passwordHash: string
}

export const passwordCompareHash = async ({
  password,
  passwordHash,
}: PasswordCompareHashParams): Promise<boolean> => {
  return await bcrypt.compare(password, passwordHash)
}
