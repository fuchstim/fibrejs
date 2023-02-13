import { Application, Request, Response } from 'express';
import { ERequestMethod, IService, TContext } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerService(app: Application, path: string, service: IService<any>) {
  const cleanPath = path.endsWith('/') ? path.slice(0, path.length -1) : path;

  const createHandler = (method: ERequestMethod) => async (req: Request, res: Response) => {
    const context: TContext = {
      req,
      res,
      user: res.locals.user,
    };

    const getResult = {
      [ERequestMethod.FIND]: () => service.find?.apply(service, [ context, ]),
      [ERequestMethod.GET]: () => service.get?.apply(service, [ req.params.__id, context, ]),
      [ERequestMethod.CREATE]: () => service.create?.apply(service, [ req.body, context, ]),
      [ERequestMethod.PATCH]: () => service.patch?.apply(service, [ req.params.__id, req.body, context, ]),
      [ERequestMethod.DELETE]: () => service.delete?.apply(service, [ req.params.__id, context, ]),
    }[method];

    try {
      const result = await Promise.resolve(getResult());
      if (result == null) {
        res.status(404);
        res.json({ message: 'Not Found', });

        return;
      }

      res.json(result);
    } catch (e: unknown) {
      const error = e as Error;

      res.status(500);
      res.json({ message: error.message, stack: error.stack, });
    }
  };

  const handlerConfigs = {
    [ERequestMethod.FIND]: {
      path: cleanPath,
      method: 'get',
      handler: createHandler(ERequestMethod.FIND),
    },
    [ERequestMethod.GET]: {
      path: cleanPath + '/:__id',
      method: 'get',
      handler: createHandler(ERequestMethod.GET),
    },
    [ERequestMethod.CREATE]: {
      path: cleanPath,
      method: 'post',
      handler: createHandler(ERequestMethod.CREATE),
    },
    [ERequestMethod.PATCH]: {
      path: cleanPath + '/:__id',
      method: 'patch',
      handler: createHandler(ERequestMethod.PATCH),
    },
    [ERequestMethod.DELETE]: {
      path: cleanPath + '/:__id',
      method: 'delete',
      handler: createHandler(ERequestMethod.DELETE),
    },
  };

  const activeConfigs = Object.values(ERequestMethod)
    .filter(method => !!service[method])
    .map(method => handlerConfigs[method]);

  activeConfigs.forEach(config => {
    switch (config.method) {
      case 'get': return app.get(config.path, config.handler);
      case 'post': return app.post(config.path, config.handler);
      case 'patch': return app.patch(config.path, config.handler);
      case 'delete': return app.delete(config.path, config.handler);
      default: return null;
    }
  });
}
