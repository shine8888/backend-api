import Joi from 'joi';

export const mongoObjectRegex = new RegExp(/^[0-9a-fA-F]{24}$/);

const mongoObjectId = Joi.string().regex(mongoObjectRegex, 'valid mongo id');

export const uuidRegex = new RegExp(
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
);

const uuidv4 = Joi.string().regex(uuidRegex, 'valid uuid');
export { mongoObjectId, uuidv4 };
