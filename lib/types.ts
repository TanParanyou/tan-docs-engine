export interface ThemeConfig {
  primaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
}

export interface PdfOptions {
  format?: "A4" | "Letter";
  orientation?: "portrait" | "landscape";
  printBackground?: boolean;
  displayHeaderFooter?: boolean;
}

export interface DocsConfig {
  name: string;
  title: string;
  subtitle?: string;
  documentNumber?: string;
  version: string;
  status?: "Draft" | "Review" | "Approved" | "Final" | string;
  author: string;
  client?: string;
  organization?: string;
  date: string;
  description?: string;
  coverPage?: boolean;
  files?: string[];
  theme?: ThemeConfig;
  pdfOptions?: PdfOptions;
}

export interface MarkdownFileItem {
  filename: string;
  relativePath: string;
  content: string;
  html: string;
}

export interface WorkspaceData {
  slug: string;
  dirPath: string;
  config: DocsConfig;
  files: MarkdownFileItem[];
  combinedHtml: string;
}

export interface InitialMarkdownFile {
  filename: string;
  content: string;
}

export interface CreateWorkspaceInput {
  slug: string;
  name: string;
  title: string;
  subtitle?: string;
  documentNumber?: string;
  version?: string;
  status?: string;
  author: string;
  client?: string;
  organization?: string;
  theme?: ThemeConfig;
  templateId?: string;
  initialFiles?: InitialMarkdownFile[];
}
