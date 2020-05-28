import { Router } from 'express';
import * as post from '../app/controllers/post.controller';

const router = Router()

router.get('/meupau/:username', post.showDetais);

router.get('/', post.showAll);
router.get('/:id', post.show);

router.post('/:user', post.create);
router.post('/like/:id', post.likePost);
router.post('/comment/:post', post.comment);
router.post('/like/comment/:id', post.likeComment);

router.put('/:id', post.update);
router.put('/comment/:id', post.commentUpdate);

router.delete('/:id', post.destroy);
router.delete('/comment/:id', post.commentDestroy);



export default router;