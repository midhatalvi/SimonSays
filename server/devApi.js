// Run the same server handlers locally that Vercel uses in production.
export function localApi() {
  return {
    name: 'local-simon-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0];
        if (!['/api/tavily', '/api/elevenlabs'].includes(path)) return next();
        res.status = code => { res.statusCode = code; return res; };
        res.json = body => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); };
        res.send = body => res.end(body);
        try {
          let body = '';
          for await (const chunk of req) {
            body += chunk;
            if (body.length > 16384) return res.status(413).json({ error: 'Request too large.' });
          }
          try { req.body = body ? JSON.parse(body) : {}; }
          catch { return res.status(400).json({ error: 'Invalid JSON.' }); }
          const handler = path === '/api/tavily'
            ? (await import('./tavily/index.js')).default
            : (await import('./elevenlabs/index.js')).default;
          await handler(req, res);
        } catch {
          if (!res.writableEnded) res.status(503).json({ error: 'Service unavailable. Please continue with the on-screen controls.' });
        }
      });
    },
  };
}
