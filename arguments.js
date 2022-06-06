//
// Used when verifying contract on Polygonscan after deployment.
//

require('dotenv').config();


module.exports = [
  process.env.PROJECT_NAME,
  process.env.PROJECT_SYMBOL,
  process.env.ROYALTY_FRACTION,
];