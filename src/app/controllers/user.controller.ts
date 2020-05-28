import { Request, Response } from 'express'
import { getRepository, createQueryBuilder } from 'typeorm';
import { User } from '../entity/User'
import { Follower } from '../entity/Follower'
import { generateHash, compareHash } from '../../services/bcrypt'
import { response } from '../../services/response'
import { validate } from '../../services/validate'
import { query } from '../../services/user.query'
import { authConfig } from '../../config/auth'
import { sendGrid } from '../../config/sendEmail'
import { template } from '../../templates/confirmarConta'

export const usernameIsUsed = async (req: Request, res: Response): Promise<any> => {
  const { username } = req.query;

  if (!username)
    return res.status(400).send(response.error({ error: 'Username not found in query', code: 400 }))

  const result = await query.usernameExists(String(username))

  if (result)
    return res.status(200).send(response.validateSuccess({ message: 'username is being used', code: 200 }))

  return res.status(200).send(response.validateSuccess({ message: 'username is not being used', code: 200 }))
}

export const emailIsUsed = async (req: Request, res: Response): Promise<any> => {
  const { email } = req.query;

  if (!email)
    return res.status(400).send(response.error({ error: 'Email not found in query', code: 400 }))

  const result = await query.emailExists(String(email))

  if (result)
    return res.status(200).send(response.validateSuccess({ message: 'Email is being used', code: 200 }))

  return res.status(200).send(response.validateSuccess({ message: 'Email is not being used', code: 200 }))
}

export const showAll = async (req: Request, res: Response): Promise<Response> => {

  try {
    const users = await getRepository(User).find({ where: { isActive: true }, order: { id: 'ASC' } })
    if (!users)
      return res.status(404).send(response.error({ error: 'Users not found', code: 404 }))

    return res.status(200).send(users);

  } catch (e) { return res.status(500).send(e) }

}

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { username } = req.params

  if (!username)
    return res.status(400).send(response.validateError({ error: 'id is empty', code: 400 }))

  try {
    const user = await getRepository(User).findOne({ where: { username, isActive: true } });

    if (!user)
      return res.status(404).send(response.error({ error: 'User not found', code: 404 }))

    return res.status(200).send(response.auth({ user, token: undefined, code: 200 }));

  } catch { return res.status(500).send() }

}

