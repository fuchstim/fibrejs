import type { Request } from 'express';
import type { NextApiRequest } from 'next';

import type { TRequestContext } from '../types/common';

const CONTEXT_KEY = '__requestContext';

class RequestContext {
  detach(request: Request | NextApiRequest): TRequestContext {
    const context = Reflect.get(request, CONTEXT_KEY) as TRequestContext | undefined;
    if (!context) {
      throw new Error('Failed to get context from request');
    }

    return context;
  }

  attach(request: Request, context: TRequestContext) {
    Reflect.defineProperty(
      request,
      CONTEXT_KEY,
      { value: context, }
    );
  }
}

export default new RequestContext();
