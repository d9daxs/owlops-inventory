/* OwlOps Inventory — production proxy + static server
   ------------------------------------------------------------------
   Why this exists:
     The OwlOps Public API has no CORS headers, so a browser cannot call
     it directly. This tiny Node server:
       1) serves the static app (index.html)
       2) exposes a same-origin /api/* proxy that injects the API key
          server-side and adds CORS headers.
     The API key is therefore NEVER shipped to the browser.

   Run locally:    npm start            (defaults: PORT 8080, key below)
   Custom key:     API_KEY=owlk_xxx npm start
   On Render/Railway/Fly/etc.: they set PORT automatically — just deploy.
*/
const http  = require("http");
const https = require("https");
const fs    = require("fs");
const path  = require("path");
const { URL } = require("url");

const PORT     = process.env.PORT || 8080;
const API_KEY  = process.env.API_KEY || "owlk_6oQwhlI8gzw9_8y4RD7V8acEcz-JIOrPyBigAgFuYkE";
const UPSTREAM = process.env.UPSTREAM ||
  "https://api-owlops-public-bugrb4gxeqcghqh5.eastus2-01.azurewebsites.net";

const MIME = { ".html":"text/html; charset=utf-8", ".js":"application/javascript",
               ".css":"text/css", ".json":"application/json", ".svg":"image/svg+xml",
               ".ico":"image/x-icon" };

function cors(res){
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Accept,X-Api-Key");
}

function proxy(res, apiPath){
  const target = new URL(UPSTREAM.replace(/\/+$/,"") + apiPath);
  const upReq = https.request(target,
    { method:"GET", headers:{ "X-Api-Key":API_KEY, "Accept":"application/json" } },
    upRes=>{
      cors(res);
      res.writeHead(upRes.statusCode, { "Content-Type":"application/json" });
      upRes.pipe(res);
    });
  upReq.on("error", err=>{
    cors(res);
    res.writeHead(502, {"Content-Type":"application/json"});
    res.end(JSON.stringify({ error:"Proxy failed to reach upstream", detail:String(err) }));
  });
  upReq.end();
}

const server = http.createServer((req, res)=>{
  const u = new URL(req.url, `http://localhost:${PORT}`);

  if(req.method === "OPTIONS"){ cors(res); res.writeHead(204); return res.end(); }

  // health check (useful for hosts)
  if(u.pathname === "/healthz"){ res.writeHead(200, {"Content-Type":"text/plain"}); return res.end("ok"); }

  // /api/v1/inventory...  ->  UPSTREAM/v1/inventory...
  if(u.pathname.startsWith("/api/")){
    return proxy(res, u.pathname.replace(/^\/api/, "") + (u.search || ""));
  }

  // static files (default index.html)
  let file = u.pathname === "/" ? "/index.html" : u.pathname;
  const fp = path.join(__dirname, path.normalize(file).replace(/^(\.\.[/\\])+/, ""));
  fs.readFile(fp, (err, data)=>{
    if(err){ res.writeHead(404, {"Content-Type":"text/plain"}); return res.end("Not found"); }
    res.writeHead(200, {"Content-Type": MIME[path.extname(fp)] || "application/octet-stream"});
    res.end(data);
  });
});

server.listen(PORT, ()=> console.log(`OwlOps app + proxy listening on :${PORT}  (upstream ${UPSTREAM})`));
