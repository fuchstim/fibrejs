import { Request, Response } from 'express';

export enum ERequestMethod {
  FIND = 'find',
  GET = 'get',
  CREATE = 'create',
  PATCH = 'patch'
}

export type TContext = {
  req: Request,
  res: Response,
};

export interface IService {
  [ERequestMethod.FIND]?: (context: TContext) => Promise<unknown> | unknown,
  [ERequestMethod.GET]?: (id: string, context: TContext) => Promise<unknown> | unknown,
  [ERequestMethod.CREATE]?: (data: unknown, context: TContext) => Promise<unknown> | unknown,
  [ERequestMethod.PATCH]?: (id: string, data: unknown, context: TContext) => Promise<unknown> | unknown,
}
