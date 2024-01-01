type BreadCrumb = { href: string; label: string };

export interface BaseLayoutProps {
  titlePrefix?: string;
  title?: string;
  breadcrumbs?: BreadCrumb[];
}
