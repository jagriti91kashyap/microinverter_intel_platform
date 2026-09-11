export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Manufacturer {
  id: string;
  name: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  country?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  series?: string;
  model?: string;
  manufacturerId: string;
  acPower?: number;
  maxModuleSize?: number;
  voltage?: number;
  mppt?: number;
  efficiency?: number;
  warranty?: number;
  weight?: number;
  dimensions?: string;
  monitoringPlatform?: string;
  status: ProductStatus;
  imageUrl?: string;
  datasheetUrl?: string;
  productUrl?: string;
  // AI Enhancement Fields
  aiSummary?: string;
  embedding?: number[];
  lastCrawledAt?: Date;
  confidenceScore?: number;
  extractedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  manufacturer?: Manufacturer;
  specifications?: ProductSpecification[];
  certifications?: ProductCertification[];
  accessories?: CompatibleAccessory[];
  availability?: ProductAvailability[];
  datasheets?: Datasheet[];
}

export interface ProductSpecification {
  id: string;
  productId: string;
  category: string;
  name: string;
  value: string;
  unit?: string;
  description?: string;
  confidence: number;
  sourceId?: string;
  // AI Enhancement Fields
  extractedAt: Date;
  sourceUrl?: string;
  pageNumber?: number;
  verifiedAt?: Date;
  isVerified: boolean;
  product?: Product;
}

export interface ProductCertification {
  id: string;
  productId: string;
  country: string;
  standard: string;
  certified: boolean;
  dateObtained?: Date;
  expiresAt?: Date;
  documentUrl?: string;
  product?: Product;
}

export interface CompatibleAccessory {
  id: string;
  productId: string;
  name: string;
  type: string;
  isRequired: boolean;
  description?: string;
  product?: Product;
}

export interface ProductAvailability {
  id: string;
  productId: string;
  country: string;
  region?: string;
  isAvailable: boolean;
  price?: number;
  currency?: string;
  supplier?: string;
  lastChecked: Date;
  product?: Product;
}

export interface Datasheet {
  id: string;
  productId: string;
  url: string;
  filename: string;
  fileSize: number;
  pageCount?: number;
  extractedAt: Date;
  checksum: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  query: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface ProductComparison {
  id: string;
  userId: string;
  name?: string;
  productIds: string;
  createdAt: Date;
  updatedAt: Date;
  shareToken?: string;
  user?: User;
  items?: ProductComparisonItem[];
}

export interface ProductComparisonItem {
  id: string;
  comparisonId: string;
  productId: string;
  position: number;
  comparison?: ProductComparison;
  product?: Product;
}

export interface ProductChangeHistory {
  id: string;
  productId: string;
  field: string;
  oldValue?: string;
  newValue?: string;
  changeType: ChangeType;
  detectedAt: Date;
  sourceUrl?: string;
  confidence: number;
  product?: Product;
}

export interface CrawlJob {
  id: string;
  manufacturerId?: string;
  url: string;
  status: JobStatus;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  productsFound: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  manufacturer?: string[];
  country?: string[];
  powerRange?: { min: number; max: number };
  mpptRange?: { min: number; max: number };
  certification?: string[];
  warrantyRange?: { min: number; max: number };
  status?: ProductStatus[];
}

export interface SearchResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: any;
}

export interface DashboardKPI {
  totalProducts: number;
  totalManufacturers: number;
  recentUpdates: number;
  activeJobs: number;
  productsByManufacturer: { manufacturer: string; count: number }[];
  productsByCountry: { country: string; count: number }[];
  productsByPowerClass: { class: string; count: number }[];
  recentLaunches: Product[];
  recentlyUpdated: Product[];
}

export interface AIExtractionResult {
  specifications: ProductSpecification[];
  confidence: number;
  sourceUrl: string;
  extractedAt: Date;
  errors?: string[];
}

export interface ChangeDetectionResult {
  changes: ProductChangeHistory[];
  newProducts: Product[];
  discontinuedProducts: Product[];
  updatedProducts: Product[];
}

// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER'
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  DISCONTINUED = 'DISCONTINUED',
  ANNOUNCED = 'ANNOUNCED',
  COMING_SOON = 'COMING_SOON'
}

