import { Request, Response } from 'express'
import { getRepository, getManager } from 'typeorm';
import { Post } from '../entity/Post';
import { User } from '../entity/User';
import { Comment } from '../entity/Comment';
import { LikePost } from '../entity/LikePost';
import { LikeComment } from '../entity/LikeComment';
import { response } from '../../services/response';
import { validate } from '../../services/validate'

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  try {
    const posts = await getRepository(Post).findOne(id)

    if (!posts)
      return res.status(404).send(response.error({ error: 'user posts not found', code: 404 }));

    return res.status(200).send(posts)


  } catch (e) { return res.send(500) }

}


export const showAll = async (req: Request, res: Response): Promise<Response> => {

  try {
    const posts = await getRepository(Post).find({
      order: {id: "DESC"}
    })

    if (!posts)
      return res.status(404).send(response.error({ error: 'user posts not found', code: 404 }));

    return res.status(200).send(posts)

  } catch (e) { return res.send(500) }
}


export const create = async (req: Request, res: Response): Promise<Response> => {
  const user = new User()
  user.setId(Number(req.params.user))

  const post = req.body.post;
  try {
    const userExists = await getRepository(User).findOne(user, {
      select: ['id', 'username', 'firstName', 'lastName']
    })

    if (!userExists)
      return res.status(404).send(response.error({ error: 'user not found', code: 404 }))

    const errorMessage: string = await validate.basic('post', post, 1, 250, true, true);

    if (errorMessage)
      return res.status(400).send(response.validateError({ error: errorMessage, code: 400 }))

    const newPost = await getRepository(Post).save({ user, post })

    return res.status(201).send({ ...newPost, user: userExists, updateDate: undefined })

  } catch (e) { return res.status(500) }
}


export const update = async (req: Request, res: Response): Promise<Response> => {
  const id = Number(req.params.id);
  const { user, post } = req.body;
  try {
    if (!user)
      return res.status(400).send(response.error({ error: 'User Required in the body', code: 400 }))

    if (!post)
      return res.status(400).send(response.error({ error: 'Post Required in the body', code: 400 }))

    const postExists = await getRepository(Post).findOne(id, { select: ['id'] })
    const postIsTheUser = await getRepository(Post).findOne({
      where: { id, user },
      select: ['id']
    })

    if (!postExists)
      return res.status(404).send(response.error({ error: 'Post not found', code: 404 }))

    if (!postIsTheUser)
      return res.status(403).send(response.error({ error: 'Unauthorized', code: 403 }))

    const errorMessage: string = await validate.basic('post', post, 1, 250, true, true);

    if (errorMessage)
      return res.status(400).send(response.validateError({ error: errorMessage, code: 400 }))

    await getRepository(Post).save({ id, post })

    return res.status(201).send(response.validateSuccess({
      message: 'Post created successfully',
      code: 201
    }))

  } catch (e) { return res.status(500) }
}

export const destroy = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { user } = req.body
  try {

    if (!user)
      return res.status(400).send(response.error({ error: 'User Required in the body', code: 400 }))

    const postExists = await getRepository(Post).findOne(id, { select: ['id'] });

    const postIsTheUser = await getRepository(Post).findOne({
      where: { id, user }
    })

    if (!postExists)
      return res.status(404).send(response.error({ error: 'Post not found', code: 404 }));

    if (!postIsTheUser)
      return res.status(403).send(response.error({ error: 'Unauthorized', code: 403 }));

    await getRepository(Post).delete(id);
    return res.status(200).send(response.validateSuccess({
      message: 'Post deleted successfully',
      code: 200
    }));

  } catch (e) { return res.status(500) }

}

export const comment = async (req: Request, res: Response): Promise<Response> => {
  const post = Number(req.params.post);
  const { comment, user } = req.body;

  if (!comment)
    return res.status(400).send(response.error({ error: 'Comment Required in the body', code: 400 }))

  if (!user)
    return res.status(400).send(response.error({ error: 'User Required in the body', code: 400 }))

  try {
    const postExists = await getRepository(Post).findOne(post, { select: ['id'] });
    const userExists = await getRepository(User).findOne(user, { select: ['id'] });

    if (!postExists)
      return res.status(404).send(response.validateError({ error: 'Post not found', code: 404 }))

    if (!userExists)
      return res.status(404).send(response.validateError({ error: 'User not found', code: 404 }))

    const errorMessage: string = await validate.basic('comment', comment, 1, 250, true, true);

    if (errorMessage)
      return res.status(400).send(response.validateError({ error: errorMessage, code: 400 }))

    const newComment = await getRepository(Comment).save({ post, user, comment });

    return res.status(200).send(newComment)

  } catch (e) { return res.status(500) }
}

