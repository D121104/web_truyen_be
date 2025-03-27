const bcrypt = require('bcryptjs')
const saltRounds = 10

export const hashPasswordHelper = async (password: string) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds)
    return await bcrypt.hash(password, salt)
  } catch (error) {
    console.log('Error in hashPassword: ', error)
    throw new Error('Error in hashPassword')
  }
}

export const comparePasswordHelper = async (
  password: string,
  hashedPassword: string
) => {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.log('Error in comparePassword: ', error)
    throw new Error('Error in comparePassword')
  }
}
