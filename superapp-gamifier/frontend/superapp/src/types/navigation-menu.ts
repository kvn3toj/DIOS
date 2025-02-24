import { ReactNode } from 'react';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';

export interface NavigationMenuProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> {
  children: ReactNode;
  className?: string;
}

export interface NavigationMenuListProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List> {
  children: ReactNode;
  className?: string;
}

export interface NavigationMenuTriggerProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger> {
  children: ReactNode;
  className?: string;
}

export interface NavigationMenuContentProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content> {
  children: ReactNode;
  className?: string;
}

export interface NavigationMenuViewportProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport> {
  className?: string;
}

export interface NavigationMenuIndicatorProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator> {
  className?: string;
}
