const path = require('node:path');
const express = require('express');

const { port } = require('./config/env');
const healthRouter = require('./routes/health.routes');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api', healthRouter);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Conecta Ofertas listening on port ${port}`);
  });
}

module.exports = app;
