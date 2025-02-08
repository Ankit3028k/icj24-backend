import express from 'express';
import { userRegister, userLogin, userLogout, getAllUsers, userDelete } from '../Route-contorller/authrouteController.js';

const router = express.Router();

router.get('/users', getAllUsers);
router.post('/register', userRegister);
router.post('/login', userLogin);
router.post('/logout', userLogout);
router.delete('/users/:id',userDelete);

export default router;
 