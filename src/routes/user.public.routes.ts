import { Router } from 'express';
import * as user from '../app/controllers/user.controller'
import * as auth from '../app/controllers/auth.controller'

const router = Router()

router.get('/username', user.usernameIsUsed);
router.get('/user/:username', user.show);
router.get('/email', user.emailIsUsed);
router.get('/users', user.showAll);

router.post('/user', user.create);
router.post('/authenticated' , auth.authenticated)
router.post('/activation', auth.requestAccountActivation)
router.post('/activate', auth.activateAccount)
router.post('/forgot', auth.forgotPassword);
router.post('/reset', auth.resetPassword);
router.post('/follow', user.followAndUnfollow)

export default router;