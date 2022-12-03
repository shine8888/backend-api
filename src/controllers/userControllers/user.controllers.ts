import { Request, Response } from 'express';
import User from '../../models/Users';
import bcrypt from 'bcryptjs';
import { successHandler, errorHandler } from '../../middlewares/statusHandler';
import { pick } from 'lodash';
import httpStatus from 'http-status';
import {
  generateAndSaveRefreshToken,
  generateAccessToken,
} from '../../utils/generateToken';
import Token from '../../models/Token';
import mongooseConnection from '../../db/connect';
import path from 'path';
import dotenv from 'dotenv';
import {
  BALANCE_NOT_ENOUGH,
  GETTING_TOKEN_ERROR,
  LOGIN_ERROR,
  REFRESH_TOKEN_EXPIRED,
  REFRESH_TOKEN_NOT_EXISTED,
  REFRESH_TOKEN_REQUIRED,
  SERVER_ERROR,
  USER_EXISTED,
  USER_NOT_EXISTED,
} from '../../constants/Message';
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Register new user
 *
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get information from req body
    const { name, email, password } = req?.body;
    const user = await User.findOne({ email });

    // Check is user is existed
    if (user) return errorHandler({ message: USER_EXISTED }, res);

    // Hassing password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save new user
    await newUser.save();

    successHandler(
      res,
      httpStatus.OK,
      pick(newUser, ['_id', 'name', 'email', 'balance'])
    );
  } catch (error: any) {
    errorHandler(error, res);
  }
};

/**
 * Login
 *
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get email, password from req body
    const { email, password } = req.body;
    const user = await User.findOne({ email }).lean();

    // Check user is existed or not
    if (!user)
      return errorHandler(
        {
          message: LOGIN_ERROR,
        },
        res
      );
    // Compare password
    if (!bcrypt.compareSync(password, user.password))
      return errorHandler({ message: LOGIN_ERROR }, res);

    // Generate and save refresh token
    const refrToken = await generateAndSaveRefreshToken(
      user._id as unknown as string
    );

    successHandler(res, httpStatus.OK, {
      refreshToken: refrToken,
      accessToken: generateAccessToken(
        user.email,
        user.name,
        user._id as unknown as string
      ),
      userId: user._id,
    });
  } catch (error) {
    errorHandler(
      {
        message: SERVER_ERROR,
      },
      res
    );
  }
};

/**
 * Get refresh token when access token is expired
 *
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export const getAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get refresh token from req body
    const { refreshToken: requestToken } = req.body;

    // Check the refresh token
    if (!requestToken)
      return errorHandler({ message: REFRESH_TOKEN_REQUIRED }, res);

    // Find the refresh token in database
    const refreshToken = await Token.findOne({ token: requestToken }).lean();

    // Check refresh token exist
    if (!refreshToken)
      return errorHandler({ message: REFRESH_TOKEN_NOT_EXISTED }, res);

    // Check refresh token is expired or not
    if ((refreshToken.expiredDate || 0) < new Date().getTime()) {
      await Token.findByIdAndRemove(refreshToken._id, {
        useFindAndModify: false,
      }).exec();

      return errorHandler(
        {
          message: REFRESH_TOKEN_EXPIRED,
        },
        res
      );
    }

    // Generate new access token
    const user = await User.findOne({ _id: refreshToken.userId }).lean();

    if (!user) return errorHandler({ message: USER_NOT_EXISTED }, res);

    const accessToken = generateAccessToken(
      user.email,
      user.name,
      user._id as unknown as string
    );

    successHandler(res, httpStatus.OK, {
      accessToken,
    });
  } catch (error) {
    errorHandler({ message: GETTING_TOKEN_ERROR }, res);
  }
};

/**
 * This function for handle the process of trading token
 *
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export const deposit = async (req: Request, res: Response): Promise<void> => {
  // Get all data from req body
  const { amount, userId } = req.body;

  // Initialize the session for transaction
  const session = await mongooseConnection.startSession();
  session.startTransaction();

  try {
    // Query the user
    const user = await User.findOne({ _id: userId }).lean();

    // Check if the user is existed
    if (!user) return errorHandler({ message: USER_NOT_EXISTED }, res);

    // If existed, update balance of current user
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      {
        balance: user.balance + Number(amount),
      },
      { session, new: true }
    );

    // Commit the session transaction
    await session.commitTransaction();

    successHandler(
      res,
      httpStatus.OK,
      pick(updatedUser, ['_id', 'name', 'email', 'balance'])
    );
  } catch (error) {
    await session.commitTransaction();
  } finally {
    // End the session
    session.endSession();
  }
};

/**
 * This function for handle the process of trading token
 *
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export const withdrawal = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Get all data from req body
  const { amount, userId } = req.body;

  // Initialize the session for transaction
  const session = await mongooseConnection.startSession();
  session.startTransaction();

  try {
    // Query the user
    const user = await User.findOne({ _id: userId }).lean();

    // Check if the user is existed
    if (!user) return errorHandler({ message: USER_NOT_EXISTED }, res);

    // Check if withdrawal amount is enough
    if (user.balance < Number(amount))
      return errorHandler({ message: BALANCE_NOT_ENOUGH }, res);

    // If existed, update balance of current user
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      {
        balance: user.balance - Number(amount),
      },
      { session, new: true }
    );

    // Commit the session transaction
    await session.commitTransaction();

    successHandler(
      res,
      httpStatus.OK,
      pick(updatedUser, ['_id', 'name', 'email', 'balance'])
    );
  } catch (error) {
    await session.commitTransaction();
  } finally {
    // End the session
    session.endSession();
  }
};

/**
 * This function for handle the process of trading token
 *
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export const getMyPortfolios = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Get all data from req body
  const { userId } = req.params;

  // Query the user
  const user = await User.findOne({ _id: userId }).lean();

  // Check if user is not existed
  if (!user) return errorHandler({ message: USER_NOT_EXISTED }, res);

  successHandler(
    res,
    httpStatus.OK,
    pick(user, ['_id', 'name', 'email', 'balance'])
  );
};
