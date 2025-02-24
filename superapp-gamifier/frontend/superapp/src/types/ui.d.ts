declare module '@/components/ui/*' {
  import {
    ReactNode,
    ForwardRefExoticComponent,
    RefAttributes,
    ComponentPropsWithoutRef,
  } from 'react';
  import * as React from 'react';

  // Avatar Component Types
  export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
  }

  export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    className?: string;
  }

  export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {
    className?: string;
  }

  export const Avatar: ForwardRefExoticComponent<AvatarProps & RefAttributes<HTMLDivElement>>;
  export const AvatarImage: ForwardRefExoticComponent<
    AvatarImageProps & RefAttributes<HTMLImageElement>
  >;
  export const AvatarFallback: ForwardRefExoticComponent<
    AvatarFallbackProps & RefAttributes<HTMLSpanElement>
  >;

  // Button Component Types
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
  }

  export const Button: ForwardRefExoticComponent<ButtonProps & RefAttributes<HTMLButtonElement>>;

  // Navigation Menu Types
  export interface NavigationMenuProps extends React.HTMLAttributes<HTMLElement> {
    className?: string;
    children: ReactNode;
  }

  export interface NavigationMenuListProps extends React.HTMLAttributes<HTMLUListElement> {
    className?: string;
    children: ReactNode;
  }

  export interface NavigationMenuTriggerProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    children: ReactNode;
  }

  export interface NavigationMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    children: ReactNode;
  }

  export const NavigationMenu: ForwardRefExoticComponent<
    NavigationMenuProps & RefAttributes<HTMLElement>
  >;
  export const NavigationMenuList: ForwardRefExoticComponent<
    NavigationMenuListProps & RefAttributes<HTMLUListElement>
  >;
  export const NavigationMenuTrigger: ForwardRefExoticComponent<
    NavigationMenuTriggerProps & RefAttributes<HTMLButtonElement>
  >;
  export const NavigationMenuContent: ForwardRefExoticComponent<
    NavigationMenuContentProps & RefAttributes<HTMLDivElement>
  >;

  // Progress Component Types
  export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    value?: number;
    max?: number;
  }

  export const Progress: ForwardRefExoticComponent<ProgressProps & RefAttributes<HTMLDivElement>>;

  // Toast Component Types
  export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    variant?: 'default' | 'destructive';
    title?: string;
    description?: string;
    action?: ReactNode;
  }

  export const Toast: ForwardRefExoticComponent<ToastProps & RefAttributes<HTMLDivElement>>;
  export const Toaster: React.FC;

  // Dropdown Menu Types
  export interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    children: ReactNode;
  }

  export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    children: ReactNode;
  }

  export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    children: ReactNode;
  }

  export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    children: ReactNode;
  }

  export const DropdownMenu: ForwardRefExoticComponent<
    DropdownMenuProps & RefAttributes<HTMLDivElement>
  >;
  export const DropdownMenuTrigger: ForwardRefExoticComponent<
    DropdownMenuTriggerProps & RefAttributes<HTMLButtonElement>
  >;
  export const DropdownMenuContent: ForwardRefExoticComponent<
    DropdownMenuContentProps & RefAttributes<HTMLDivElement>
  >;
  export const DropdownMenuItem: ForwardRefExoticComponent<
    DropdownMenuItemProps & RefAttributes<HTMLButtonElement>
  >;
}

// PWA and Service Worker Types
declare module '@/components/PWAInstall' {
  import { FC } from 'react';
  const PWAInstall: FC;
  export default PWAInstall;
}

declare module '@/components/ServiceWorkerRegistration' {
  import { FC } from 'react';
  const ServiceWorkerRegistration: FC;
  export default ServiceWorkerRegistration;
}

// Global Window Type Extension
interface Window {
  workbox: any;
}
