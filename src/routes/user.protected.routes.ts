import { Router } from 'express';
import * as user from '../app/controllers/user.controller'
import * as auth from '../app/controllers/auth.controller'

const router = Router()

router.get('/:username/posts/', user.showUserPosts);

router.post('/disabled', auth.disableAccount)
router.post('/follow', user.followAndUnfollow)

router.put('/update/email/:id', user.updateEmail);
router.put('/user/:id', user.update);

router.delete('/users/:id', user.deleteUser);





export default router;