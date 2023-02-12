import { Request, Response } from 'express';

export enum ERequestMethod {
  FIND = 'find',
  GET = 'get',
  CREATE = 'create',
  PATCH = 'patch',
  DELETE = 'delete'
}

export type TContext = {
  req: Request,
  res: Response,
};

export interface IService<T> {
  [ERequestMethod.FIND]?: (context: TContext) => Promise<T[] | void> | T[] | void,
  [ERequestMethod.GET]?: (id: string, context: TContext) => Promise<T | void> | T | void,
  [ERequestMethod.CREATE]?: (data: T, context: TContext) => Promise<T | void> | T | void,
  [ERequestMethod.PATCH]?: (id: string, data: T, context: TContext) => Promise<T | void> | T | void,
  [ERequestMethod.DELETE]?: (id: string, context: TContext) => Promise<T | void> | T | void,
}
