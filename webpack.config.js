const VueLoaderPlugin = require('vue-loader/lib/plugin');
const path = require('path');
const merge = require('webpack-merge');

const config = {
    mode: "production",
    resolve: {
        extensions: ['.ts', '.js', '.vue', '.json']
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
                        // the "scss" and "sass" values for the lang attribute to the right configs here.
                        // other preprocessors should work out of the box, no loader config like this necessary.
                        'scss': 'vue-style-loader!css-loader!sass-loader',
                        'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
                    }
                    // other vue-loader options go here
                }
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                }
            },
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ]
};

module.exports = [
    merge(config, {
        externals: {
            'vue': 'vue',
            'chart.js': 'chart.js'
        },
        entry: path.resolve(__dirname + '/src/index.ts'),
        output: {
            filename: 'js/index.js',
            libraryTarget: 'umd',
            library: 'vueCharts',
            umdNamedDefine: true
        },
    }),
    merge(config, {
        externals: {
            'vue': 'Vue',
            'chart.js': 'Chart'
        },
        entry: path.resolve(__dirname + '/src/plugin.js'),
        output: {
            filename: 'js/vue-charts.min.js',
            libraryTarget: 'window',
            library: 'vueCharts'
        }
    })
];