export enum SourceType {
  DATASHEET = 'DATASHEET',
  WEBSITE = 'WEBSITE',
  MANUAL = 'MANUAL',
  PRESS_RELEASE = 'PRESS_RELEASE',
  OTHER = 'OTHER'
}

export enum ChangeType {
  NEW_PRODUCT = 'NEW_PRODUCT',
  SPECIFICATION_CHANGE = 'SPECIFICATION_CHANGE',
  PRICE_CHANGE = 'PRICE_CHANGE',
  AVAILABILITY_CHANGE = 'AVAILABILITY_CHANGE',
  DISCONTINUATION = 'DISCONTINUATION',
  WARRANTY_UPDATE = 'WARRANTY_UPDATE',
  DATASHEET_REVISION = 'DATASHEET_REVISION'
}

export enum JobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum CrawlType {
  MANUFACTURER = 'MANUFACTURER',
  PRODUCT_PAGE = 'PRODUCT_PAGE',
  DATASHEET = 'DATASHEET',
  CHANGE_DETECTION = 'CHANGE_DETECTION'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form Types
export interface ProductFormData {
  name: string;
  series?: string;
  model?: string;
  manufacturerId: string;
  acPower?: number;
  maxModuleSize?: number;
  voltage?: number;
  mppt?: number;
  efficiency?: number;
  warranty?: number;
  weight?: number;
  dimensions?: string;
  monitoringPlatform?: string;
  status: ProductStatus;
  imageUrl?: string;
  datasheetUrl?: string;
  productUrl?: string;
}

export interface ManufacturerFormData {
  name: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  country?: string;
  isActive: boolean;
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}

// Search Types
export interface AutocompleteResult {
  id: string;
  name: string;
  type: 'product' | 'manufacturer';
  manufacturer?: string;
  series?: string;
}

// Enterprise Feature Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: any;
  createdAt: Date;
  readAt?: Date;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface SearchIndex {
  id: string;
  productId: string;
  content: string;
  embedding: number[];
  lastIndexed: Date;
  version: number;
}

export interface SystemMetrics {
  id: string;
  metric: string;
  value: number;
  unit?: string;
  timestamp: Date;
  metadata?: any;
}

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  PRODUCT_UPDATE = 'PRODUCT_UPDATE',
  NEW_PRODUCT = 'NEW_PRODUCT',
  DISCONTINUATION = 'DISCONTINUATION',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}

// Azure AD Types
export interface AzureADUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  department?: string;
  manager?: string;
}

// AI Pipeline Types
export interface ExtractionJob {
  id: string;
  url: string;
  type: 'webpage' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: AIExtractionResult;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface SemanticSearchResult {
  product: Product;
  similarity: number;
  highlights: string[];
}

// Dashboard Analytics Types
export interface AnalyticsData {
  manufacturerStats: ManufacturerStats[];
  countryStats: CountryStats[];
  powerClassStats: PowerClassStats[];
  warrantyStats: WarrantyStats[];
  efficiencyStats: EfficiencyStats[];
  availabilityStats: AvailabilityStats[];
  trendData: TrendData[];
}

export interface ManufacturerStats {
  manufacturer: string;
  productCount: number;
  avgPower: number;
  avgEfficiency: number;
  avgWarranty: number;
  marketShare: number;
  countries: number;
}

export interface CountryStats {
  country: string;
  productCount: number;
  manufacturerCount: number;
  avgPower: number;
  marketSize: number;
}

export interface PowerClassStats {
  class: string;
  range: string;
  productCount: number;
  percentage: number;
}

export interface WarrantyStats {
  years: number;
  productCount: number;
  percentage: number;
  manufacturers: string[];
}

export interface EfficiencyStats {
  range: string;
  productCount: number;
  percentage: number;
  avgEfficiency: number;
}

export interface AvailabilityStats {
  country: string;
  availableProducts: number;
  totalProducts: number;
  availabilityRate: number;
}

export interface TrendData {
  period: string;
  newProducts: number;
  discontinuedProducts: number;
  updatedProducts: number;
  totalProducts: number;
}