export const create = async (req: Request, res: Response): Promise<Response> => {
  const { firstName, lastName, email, username, password, dateOfBirth, sex } = req.body;

  const errors = {
    firstName: await validate.basic('firstName', firstName, 3, 50, false, false),
    lastName: await validate.basic('lastName', lastName, 3, 50, false, false),
    username: await validate.basic('username', username, 5, 50, false, true),
    password: await validate.basic('password', password, 8, 100, false, true),
    email: await validate.email(email),
    dateOfBirth: validate.date(dateOfBirth),
    sex: validate.sex('sex', sex),
  }

  const errorsLenth = Object.values(errors).filter(item => item).length

  if (errorsLenth)
    return res.status(400).send(response.error({ error: errors, code: 400 }));

  try {
    const hash: string = await generateHash(password);
    const newUser: any = await getRepository(User).create({ ...req.body, password: hash, sex: sex.toLowerCase() });
    const save = await getRepository(User).save(newUser);

    const timeRequestToken = new Date();
    timeRequestToken.setHours(timeRequestToken.getHours() + 8)

    const confirmAccountHash = `${save.id}${authConfig.secret}`
    const requestToken: any = await generateHash(confirmAccountHash);

    const merge = getRepository(User).merge({ ...newUser, requestToken, timeRequestToken });

    await getRepository(User).save(merge);

    const link = `http://localhost:3001/auth/activate?token=${requestToken}`

    const sendEmail = sendGrid.generate({
      to: email,
      from: 'test@test.com',
      subject: 'Seja welcomido',
      html: template,
      link: link
    })

    //sendGrid.send(sendEmail)

    return res.status(201).send(response.validateSuccess({ message: 'Account registered successfully', code: 201 }));
  } catch (e) { return res.status(500).send() }
}

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params
  const { firstName, lastName, username, email, sex, dateOfBirth, password } = req.body;

  if (!Number(id))
    return res.status(400).send(response.validateError({ error: 'Invalid id', code: 400 }))

  if (username)
    return res.status(400).send(response.validateError({ error: 'Cannot change username', code: 400 }))

  if (email)
    return res.status(400).send(response.validateError({ error: 'Cannot change username', code: 400 }))

  if (!password)
    return res.status(400).send(response.validateError({ error: 'Password is empty', code: 400 }))

  const errorMessage: Array<any> = [
    await validate.basic('firstName', firstName, 3, 50, false, false),
    await validate.basic('lastName', lastName, 3, 50, false, false),
    validate.date(dateOfBirth),
    validate.sex('sex', sex),
  ].filter(errors => errors);

  if (errorMessage.length)
    return res.status(400).send(response.validateError({ error: errorMessage, code: 400 }))

  try {
    const user: any = await getRepository(User)
      .createQueryBuilder('user')
      .select(['user', 'user.password'])
      .where('user.id = :id', { id: req.params.id })
      .getOne();

    if (!user)
      return res.status(404).send(response.error({ error: 'user not found', code: 404 }));

    const passwordIsValid: boolean = await compareHash(password, user.password);

    if (!passwordIsValid)
      return res.status(400).send(response.error({
        error: "password incorrect",
        code: 400
      }));



    const userUpdate = getRepository(User).merge({
      ...user,
      firstName,
      lastName,
      sex,
      dateOfBirth,
      password: undefined
    });
    await getRepository(User).save(userUpdate);
    return res.status(200).send(userUpdate)

  } catch (e) { return res.status(500) }
}

export const updateEmail = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { email, password } = req.body;

  if (!Number(id))
    return res.status(400).send(response.validateError({ error: 'Invalid id', code: 400 }))

  if (!email)
    return res.status(400).send(response.validateError({ error: 'Email request body is empty', code: 400 }))

  if (!password)
    return res.status(400).send(response.validateError({ error: 'Password request body is empty', code: 400 }))

  const emailIsValid: Array<any> = [
    await validate.email('email')
  ].filter(errors => errors)

  if (emailIsValid.length)
    return res.status(400).send(response.validateError({ error: emailIsValid, code: 400 }))

  try {
    const user: any = await getRepository(User)
      .createQueryBuilder('user')
      .select(['user', 'user.password'])
      .where('user.id = :id', { id })
      .getOne();

    if (!user)
      return res.status(404).send(response.error({ error: 'user not found', code: 404 }));

    const passwordIsCorrect: boolean = await compareHash(password, user.password);

    if (!passwordIsCorrect)
      return res.status(400).send(response.error({ error: 'Passowrd incorrect', code: 404 }));

    await getRepository(User).save({ ...user, email })

    return res.status(200).send(response.auth({ user: { email: email }, token: undefined, code: 200 }))

  } catch (e) { return res.status(500).send() }

}

export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  const removeUser = await getRepository(User).delete(req.params.id);
  return res.json(removeUser);
}

export const showUserPosts = async (req: Request, res: Response): Promise<Response> => {
  const { username } = req.params;
  const posts = await getRepository(User).find({
    relations: ['posts'],
    where: { username, isActive: true }
  })
  return res.send(posts)
}

export const followAndUnfollow = async (req: Request, res: Response) => {
  const { follower, followed } = req.body

  const followerId = await getRepository(Follower).find({
    select: ['id'],
    where: { follower, followed }
  })

  if (followerId.length) {
    await getRepository(Follower).delete((followerId[0]));
    return res.status(200).send(response.validateSuccess({ message: 'Unfollow successfully', code: 200 }))
  }
  const create = await getRepository(Follower).save(req.body);
  return res.send(create)
}