export const commentUpdate = async (req: Request, res: Response): Promise<Response> => {
  const id = Number(req.params.id);
  const { comment, user, post } = req.body;

  if (!comment)
    return res.status(400).send(response.error({ error: 'Comment Required in the body', code: 400 }))

  if (!user)
    return res.status(400).send(response.error({ error: 'User Required in the body', code: 400 }))

  if (!post)
    return res.status(400).send(response.error({ error: 'Post Required in the body', code: 400 }))

  try {
    const postExists = await getRepository(Post).findOne(post, { select: ['id'] });
    const userExists = await getRepository(User).findOne(user, { select: ['id'] });
    const commentExists = await getRepository(Comment).findOne(id, { select: ['id'] });

    if (!commentExists)
      return res.status(404).send(response.validateError({ error: 'Comment not found', code: 404 }));

    if (!postExists)
      return res.status(404).send(response.validateError({ error: 'Post not found', code: 404 }));

    if (!userExists)
      return res.status(404).send(response.validateError({ error: 'User not found', code: 404 }));

    const commentIsFromTheUser = await getRepository(Comment).findOne({
      select: ['id'],
      where: { user, post, id }
    });

    if (!commentIsFromTheUser)
      return res.status(403).send(response.error({ error: 'Unauthorized', code: 403 }));

    const errorMessage: string = await validate.basic('comment', comment, 1, 250, true, true);

    if (errorMessage)
      return res.status(400).send(response.validateError({ error: errorMessage, code: 400 }));

    const newComment = await getRepository(Comment).save({ id, comment });

    return res.status(200).send(newComment);

  } catch (e) { return res.status(500) }

}

export const commentDestroy = async (req: Request, res: Response): Promise<Response> => {
  const id = Number(req.params.id);
  const { user, post } = req.body;

  if (!user)
    return res.status(400).send(response.error({ error: 'User Required in the body', code: 400 }));

  if (!post)
    return res.status(400).send(response.error({ error: 'Post Required in the body', code: 400 }));

  try {
    const postExists = await getRepository(Post).findOne(post, { select: ['id'] });
    const userExists = await getRepository(User).findOne(user, { select: ['id'] });
    const commentExists = await getRepository(Comment).findOne(id, { select: ['id'] });

    if (!commentExists)
      return res.status(404).send(response.validateError({ error: 'Comment not found', code: 404 }));

    if (!postExists)
      return res.status(404).send(response.validateError({ error: 'Post not found', code: 404 }));

    if (!userExists)
      return res.status(404).send(response.validateError({ error: 'User not found', code: 404 }));

    const commentIsFromTheUser = await getRepository(Comment).findOne({
      select: ['id'],
      where: { user, post, id },
    });

    const postIsTheUser = await getRepository(Post).findOne({
      select: ['id'],
      where: { id: post, user },
    });

    if (commentIsFromTheUser || postIsTheUser) {
      await getRepository(Comment).delete(id);
      return res.status(200).send(response.validateSuccess({
        message: 'Comment deleted successfully',
        code: 200
      }));
    }
    return res.status(403).send(response.error({ error: 'Unauthorized', code: 403 }));

  } catch (e) { return res.status(500) }
}

export const likePost = async (req: Request, res: Response) => {
  const post = Number(req.params.id);
  const { user } = req.body;

  try {
    if (!user)
      return res.status(400).send(response.error({ error: 'User Required in the body', code: 400 }))

    const postExists = await getRepository(Post).findOne(post, { select: ['id'] });
    console.log(postExists)

    if (!postExists)
      return res.status(404).send(response.error({ error: 'Post not found', code: 404 }));

    const likeExists = await getRepository(LikePost).findOne({
      select: ['id'],
      where: { post, user }
    })

    if (likeExists) {
      await getRepository(LikePost).delete(likeExists);
      return res.status(200).send(response.validateSuccess({ message: 'Like removed', code: 200 }))
    }

    const like = await getRepository(LikePost).save({ post, user });
    return res.status(201).send(like)

  } catch (e) { return res.send({ e }) }


}


export const likeComment = async (req: Request, res: Response) => {
  const comment = Number(req.params.id);
  const { user } = req.body;

  try {
    if (!user)
      return res.status(400).send(response.error({ error: 'User Required in the body', code: 400 }))

    const commentExists = await getRepository(Comment).findOne(comment, { select: ['id'] });

    if (!commentExists)
      return res.status(404).send(response.error({ error: 'Comment not found', code: 404 }));

    const likeExists = await getRepository(LikeComment).findOne({
      select: ['id'],
      where: { comment, user }
    })

    if (likeExists) {
      await getRepository(LikeComment).delete(likeExists);
      return res.status(200).send(response.validateSuccess({ message: 'Like removed', code: 200 }))
    }

    const like = await getRepository(LikeComment).save({ comment, user });
    return res.status(201).send(like)

  } catch (e) { return res.send({ e }) }


}

export const showDetais = async (req: Request, res: Response): Promise<Response> => {
  const { username } = req.params
  try {
    const posts: any = await getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.posts", "post")
    .leftJoinAndSelect("post.likes", "likePost")
    .leftJoinAndSelect("post.comments", "comment")
    .leftJoinAndSelect("comment.likes", "likeComment")
    .where('user.username = :username', {username})
    .orderBy({'post.id': 'DESC'})
    .getMany();


    return res.status(200).send(posts);
  } catch (e) { return res.send({ e }) }

}
