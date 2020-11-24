const path = require('path');
const gateway = require('express-gateway');
require('../Borger/borger');
require('../Bank/bank');
require('../Skat/skat');

gateway()
  .load(path.join(__dirname, 'config'))
  .run();
