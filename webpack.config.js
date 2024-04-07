const path = require('path');

module.exports = {
  mode: 'production', // Set mode to 'production' or 'development'
  entry: './app.js', // Entry point of your application
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'bundle.js' // Output filename
  },
  target: 'node', // Set target to 'node'
  externalsPresets: { node: true }, // Exclude Node.js core modules
//   errorDetails: true
};