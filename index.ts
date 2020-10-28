import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import * as fs from 'fs';
import * as p from 'path';
import * as url from 'url';

const server = http.createServer();
const publicDir = p.resolve(__dirname, 'public');
let cacheAge = 3600 * 24 * 365;

server.on('request', (req: IncomingMessage, res: ServerResponse) => {
  const { url: path, method } = req;
  const { pathname } = url.parse(path);
  if (method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'text/plain;charset=UTF-8');
    res.end('非法请求');
    return;
  }
  const fileName = pathname.substring(1) || 'index.html';
  fs.readFile(p.resolve(publicDir, fileName), (err, data) => {
    if (err) {
      console.log(err);
      if (err.errno === -4058) {
        fs.readFile(p.resolve(publicDir, '404.html'), (err, data) => {
          res.statusCode = 404;
          res.end(data);
        });
      } else if (err.errno === -4068) {
        res.statusCode = 403;
        res.end('No authority.');
      } else {
        res.statusCode = 500;
        res.end('Server done!');
      }
      return;
    }
    res.setHeader('Cache-Control', `public, max-age=${cacheAge}`);
    res.end(data);
  });
});

server.listen(9898, () => {

});