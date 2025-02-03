# Kaufman piece values for Chess.com

This browser extension patches Chess.com to use [Larry Kaufman's system](https://archive.ph/20120714204040/http://mywebpages.comcast.net/danheisman/Articles/evaluation_of_material_imbalance.htm) for calculating piece values.

Specifically, it uses the version of this system presented in Kaufman's lecture on the subject, [available on Chess.com](https://www.chess.com/lessons/advanced-piece-values/what-the-pieces-are-really-worth-advanced-piece-values), which differs slightly from the system presented in his 1999 article. For more information on the differences, and to switch the extension to use the system presented in the article, see `src/main.ts`.

## Development

1. Run `yarn install`
2. Run `yarn dev:chrome` or `yarn dev:firefox`

To load the extension, follow the instructions for your browser. The compiled extension files are available in `dist_chrome` or `dist_firefox`.

## Building for production

Run `yarn build:chrome` or `yarn build:firefox`
