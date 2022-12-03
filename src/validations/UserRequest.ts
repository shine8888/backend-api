import Joi from 'joi';
import { mongoObjectId, uuidv4 } from './CustomValidation';

export const registerUser = {
  body: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

export const loginUser = {
  body: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

export const generateAccessToken = {
  body: Joi.object({
    refreshToken: Joi.alternatives(uuidv4).required(),
  }),
};

export const deposit = {
  body: Joi.object({
    amount: Joi.number().required(),
    userId: Joi.alternatives(mongoObjectId).required(),
  }),
};

export const withdrawal = {
  body: Joi.object({
    amount: Joi.number().required(),
    userId: Joi.alternatives(mongoObjectId).required(),
  }),
};

export const getPortfolio = {
  params: Joi.object({
    userId: Joi.alternatives(mongoObjectId).required(),
  }),
};
