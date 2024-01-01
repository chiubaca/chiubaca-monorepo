type BreadCrumb = { href: string; label: string };

export interface BaseLayoutProps {
  title?: string;
  breadcrumbs?: BreadCrumb[];
}
