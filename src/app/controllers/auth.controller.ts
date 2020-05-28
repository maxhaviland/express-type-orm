import { Request, Response } from 'express'
import { getRepository } from 'typeorm';
import { User } from '../entity/User'
import { validate } from '../../services/validate';
import { generateHash, compareHash } from '../../services/bcrypt'
import { generateToken, authConfig } from '../../config/auth'
import { response } from '../../services/response'

export const authenticated = async (req: Request, res: Response): Promise<Response> => {
  const { login, password } = req.body;

  if (!login)
    return res.status(400).json(response.error({ error: 'Login is empty', code: 400 }))

  if (!password)
    return res.status(400).json(response.error({ error: 'Password is empty', code: 400 }))

  try {
    const user: any = await getRepository(User)
      .createQueryBuilder('user')
      .select(['user', 'user.password', 'user.firstAccess', 'user.username'])
      .where('user.email = :email', { email: login })
      .orWhere('user.username = :username', { username: login })
      .getOne();

    if (!user)
      return res.status(404).json(response.error({ error: 'User not found', code: 404 }))

    const { id, firstName, lastName, sex, dateOfBirth, isActive, firstAccess } = user;

    const userPasswordIsCorrect: boolean = await compareHash(password, user.password);

    if (!userPasswordIsCorrect)
      return res.status(401).json(response.error({ error: 'Password incorrect', code: 401 }))

    if (!isActive && !firstAccess) {
      const merge = getRepository(User).merge({ ...user, isActive: true });

      await getRepository(User).save(merge)

      const tokenJWT: Object = await generateToken({ id: user?.id, username: user?.username })

      return res.status(200).json(response.auth({ user: user, token: tokenJWT, code: 200 }))
    }

    if (!isActive)
      return res.status(412).json(response.error({ error: 'Account disabled', code: 412 }))

    if (user?.firstAccess) {
      const merge = getRepository(User).merge({ ...user, firstAccess: false });
      await getRepository(User).save(merge)
    }
    
    const tokenJWT: Object = generateToken({ id: user?.id, username: user?.username })
    return res.status(200).json(response.auth({ user: undefined , token: tokenJWT }))

  } catch (e) { return res.status(500).json() }
}

export const requestAccountActivation = async (req: Request, res: Response): Promise<Response> => {
  const { login } = req.body;

  if (!login)
    return res.status(400).json(response.validateError({ error: 'The request body cannot be empty', code: 400 }))

  try {
    const result: any = await getRepository(User)
      .createQueryBuilder('user')
      .select(['user.id', 'user.requestToken', 'user.timeRequestToken', 'user.isActive'])
      .where('user.email = :email', { email: login })
      .orWhere('user.username = :username', { username: login })
      .getOne();

    if (!result)
      return res.status(404).json(response.error({ error: 'user not found', code: 404 }))

    if (result?.isActive)
      return res.status(403).json(response.error({ error: 'Account is already activated', code: 403 }))

    const timeRequestToken = new Date();
    timeRequestToken.setHours(timeRequestToken.getHours() + 8)

    const hash = `${result?.id}${authConfig.secret}`

    const requestToken: any = await generateHash(hash);

    const merge = getRepository(User).merge({ ...result, requestToken, timeRequestToken });

    await getRepository(User).save(merge);

    return res.status(200).json(response.auth({ user: undefined, token: requestToken, code: 200 }))
  } catch (e) { return res.status(500).json() }
}

export const activateAccount = async (req: Request, res: Response): Promise<Response> => {
  const { token } = req.query;
  if (!token)
    return res.status(400).json(response.validateError({ error: 'The token was not informed in the query', code: 400 }))

  try {
    const result: any = await getRepository(User)
      .createQueryBuilder('user')
      .select(['user', 'user.requestToken', 'user.timeRequestToken', 'user.isActive'])
      .where('user.requestToken = :requestToken', { requestToken: token })
      .getOne();

    if (!result)
      return res.status(400).json(response.error({ error: 'Invalid token', code: 400 }))

    const { id, firstName, lastName, sex, requestToken, dateOfBirth, timeRequestToken } = result;

    const now = new Date();
    now.setHours(now.getHours())

    if (now > timeRequestToken)
      return res.status(401).json(response.error({ error: 'Expired token', code: 401 }))

    const tokenIsValid: string = `${id}${authConfig.secret}`
    const tokenIsCorrect: boolean = await compareHash(tokenIsValid, result?.requestToken)

    if (!tokenIsCorrect)
      return res.status(401).json(response.error({ error: 'Invalid token', code: 401 }))

    const merge = getRepository(User).merge({ ...result, requestToken: null, timeRequestToken: null, isActive: true });

    await getRepository(User).save(merge);

    const tokenJWT: Object = await generateToken({ id: result?.id })

    return res.status(200).json(response.auth({
      user: {
        id, firstName, lastName, sex, requestToken, dateOfBirth
      }, token: tokenJWT
    }))

  }
  catch (e) { return res.status(500).json() }
}

