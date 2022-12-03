import express from 'express';
import UserRoutes from './users/user';

const router = express.Router();

router.use('/users', UserRoutes);

export default router;
