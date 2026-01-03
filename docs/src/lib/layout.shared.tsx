import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: 'https://github.com/SibilSoren/yantr-js',
    nav: {
      title: (
        <>
          <Image 
            src="/logo.png" 
            alt="YantrJS" 
            width={32} 
            height={32}
            className="rounded"
          />
          <span className="font-bold text-lg">YantrJS</span>
        </>
      ),
    },
    links: [
      {
        text: 'Docs',
        url: '/docs',
      },
      {
        text: 'Builder',
        url: '/builder',
      },
    ],
  };
}
