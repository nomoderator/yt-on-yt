const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { DefinePlugin, optimize } = require('webpack');
const GenerateJsonFromJsPlugin = require('generate-json-from-js-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { join } = require('path');
const dotenv = require('dotenv');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlMinimizerPlugin = require('html-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const prodPlugins = [];
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  prodPlugins.push(new optimize.AggressiveMergingPlugin());
}

const Root = join(__dirname, '..');
const Source = join(Root, 'src');
const Dist = join(Root, 'dist');

const Assets = join(Source, 'assets');
const Content = join(Source, 'modules', 'content');

function getEntry(...pathNames) {
  return [
    join(Source, ...pathNames),
    ...(!isProd ? [`mv3-hot-reload/${pathNames.at(-1)}`] : []),
  ];
}

const config = {
  mode: process.env.NODE_ENV,
  target: 'web',
  devtool: isProd ? 'source-map' : 'cheap-module-source-map', // https://stackoverflow.com/a/49100966/1848466
  entry: {
    content: getEntry('modules', 'content'),
  },
  output: {
    path: join(__dirname, '../', 'dist'),
    filename: 'yt-on-yt-[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['babel-loader', 'ts-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              [
                '@babel/plugin-transform-react-jsx',
                // { "pragma":"h" }
              ],
            ],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'assets/[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      'process.env': JSON.stringify(
        dotenv.config({
          path: join(
            Root,
            `.env.${process.env.TARGET_ENV || process.env.NODE_ENV}`
          ),
        }).parsed
      ),
    }),
    new CopyPlugin({
      patterns: [
        {
          from: join(Assets, 'html'),
          to: 'assets/html',
        },
        {
          from: join(Assets, 'styles'),
          to: 'assets/styles',
          // transform: (content, path) => {
          //   return postcss([cssnano])
          //     .process(content, {
          //       from: path,
          //     })
          //     .then(result => {
          //       return result.css;
          //     });
          // },
        },
        {
          from: join(Assets, 'images'),
          to: 'assets/images',
          filter: resourcePath => {
            const isDevImg = resourcePath.includes('-dev');
            return isProd ? !isDevImg : isDevImg;
          },
        },
        {
          from: join(Assets, 'json'),
          to: 'assets/json',
        },
      ],
    }),
    ...(process.env.STATS ? [new BundleAnalyzerPlugin()] : []),
    ...prodPlugins,
  ],
  resolve: {
    plugins: [
      new TsconfigPathsPlugin({
        configFile: 'tsconfig.json',
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      }),
    ],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      content: Content,
      assets: Assets,
    },
  },
  optimization: {
    usedExports: isProd,
    minimize: isProd,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          mangle: true,
          compress: true,
          format: {
            comments: false,
          },
        },
      }),
      new CssMinimizerPlugin(),
      new HtmlMinimizerPlugin(),
    ],
  },
};

const buildConfig = (browser, path) => ({
  ...config,
  name: browser,
  output: {
    path: join(Dist, path || browser),
    filename: 'yt-on-yt-[name].js',
  },
  plugins: [
    ...config.plugins,
    new GenerateJsonFromJsPlugin({
      path: join(Source, 'manifest', `${browser}.js`),
      filename: 'manifest.json',
    }),
    new MiniCssExtractPlugin(),
    new webpack.EnvironmentPlugin({
      MV3_HOT_RELOAD_PORT: 9012,
      NPM_PACKAGE_VERSION: process.env.npm_package_version,
    }),
  ],
});

module.exports = {
  config,
  buildConfig,
};
