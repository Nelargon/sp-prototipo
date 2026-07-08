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
