import * as React from 'react';

declare module '@radix-ui/react-scroll-area' {
  interface ScrollAreaProps {
    children?: React.ReactNode;
    className?: string;
  }

  interface ScrollAreaViewportProps {
    children?: React.ReactNode;
    className?: string;
  }

  interface ScrollAreaScrollbarProps {
    orientation?: 'vertical' | 'horizontal';
    className?: string;
    children?: React.ReactNode;
  }

  interface ScrollAreaThumbProps {
    className?: string;
  }

  interface ScrollAreaCornerProps {
    className?: string;
  }

  const Root: React.ForwardRefExoticComponent<
    ScrollAreaProps & React.RefAttributes<HTMLDivElement>
  >;
  const Viewport: React.ForwardRefExoticComponent<
    ScrollAreaViewportProps & React.RefAttributes<HTMLDivElement>
  >;
  const ScrollAreaScrollbar: React.ForwardRefExoticComponent<
    ScrollAreaScrollbarProps & React.RefAttributes<HTMLDivElement>
  >;
  const ScrollAreaThumb: React.ForwardRefExoticComponent<
    ScrollAreaThumbProps & React.RefAttributes<HTMLDivElement>
  >;
  const Corner: React.ForwardRefExoticComponent<
    ScrollAreaCornerProps & React.RefAttributes<HTMLDivElement>
  >;
}

declare module '@radix-ui/react-tabs' {
  interface TabsRootProps {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    children?: React.ReactNode;
  }

  interface TabsListProps {
    children?: React.ReactNode;
    className?: string;
  }

  interface TabsTriggerProps {
    value: string;
    children?: React.ReactNode;
    className?: string;
  }

  interface TabsContentProps {
    value: string;
    children?: React.ReactNode;
    className?: string;
  }

  const Root: React.ForwardRefExoticComponent<TabsRootProps & React.RefAttributes<HTMLDivElement>>;
  const List: React.ForwardRefExoticComponent<TabsListProps & React.RefAttributes<HTMLDivElement>>;
  const Trigger: React.ForwardRefExoticComponent<
    TabsTriggerProps & React.RefAttributes<HTMLButtonElement>
  >;
  const Content: React.ForwardRefExoticComponent<
    TabsContentProps & React.RefAttributes<HTMLDivElement>
  >;
}

declare module '@radix-ui/react-separator' {
  interface SeparatorProps {
    decorative?: boolean;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
  }

  const Root: React.ForwardRefExoticComponent<SeparatorProps & React.RefAttributes<HTMLDivElement>>;
}

declare module '@radix-ui/react-navigation-menu' {
  import { ComponentPropsWithoutRef, ElementRef, ReactNode } from 'react';

  export interface NavigationMenuRootProps {
    children: ReactNode;
    className?: string;
    asChild?: boolean;
    forceMount?: true;
  }

  export interface NavigationMenuListProps {
    children: ReactNode;
    className?: string;
    asChild?: boolean;
  }

  export interface NavigationMenuTriggerProps {
    children: ReactNode;
    className?: string;
    asChild?: boolean;
  }

  export interface NavigationMenuContentProps {
    children: ReactNode;
    className?: string;
    asChild?: boolean;
    forceMount?: true;
  }

  export interface NavigationMenuViewportProps {
    children?: ReactNode;
    className?: string;
    asChild?: boolean;
  }

  export interface NavigationMenuIndicatorProps {
    children?: ReactNode;
    className?: string;
    asChild?: boolean;
  }

  const Root: React.ForwardRefExoticComponent<
    NavigationMenuRootProps & React.RefAttributes<HTMLElement>
  >;
  const List: React.ForwardRefExoticComponent<
    NavigationMenuListProps & React.RefAttributes<HTMLUListElement>
  >;
  const Trigger: React.ForwardRefExoticComponent<
    NavigationMenuTriggerProps & React.RefAttributes<HTMLButtonElement>
  >;
  const Content: React.ForwardRefExoticComponent<
    NavigationMenuContentProps & React.RefAttributes<HTMLDivElement>
  >;
  const Viewport: React.ForwardRefExoticComponent<
    NavigationMenuViewportProps & React.RefAttributes<HTMLDivElement>
  >;
  const Indicator: React.ForwardRefExoticComponent<
    NavigationMenuIndicatorProps & React.RefAttributes<HTMLDivElement>
  >;

  export { Root, List, Trigger, Content, Viewport, Indicator };
}

declare module '@radix-ui/react-progress' {
  import { ComponentPropsWithoutRef, ElementRef, ReactNode } from 'react';

  export interface ProgressRootProps {
    children?: ReactNode;
    className?: string;
    value?: number;
    max?: number;
    asChild?: boolean;
  }

  export interface ProgressIndicatorProps {
    children?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    asChild?: boolean;
  }

  const Root: React.ForwardRefExoticComponent<
    ProgressRootProps & React.RefAttributes<HTMLDivElement>
  >;
  const Indicator: React.ForwardRefExoticComponent<
    ProgressIndicatorProps & React.RefAttributes<HTMLDivElement>
  >;

  export { Root, Indicator };
}

declare module '@radix-ui/react-dropdown-menu' {
  import { ComponentPropsWithoutRef, ElementRef, ReactNode } from 'react';

  export interface DropdownMenuRootProps {
    children: ReactNode;
    className?: string;
    asChild?: boolean;
    forceMount?: true;
  }

  export interface DropdownMenuTriggerProps {
    children: ReactNode;
    className?: string;
    asChild?: boolean;
  }

  export interface DropdownMenuContentProps {
    children: ReactNode;
    className?: string;
    align?: 'start' | 'center' | 'end';
    asChild?: boolean;
    forceMount?: true;
  }

  export interface DropdownMenuItemProps {
    children: ReactNode;
    className?: string;
    asChild?: boolean;
    onSelect?: () => void;
  }

  export interface DropdownMenuGroupProps {
    children: ReactNode;
    className?: string;
  }

  const Root: React.ForwardRefExoticComponent<
    DropdownMenuRootProps & React.RefAttributes<HTMLDivElement>
  >;
  const Trigger: React.ForwardRefExoticComponent<
    DropdownMenuTriggerProps & React.RefAttributes<HTMLButtonElement>
  >;
  const Content: React.ForwardRefExoticComponent<
    DropdownMenuContentProps & React.RefAttributes<HTMLDivElement>
  >;
  const Item: React.ForwardRefExoticComponent<
    DropdownMenuItemProps & React.RefAttributes<HTMLDivElement>
  >;
  const Group: React.ForwardRefExoticComponent<
    DropdownMenuGroupProps & React.RefAttributes<HTMLDivElement>
  >;

  export { Root, Trigger, Content, Item, Group };
}

export {};
