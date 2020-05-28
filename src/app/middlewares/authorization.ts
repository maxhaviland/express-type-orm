import {Request, Response, NextFunction} from 'express'
import {verify} from 'jsonwebtoken'
import {authConfig} from '../../config/auth'


const authorization = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if(!authHeader) return res.status(401).json({error: 'No token provided'})

  const parts = authHeader.split(' ');  

  if (parts.length !== 2) return res.status(401).json({error: 'Token error'})

  const [ scheme, token ] = parts;

  if (!/^Bearer$/i.test(scheme)) return res.status(401).json({error: 'Token malformatted'})  

  verify(token, authConfig.secret, (err, decoded: any) => {
    if (err) return res.status(401).send({error: 'Token invalid'})
    req.headers.userId =  decoded.id;
    return next()
  })
}

export default authorization;
