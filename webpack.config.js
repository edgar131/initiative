const path = require('path');

/*var args = {};
process.argv.forEach(function (val, index, array) {
    if(val.startsWith('--')){
        val = val.substring(2);
        args[val.split('=')[0]] = val.split('=')[1];
    }
});*/

module.exports = {
    entry: "./app/index",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    },
    devtool: "source-map",
    resolveLoader: {
        modules: ["node_modules"]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: path.resolve(__dirname, 'node_modules/')
            },
            {
                test: /\.tpl\.html$/,
                use: 'raw-loader',
                exclude: path.resolve(__dirname, 'node_modules/')
            },
            {
                test: /\.json$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]'
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    {loader: 'style-loader'},
                    {loader: 'css-loader'}
                ]
            },
            {
                test: /\.less/,
                use: [
                    {loader: 'style-loader'},
                    {loader: 'css-loader'},
                    {loader: 'less-loader'}
                ]
            },
            {
                test: /\.svg$/,
                use: [{loader: 'url-loader'}]
            }
        ]
    }
};