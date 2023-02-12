import { Application, NextFunction, Request, Response } from 'express';
import { ERequestMethod, IService } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerService(app: Application, path: string, service: IService<any>) {
  const cleanPath = path.endsWith('/') ? path.slice(0, path.length -1) : path;

  const createHandler = (method: ERequestMethod) => async (req: Request, res: Response, next: NextFunction) => {
    const getResult = {
      [ERequestMethod.FIND]: () => service.find?.apply(service, [ { req, res, }, ]),
      [ERequestMethod.GET]: () => service.get?.apply(service, [ req.params.__id, { req, res, }, ]),
      [ERequestMethod.CREATE]: () => service.create?.apply(service, [ req.body, { req, res, }, ]),
      [ERequestMethod.PATCH]: () => service.patch?.apply(service, [ req.params.__id, req.body, { req, res, }, ]),
    }[method];

    await Promise.resolve(getResult())
      .then(result => {
        if (result == null) {
          res.status(404);
          res.json({ message: 'Not Found', });

          return;
        }

        res.json(result);
      })
      .catch(error => {
        res.status(500);
        res.json({ message: error.message, stack: error.stack, });
      });
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
  };

  const activeConfigs = Object.values(ERequestMethod)
    .filter(method => !!service[method])
    .map(method => handlerConfigs[method]);

  activeConfigs.forEach(config => {
    switch (config.method) {
      case 'get': return app.get(config.path, config.handler);
      case 'post': return app.post(config.path, config.handler);
      case 'patch': return app.patch(config.path, config.handler);
      default: return null;
    }
  });
}
