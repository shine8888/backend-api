import { decode } from '../utils/jwt';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from './statusHandler';
import { ACCESS_TOKEN_EXPIRED, NO_TOKEN_PROVIDED } from '../constants/Message';

/**
 * Verify the token when user query
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from headers
    const token = req.headers['authorization']?.split(' ')[1];

    // Check if there is no token
    if (!token) return errorHandler({ message: NO_TOKEN_PROVIDED }, res);

    // Decode token
    const decoded = decode(token, process.env.REGISTER_KEY || '');

    // Check is token is valid
    if (!decoded.valid)
      return errorHandler({ message: ACCESS_TOKEN_EXPIRED }, res);

    next();
  } catch (error) {
    throw error;
  }
};
