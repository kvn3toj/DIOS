import { ReactNode } from 'react';
import { LinkProps as NextLinkProps } from 'next/link';
import { ImageProps as NextImageProps } from 'next/image';

declare module 'next/link' {
  export interface LinkProps extends NextLinkProps {
    children: ReactNode;
  }
}

declare module 'next/image' {
  export interface ImageProps extends NextImageProps {
    alt: string;
  }
}

declare module 'next/navigation' {
  export interface NavigationProps {
    children?: ReactNode;
  }

  export function useRouter(): {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
  };

  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
}

declare module 'next' {
  export interface PageProps {
    params?: { [key: string]: string };
    searchParams?: { [key: string]: string | string[] | undefined };
  }
}
