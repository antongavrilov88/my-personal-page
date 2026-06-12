import { makeRouteHandler } from '@keystatic/next/route-handler';
import config from '../../../../../keystatic.config';

// Same guard as src/app/keystatic/layout.tsx: in v1 (local storage mode) the
// admin — including its API — must not be reachable on production deploys.
const adminDisabled = process.env.NODE_ENV === 'production' && process.env.KEYSTATIC_ENABLED !== 'true';

const handler = makeRouteHandler({ config });

export async function GET(req: Request) {
  if (adminDisabled) return new Response(null, { status: 404 });
  return handler.GET(req);
}

export async function POST(req: Request) {
  if (adminDisabled) return new Response(null, { status: 404 });
  return handler.POST(req);
}
