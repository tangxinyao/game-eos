const path = require("path");

module.exports = {
    mode: "development",
    entry: {
        main: "./src/index.tsx"
    },
    output: {
        path: __dirname,
        filename: "dist/[name].bundle.js"
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        modules: [path.resolve(__dirname, "./src"), "node_modules"],
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "ts-loader" },

            // font-awesome
            { test: /\.(eot|svg|ttf|woff|woff2)\w*/, loader: 'url-loader' },

            { test: /\.css$/, use: ["style-loader", "css-loader"] },

            { test: /\.scss$/, use: ["style-loader", "css-loader", "sass-loader"] },

            { test: /\.(png|jpg|gif)$/, use: [{ loader: 'url-loader', options: { limit: 8192 } }] },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
    },

    devServer: {
        host: '0.0.0.0', 
        port: 8080,
        contentBase: __dirname,
        compress: true,
        historyApiFallback: true
    }
};