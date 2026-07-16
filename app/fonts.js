import localFont from 'next/font/local';

// Gilroy, self-hosted. next/font emits the @font-face rules with asset URLs that
// respect basePath/assetPrefix automatically, so the fonts resolve correctly both
// locally and when the site is served from a GitHub Pages subpath.
export const gilroy = localFont({
  src: [
    { path: '../public/fonts/Gilroy-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/Gilroy-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../public/fonts/Gilroy-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../public/fonts/Gilroy-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../public/fonts/Gilroy-ExtraBold.ttf', weight: '800', style: 'normal' },
  ],
  variable: '--font-gilroy',
  display: 'swap',
});

// Inter (variable, OFL — ver public/fonts/OFL-Inter.txt): la tipografía de
// cuerpo que define la identidad SP (HANDOFF decisión #2, "Inter para
// cuerpo"). Gilroy es display: en lectura larga cansa; el cuerpo de las
// notas del blog se lee en Inter.
export const inter = localFont({
  src: [{ path: '../public/fonts/Inter-Variable.ttf', weight: '100 900', style: 'normal' }],
  variable: '--font-inter',
  display: 'swap',
});
