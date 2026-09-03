const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const DEFAULT_PORT = 3100;
const configuredPort = Number.parseInt(process.env.PORT, 10);
const port = Number.isInteger(configuredPort) && configuredPort > 0 && configuredPort <= 65535
  ? configuredPort
  : DEFAULT_PORT;

module.exports = {
  port,
};
