import express from 'express';
import * as controller from '../../controllers/userControllers/user.controllers';
import { verifyToken } from '../../middlewares/authJwt';
import { validate } from 'express-validation';
import {
  deposit,
  generateAccessToken,
  getPortfolio,
  loginUser,
  registerUser,
  withdrawal,
} from '../../validations/UserRequest';

const router = express.Router();

router.route('/register').post(validate(registerUser), controller.register);

router.route('/login').post(validate(loginUser), controller.login);

router
  .route('/access-token')
  .post(validate(generateAccessToken), controller.getAccessToken);

router
  .route('/deposit')
  .post(validate(deposit), verifyToken, controller.deposit);

router
  .route('/withdrawl')
  .post(validate(withdrawal), verifyToken, controller.withdrawal);

router
  .route('/:userId/portfolio')
  .get(validate(getPortfolio), verifyToken, controller.getMyPortfolios);

export default router;
