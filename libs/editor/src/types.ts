import type { Types } from '@tripwire/engine';
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
  user: TAuthenticatedUser
};

type TCRUDService<T> = {
  [ERequestMethod.FIND]: {
    'PAYLOAD': never,
    'RESULT': T[]
  }
  [ERequestMethod.GET]: {
    'PAYLOAD': never,
    'RESULT': T
  }
  [ERequestMethod.CREATE]: {
    'PAYLOAD': Omit<T, 'id'>,
    'RESULT': T
  }
  [ERequestMethod.PATCH]: {
    'PAYLOAD': T,
    'RESULT': T
  }
  [ERequestMethod.DELETE]: {
    'PAYLOAD': never,
    'RESULT': T
  }
};

export type ICRUDService<T> = IService<TCRUDService<T>>;

export interface IService<T extends Record<ERequestMethod, Record<'PAYLOAD' | 'RESULT', unknown>>> {
  [ERequestMethod.FIND]?: (context: TContext) => Promise<T[ERequestMethod.FIND]['RESULT'] | void> | T[ERequestMethod.FIND]['RESULT'] | void,
  [ERequestMethod.GET]?: (id: string, context: TContext) => Promise<T[ERequestMethod.GET]['RESULT'] | void> | T[ERequestMethod.GET]['RESULT'] | void,
  [ERequestMethod.CREATE]?: (data: T[ERequestMethod.CREATE]['PAYLOAD'], context: TContext) => Promise<T[ERequestMethod.CREATE]['RESULT'] | void> | T[ERequestMethod.CREATE]['RESULT'] | void,
  [ERequestMethod.PATCH]?: (id: string, data: T[ERequestMethod.PATCH]['PAYLOAD'], context: TContext) => Promise<T[ERequestMethod.PATCH]['RESULT'] | void> | T[ERequestMethod.PATCH]['RESULT'] | void,
  [ERequestMethod.DELETE]?: (id: string, context: TContext) => Promise<T[ERequestMethod.DELETE]['RESULT'] | void> | T[ERequestMethod.DELETE]['RESULT'] | void,
}

export type TAuthenticatedUser = {
  id: string,
  name: string,
  avatarUrl?: string,
};

export type TPreviewRuleServicePayload = {
  config: Types.Config.TRuleConfig,
  inputs: Record<string, unknown>
};
