import { body, header } from 'express-validator';

export const registerValidator = [
  header('client-id').exists().withMessage('client id is isrequred').bail()
    .isString().withMessage('client id must be string').bail()
    .notEmpty().withMessage('client id cannot be empty'),
  body('mobile').isMobilePhone('zh-CN'),
  body('nickName').isLength({ min: 2 }),
  body('password').isLength({ min: 6 }),
];

export const loginValidator = [
  header('client-id').exists().withMessage('client id is isrequred').bail()
    .isString().withMessage('client id must be string').bail()
    .notEmpty().withMessage('client id cannot be empty'),
  body('mobile').isMobilePhone('zh-CN'),
  body('type').isIn(['phone', 'sms', 'qrcode']),
  body('password')
    .if(body('type').equals('phone'))
    .isLength({ min: 6 }),
  body('smsCode')
    .if(body('type').equals('sms'))
    .isLength({ min: 4, max: 6 }),
  // body('qrcodeToken')
  //   .if(body('type').equals('qrcode'))
  //   .isLength({ min: 10 }),
];

export const sendSmsValidator = [
  header('client-id').exists().withMessage('client id is isrequred').bail()
    .isString().withMessage('client id must be string').bail()
    .notEmpty().withMessage('client id cannot be empty'),
  body('mobile').isMobilePhone('zh-CN'),
];

export const refreshTokenValidator = [
  header('client-id').exists().withMessage('client id is isrequred').bail()
    .isString().withMessage('client id must be string').bail()
    .notEmpty().withMessage('client id cannot be empty'),
  body('accountId').exists().withMessage('accountId is required').bail()
    .isString().withMessage('accountId must be string').bail()
    .notEmpty().withMessage('accountId cannot be empty'),
  body('refreshToken').exists().withMessage('refreshToken is required').bail()
    .isString().withMessage('refreshToken must be string').bail()
    .notEmpty().withMessage('refreshToken cannot be empty'),
];

export const logoutValidator = [
  header('client-id').exists().withMessage('client id is isrequred').bail()
    .isString().withMessage('client id must be string').bail()
    .notEmpty().withMessage('client id cannot be empty')
];

