import 'express';
import { IAccountResponse } from '../../entities/accountEntity';

declare module 'express-serve-static-core' {
  interface Request {
    traceId?: string;
    user?: IAccountResponse;
  }
}