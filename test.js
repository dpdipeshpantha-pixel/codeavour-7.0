const fs = require('fs');

try {
  require('./admin.js');
  console.log("No syntax error.");
} catch (e) {
  console.error("Syntax Error Details:");
  console.error(e.message);
  console.error(e.stack);
}
