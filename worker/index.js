const PASSWORD_HASH = '9a0006e03ef51caa741dc8412bb01e83d7ef606b65f3bbb9807c508977e7e918';
const GITHUB_API    = 'https://api.github.com/repos/BigDadies-55/My-Rest/contents';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Auth',
};

function json(body, status = 200) {
  return new Response(body, {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const authHash = request.headers.get('X-Admin-Auth');
    if (!authHash || authHash !== PASSWORD_HASH) {
      return json(JSON.stringify({ error: 'Unauthorized' }), 401);
    }

    const url       = new URL(request.url);
    const githubUrl = `${GITHUB_API}${url.pathname}`;
    const body      = request.method !== 'GET' ? await request.text() : undefined;

    const githubRes = await fetch(githubUrl, {
      method:  request.method,
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Content-Type':  'application/json',
        'User-Agent':    'My-Rest-Worker',
      },
      body,
    });

    const resBody = await githubRes.text();
    return new Response(resBody, {
      status:  githubRes.status,
      headers: {
        ...CORS,
        'Content-Type': githubRes.headers.get('Content-Type') || 'application/json',
      },
    });
  },
};
