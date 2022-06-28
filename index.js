console.log(global);
const os = require('os')
console.log(os.type());
console.log(os.version());
console.log(os.platform());
console.log(os.hostname());
console.log(os.homedir());
console.log(__dirname);//directory name
console.log(__filename); //file name

const path = require('path')
console.log(path.dirname(__filename));
console.log(path.basename(__filename))
console.log(path.extname(__filename));

console.log(path.parse(__filename))

const maths = require('./math')

console.log(`${maths.add(1,1)} ${maths.sub(1,1)} ${maths.multiply(1,1)} ${maths.divide(1,1)}` );
