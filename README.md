# Jose Daniel Villa — Portfolio

Personal portfolio site built with [Astro](https://astro.build), React islands and Tailwind CSS v4, deployed on Vercel.

## Commands

| Command           | Action                                    |
| :---------------- | :---------------------------------------- |
| `npm install`     | Install dependencies                      |
| `npm run dev`     | Dev server at `localhost:4321`            |
| `npm run build`   | Production build to `./dist/`             |
| `npm run preview` | Preview the production build locally      |
| `npm test`        | Run the Vitest suite                      |

## Editing content

- **About:** `src/content/about.md`
- **Experience:** one markdown file per role in `src/content/experience/` (`order` controls position, lowest first)
- **Projects:** one markdown file per project in `src/content/projects/` (`category: selected | other`, screenshots in `src/assets/projects/<slug>/`)
- **CV:** `public/Jose-Daniel-Villa-Resume.pdf` (linked from the hero's "View CV" button)

## Environment

Copy `.env.example` to `.env`:

- `PUBLIC_SITE_URL`: canonical URL used for the sitemap and OG metadata
- `PUBLIC_WEB3FORMS_KEY`: required for the contact form to deliver messages

## Social card

`src/pages/og/[route].ts` renders `/og/default.png` at build time using the static font files in `src/assets/fonts/` (instances of Bricolage Grotesque and Inter, SIL OFL 1.1).