export const disableAccount = async (req: Request, res: Response): Promise<Response> => {
  const { id, password } = req.body;
  if (!id)
    return res.status(400).json(response.error({ error: 'The id was not sent in the request body', code: 400 }))

  if (!Number(id))
    return res.status(400).json(response.validateError({ error: 'Invalid id', code: 400 }))

  if (!password)
    return res.status(400).json(response.error({ error: 'The password was not sent in the request body', code: 400 }))
  
  try {
    const user: any = await getRepository(User)
      .createQueryBuilder('user')
      .select(['user', 'user.password'])
      .where('user.id = :id', { id })
      .getOne();

    if (!user)
      return res.status(404).json(response.error({ error: 'User not found', code: 404 }))

    const { isActive } = user;

    if (!isActive)
      return res.status(401).json(response.error({ error: 'account already disabled', code: 401 }))

    const passwordIsCorrect: boolean = await compareHash(password, user.password)

    if (!passwordIsCorrect)
      return res.status(401).json(response.error({ error: 'Password incorrect', code: 401 }))

    const merge = getRepository(User).merge({ ...user, isActive: false })
    await getRepository(User).save(merge);

    return res.status(200).json(response.validateSuccess({ message: 'Account disabled', code: 200 }))

  } catch (e) { return res.status(500).json() }
}

export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
  const { login } = req.body;

  if (!login) {
    return res.status(400).json(response.validateError({ error: `Request body is empty`, code: 400 }));
  }
  try {
    const result: any = await getRepository(User)
      .createQueryBuilder('user')
      .select(['user.id', 'user.requestToken', 'user.timeRequestToken', 'user.isActive'])
      .where('user.email = :email', { email: login })
      .orWhere('user.username = :username', { username: login })
      .getOne();

    if (!result)
      return res.status(404).json(response.error({ error: 'user not found', code: 404 }))

    const timeRequestToken = new Date();
    timeRequestToken.setHours(timeRequestToken.getHours() + 8)

    const hash = `${result?.id}${authConfig.secret}`

    const requestToken: any = await generateHash(hash);

    const merge = getRepository(User).merge({ ...result, requestToken, timeRequestToken });

    await getRepository(User).save(merge);

    return res.status(200).json(response.auth({ user: undefined, token: requestToken, code: 200 }))
  } catch (e) { return res.status(500).json() }
}

export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  const { token } = req.query;
  const { password } = req.body;

  if (!token)
    return res.status(400).json(response.validateError({ error: 'The token was not informed in the query', code: 400 }))

  if (!password)
    return res.status(400).json(response.validateError({ error: 'Password request body is empty', code: 400 }))

  const passwordIsValid = [
    await validate.basic('password', password, 8, 100, true, true)
  ].filter(errors => errors)

  if (passwordIsValid.length)
    return res.status(400).json(response.validateError({ error: passwordIsValid, code: 400 }))

  try {
    const result: any = await getRepository(User)
      .createQueryBuilder('user')
      .select(['user', 'user.requestToken', 'user.timeRequestToken', 'user.isActive'])
      .where('user.requestToken = :requestToken', { requestToken: token })
      .getOne();

    if (!result)
      return res.status(400).json(response.error({ error: 'Invalid token', code: 400 }))

    const { id, timeRequestToken } = result;

    const now = new Date();
    now.setHours(now.getHours())

    if (now > timeRequestToken)
      return res.status(401).json(response.error({ error: 'Expired token', code: 401 }))

    const tokenIsValid: string = `${id}${authConfig.secret}`
    const tokenIsCorrect: boolean = await compareHash(tokenIsValid, result?.requestToken)

    if (!tokenIsCorrect)
      return res.status(401).json(response.error({ error: 'Invalid token', code: 401 }))

    const newPassword: string = await generateHash(password)
    const merge = getRepository(User).merge({ ...result, requestToken: null, timeRequestToken: null, password: newPassword });

    await getRepository(User).save(merge);

    return res.status(200).json(response.validateSuccess({ message: 'password reset successfully', code: 200 }));

  }
  catch (e) { return res.status(500).json() }
}