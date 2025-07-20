import { UserPayload } from '../common';

declare global {
  namespace Express {
    interface Request {
      user: UserPayload;
    }
  }
}
