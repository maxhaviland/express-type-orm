import { getRepository } from 'typeorm';
import { User } from '../app/entity/User'

export const emailExists = async (email: string): Promise<boolean> => {
  const result = await getRepository(User)
    .createQueryBuilder('user')
    .where('user.email = :email', { email })
    .getOne()

  if (!result) return false
  else return true
}

export const usernameExists = async (username: string): Promise<boolean> => {
  const result = await getRepository(User)
    .createQueryBuilder('user')
    .where('user.username = :username', { username })
    .getOne()
  if (!result) return false
  else return true
}

export const query = {emailExists, usernameExists};