import * as React from 'react';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';

export interface NavigationMenuProps extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> {
  className?: string;
}

export interface NavigationMenuListProps extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List> {
  className?: string;
}

export interface NavigationMenuTriggerProps extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger> {
  className?: string;
  children: React.ReactNode;
}

export interface NavigationMenuContentProps extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content> {
  className?: string;
  children: React.ReactNode;
}

export interface NavigationMenuViewportProps extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport> {
  className?: string;
}

export interface NavigationMenuIndicatorProps extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator> {
  className?: string;
}
