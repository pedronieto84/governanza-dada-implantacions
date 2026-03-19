const http = require('http');
const port = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.end('Hola desde testapp!');
});
server.listen(port, () => {
  console.log(`testapp escuchando en puerto ${port}`);
});
