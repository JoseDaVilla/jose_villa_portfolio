import { OGImageRoute } from 'astro-og-canvas';

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'route',
  pages: {
    default: {
      title: 'Jose Daniel Villa',
      description: 'Lead Full-Stack Developer · I build the systems businesses actually run on.',
    },
  },
  getImageOptions: (_, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[10, 22, 40], [6, 15, 31]],
    border: { color: [130, 169, 255], width: 8, side: 'inline-start' },
    padding: 60,
    font: {
      title:       { color: [233, 241, 255], size: 80, weight: 'Bold' },
      description: { color: [138, 152, 182], size: 36, lineHeight: 1.3 },
    },
  }),
});
