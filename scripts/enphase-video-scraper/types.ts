export interface LocaleConfig {
  locale: string;
  country: string;
  url: string;
}

export interface VideoLink {
  category: string;
  documentName: string;
  documentType: string;
  url: string;
}

export interface ScrapeResult {
  locale: string;
  country: string;
  videos: VideoLink[];
  success: boolean;
  error?: string;
}

export interface ScraperStats {
  totalLocales: number;
  successfulScrapes: number;
  failedScrapes: number;
  totalVideos: number;
  startTime: Date;
  endTime?: Date;
  duration?: string;
}
