
const memoryStore = global.__MAUMCARD_STORE__ || (global.__MAUMCARD_STORE__ = new Map());

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

function makeId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 12; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

exports.handler = async function(event) {

  if (event.httpMethod === 'OPTIONS') {
    return json(200, { ok: true });
  }

  if (event.httpMethod === 'POST') {
    try {

      const data = JSON.parse(event.body || '{}');

      const id = makeId();

      memoryStore.set(id, {
        ...data,
        _savedAt: new Date().toISOString()
      });

      return json(200, {
        ok: true,
        id,
        cardUrl: `https://maumcard.netlify.app/card.html?id=${id}`,
        detailUrl: `https://maumcard.netlify.app/view.html?id=${id}`
      });

    } catch (e) {

      return json(500, {
        ok: false,
        error: e.message
      });

    }
  }

  if (event.httpMethod === 'GET') {
    try {

      const id = event.queryStringParameters?.id;

      if (!id) {
        return json(400, {
          ok: false,
          error: 'Missing id'
        });
      }

      const saved = memoryStore.get(id);

      if (!saved) {
        return json(404, {
          ok: false,
          error: 'Card not found'
        });
      }

      return json(200, {
        ok: true,
        data: saved
      });

    } catch (e) {

      return json(500, {
        ok: false,
        error: e.message
      });

    }
  }

  return json(405, {
    ok: false,
    error: 'Method not allowed'
  });

};
