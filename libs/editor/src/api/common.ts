import { Application, NextFunction, Request, Response } from 'express';
import { ERequestMethod, IService } from '../types';

export function registerService(app: Application, path: string, service: IService) {
  const cleanPath = path.endsWith('/') ? path.slice(0, path.length -1) : path;

  const createHandler = (method: ERequestMethod) => async (req: Request, res: Response, next: NextFunction) => {
    const getResult = {
      [ERequestMethod.FIND]: () => service.find?.apply(service, [ { req, res, }, ]),
      [ERequestMethod.GET]: () => service.get?.apply(service, [ req.params.__id, { req, res, }, ]),
      [ERequestMethod.CREATE]: () => service.create?.apply(service, [ req.body, { req, res, }, ]),
    }[method];

    const result = await Promise.resolve(getResult());
    if (result == null) {
      res.status(404);
      res.json({ message: 'Not Found', });
    } else {
      res.json(result);
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
  };

  const activeConfigs = Object.values(ERequestMethod)
    .filter(method => !!service[method])
    .map(method => handlerConfigs[method]);

  activeConfigs.forEach(config => {
    switch (config.method) {
      case 'get': return app.get(config.path, config.handler);
      case 'post': return app.post(config.path, config.handler);
      default: return null;
    }
  });
}
