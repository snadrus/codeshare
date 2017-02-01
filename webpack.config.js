module.exports = {
    // configuration
    context: __dirname + "/node_modules/gaggle/lib",
    entry: "./gaggle.js",
    output: {
        path: __dirname ,
        filename: "gaggleBuilt.js"
    },
    node: {
      net: 'empty',
      tls: 'empty',
      dns: 'empty'
    }
};