import { NextFunction, Request, Response } from 'express';
import { TAuthenticatedUser } from './types';

export abstract class AuthenticationProvider {
  get middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = await Promise.resolve(this.getUser(req));

        res.locals.user = user;

        next();
      } catch (error) {
        const { message, } = error as Error;

        res.status(403);
        res.json({ message: `Authentication failed: ${message}`, });
      }
    };
  }

  abstract getUser(req: Request<unknown>): TAuthenticatedUser | Promise<TAuthenticatedUser>;
}

export default AuthenticationProvider;

export class AnonymousAuthenticationProvider extends AuthenticationProvider {
  override getUser(): TAuthenticatedUser {
    return {
      id: 'anonymous',
      name: 'Anonymous',
    };
  }
}

