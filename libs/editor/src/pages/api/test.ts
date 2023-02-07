import type { NextApiRequest, NextApiResponse } from 'next';

// import RequestContext from '../../common/request-context';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // const context = RequestContext.detach(req);

  // debugger;

  res.status(200).json({ name: 'John Doee', });
}
