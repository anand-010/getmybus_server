var http = require('http');
var url = require('url');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var q = url.parse(req.url, true).query;
//   var txt = q.name[0] + " " + q.name[1];
var txt = q.watpoints;
var nameArr = txt.split(';');
  res.end(nameArr[0]);
}).listen(8080);
