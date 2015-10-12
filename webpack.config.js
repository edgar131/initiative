var webpack = require('webpack');
var path = require('path');

var args = {};
process.argv.forEach(function (val, index, array) {
    if(val.startsWith('--')){
        val = val.substring(2);
        args[val.split('=')[0]] = val.split('=')[1];
    }
});

module.exports = {
    context: path.join(__dirname, "/app"),
    entry: {
        app: ["angular", "./index.js"]
    },
    output: {
        path: "./dist",
        filename: "bundle.js"
    },
    resolve: {
        modulesDirectories: ["node_modules"]
    },
    devtool: "source-map",
    module: {
        loaders: [
            { test: /\angular-.*.js$/, loader: "imports?angular"},
            { test: /\.js$/, loader: 'imports?angular', include: /app/},
            { test: /\.tpl\.html$/, loader: "raw" },
            { test: /\.css$/, loader: "style!css" },
            { test: /\.less/, loader: "style!css!less" },
            { test: /\.svg$/, loader: "url" }
        ]
    }
};