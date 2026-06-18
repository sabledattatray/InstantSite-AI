export interface GeneratedSite {
  title: string;
  description: string;
  design_style: string;
  html: string;
  css: string;
  js: string;
}

export type TabType = 'preview' | 'html' | 'css' | 'js';
export type ViewportSize = 'mobile' | 'tablet' | 'desktop';

export interface GeneratePayload {
  prompt: string;
  stylePreset: string;
  typography: string;
  brandColor: string;
}

