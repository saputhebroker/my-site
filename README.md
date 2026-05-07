# Portfolio Website

This project is now set up to run like a real website instead of only a local prototype.

## Run locally

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## How content works

- Edit [`portfolio.json`](./portfolio.json) for portfolio content.
- Run `npm run build` to sync that content into the public website files.
- `npm start` already does the sync automatically before the server starts.

## Contact form options

- Node hosting: the built-in `/api/contact` route stores submissions in `contact-submissions.json`.
- Static hosting: set `contact.formEndpoint` in `portfolio.json` to a form service endpoint, or keep the email fallback.

## Deployment options

- Node host: deploy the whole project and run `npm start`.
- Static host: publish the `public` folder after `npm run build` if you do not need server-side message storage.

## GitHub Pages

- This repo now includes [`deploy-pages.yml`](./.github/workflows/deploy-pages.yml) for GitHub Pages.
- Push the project to a GitHub repository and keep the default branch as `main`.
- In the repository settings, set GitHub Pages to use GitHub Actions as the source.
- Each push to `main` will build the site and publish the `public` folder.
- Because GitHub Pages is static hosting, the built-in Node contact API is not available there. Set `contact.formEndpoint` in [`portfolio.json`](./portfolio.json) or replace the sample email so the form can fall back to `mailto:`.
