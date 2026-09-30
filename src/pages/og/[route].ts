import { OGImageRoute } from 'astro-og-canvas';

// Static instances of the site's own typefaces (generated from the
// @fontsource-variable packages). Loaded from disk so the build never
// depends on a remote font CDN, and the card matches the site's typography.
const FONTS = [
  './src/assets/fonts/BricolageGrotesque-Bold.ttf',
  './src/assets/fonts/Inter-Regular.ttf',
];

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'route',
  pages: {
    default: {
      title: 'Jose Daniel Villa',
      description: 'Lead Full-Stack Developer · Web applications, SaaS platforms and automation that businesses run on.',
    },
  },
  getImageOptions: (_, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[10, 22, 40], [6, 15, 31]],
    border: { color: [130, 169, 255], width: 8, side: 'inline-start' },
    padding: 60,
    fonts: FONTS,
    font: {
      title:       { color: [233, 241, 255], size: 84, weight: 'Bold', families: ['Bricolage Grotesque'] },
      description: { color: [138, 152, 182], size: 36, lineHeight: 1.3, families: ['Inter'] },
    },
  }),
});
