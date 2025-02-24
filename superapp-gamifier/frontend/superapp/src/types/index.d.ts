import { ReactNode } from 'react';
import { ServiceWorkerRegistration } from 'next/dist/client/components/react-dev-overlay/internal/container/Errors';

declare global {
  interface Window {
    workbox: {
      addEventListener: (event: string, callback: (event: any) => void) => void;
      register: () => Promise<void>;
    };
  }
}

declare module '@/components/ui/use-toast' {
  export interface Toast {
    id: string;
    title?: string;
    description?: string;
    action?: ReactNode;
  }

  export interface UseToastReturn {
    toasts: Toast[];
    toast: (props: Toast) => void;
    dismiss: (id: string) => void;
  }

  export function useToast(): UseToastReturn;
}

declare module '@/components/ui/avatar' {
  export const Avatar: React.FC<{
    className?: string;
    children?: ReactNode;
  }>;
  export const AvatarImage: React.FC<{
    src?: string;
    alt?: string;
    className?: string;
  }>;
  export const AvatarFallback: React.FC<{
    children?: ReactNode;
    className?: string;
  }>;
}

declare module '@/components/ui/button' {
  export const Button: React.FC<{
    className?: string;
    children?: ReactNode;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
  }>;
}

declare module '@/components/ui/dropdown-menu' {
  export const DropdownMenu: React.FC<{
    children?: ReactNode;
  }>;
  export const DropdownMenuTrigger: React.FC<{
    children?: ReactNode;
    className?: string;
  }>;
  export const DropdownMenuContent: React.FC<{
    children?: ReactNode;
    className?: string;
    align?: 'start' | 'end' | 'center';
  }>;
  export const DropdownMenuItem: React.FC<{
    children?: ReactNode;
    className?: string;
    onSelect?: () => void;
  }>;
  export const DropdownMenuLabel: React.FC<{
    children?: ReactNode;
    className?: string;
  }>;
  export const DropdownMenuSeparator: React.FC<{
    className?: string;
  }>;
  export const DropdownMenuShortcut: React.FC<{
    children?: ReactNode;
    className?: string;
  }>;
}

declare module '@/components/PWAInstall' {
  const PWAInstall: React.FC;
  export default PWAInstall;
}

declare module '@/components/ServiceWorkerRegistration' {
  const ServiceWorkerRegistration: React.FC;
  export default ServiceWorkerRegistration;
}

export {};
