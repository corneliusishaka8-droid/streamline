# Streamline Movie App

## Run locally

1. Copy `.env.example` to `.env`.
2. Add your TMDB bearer token as `VITE_TMDB_TOKEN`.
3. Run `npm install` and `npm run dev`.

## Deploy to Vercel

1. Import this repository into Vercel.
2. Keep the framework preset as `Vite` and the build command as `npm run build`.
3. Add the environment variable `VITE_TMDB_TOKEN` in Vercel project settings for Preview and Production.
4. Deploy. `vercel.json` rewrites client-side routes such as `/search` and `/details/tv/123` to the Vite app.

## Validation

Run `npm run lint` and `npm run build` before deploying.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
