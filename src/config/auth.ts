require('dotenv').config()
import {sign} from 'jsonwebtoken';

export const authConfig = {
  secret: String(process.env.API_SECRET_KEY)
}

export const generateToken = (payload: Object) => {
  return sign({payload}, authConfig.secret, {expiresIn: 86400})
}