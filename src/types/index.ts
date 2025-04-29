import { Timestamp } from 'firebase/firestore';

/**
 * Core Product Types
 */

// Base product interface
export interface BaseProduct {
  id: string;
  name: string;
  description: string;
  images: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

// Product category enum
export enum ProductCategory {
  GARAGE = 'garage',
  GAZEBO = 'gazebo',
  PORCH = 'porch',
  OAK_BEAM = 'beam',
  OAK_FLOORING = 'flooring'
}

// Size options
export enum SizeType {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  CUSTOM = 'custom'
}

// Truss type options
export enum TrussType {
  CURVED = 'curved',
  STRAIGHT = 'straight'
}

// Oak type options
export enum OakType {
  RECLAIMED = 'reclaimed',
  KILN_DRIED = 'kilnDried',
  GREEN = 'green' // Only for beams
}

// Leg type options (for Gazebos and Porches)
export enum LegType {
  FULL_HEIGHT = 'fullHeight',
  WALL_MOUNT = 'wallMount',
  TO_FLOOR = 'toFloor',
  TO_WALL = 'toWall'
}

// Garage-specific configuration options
export interface GarageOptions {
  sizeType: SizeType;
  trussType: TrussType;
  numberOfBays: 1 | 2 | 3 | 4;
  catSlide: boolean;
  oakType: OakType.RECLAIMED | OakType.KILN_DRIED;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

// Gazebo-specific configuration options
export interface GazeboOptions {
  legType: LegType.FULL_HEIGHT | LegType.WALL_MOUNT;
  sizeType: SizeType;
  trussType: TrussType;
  oakType: OakType.RECLAIMED | OakType.KILN_DRIED;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

// Porch-specific configuration options
export interface PorchOptions {
  trussType: TrussType;
  legType: LegType.TO_FLOOR | LegType.TO_WALL;
  sizeType: SizeType;
  oakType: OakType.RECLAIMED | OakType.KILN_DRIED;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

// Oak Beam-specific configuration options
export interface OakBeamOptions {
  oakType: OakType;
  dimensions: {
    length: number; // in cm
    width: number; // in cm
    thickness: number; // in cm
  };
  volume: number; // Calculated field (length * width * thickness in m³)
}

// Oak Flooring-specific configuration options
export interface OakFlooringOptions {
  oakType: OakType.RECLAIMED | OakType.KILN_DRIED;
  thickness: number; // Fixed thickness in mm, set in admin
  area: number; // in m²
  dimensions?: {
    length: number; // in cm
    width: number; // in cm
  };
}

// Product interfaces for each type
export interface Garage extends BaseProduct {
  category: ProductCategory.GARAGE;
  options: GarageOptions;
  basePrice: number;
}

export interface Gazebo extends BaseProduct {
  category: ProductCategory.GAZEBO;
  options: GazeboOptions;
  basePrice: number;
}

export interface Porch extends BaseProduct {
  category: ProductCategory.PORCH;
  options: PorchOptions;
  basePrice: number;
}

export interface OakBeam extends BaseProduct {
  category: ProductCategory.OAK_BEAM;
  options: OakBeamOptions;
  pricePerCubicMeter: number; // Price per m³
}

export interface OakFlooring extends BaseProduct {
  category: ProductCategory.OAK_FLOORING;
  options: OakFlooringOptions;
  pricePerSquareMeter: number; // Price per m²
}

// Union type for all products
export type Product = Garage | Gazebo | Porch | OakBeam | OakFlooring;

// Product configuration in progress
export interface ProductConfiguration {
  productId: string;
  category: ProductCategory;
  options: GarageOptions | GazeboOptions | PorchOptions | OakBeamOptions | OakFlooringOptions;
  quantity: number;
  calculatedPrice: number;
}

/**
 * User and Authentication Types
 */
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin'
}

export interface Address {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  county: string;
  postcode: string;
  isDefault: boolean;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  addresses: Address[];
  role: UserRole;
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Shopping Cart and Order Types
 */
export interface CartItem {
  id: string;
  productId: string;
  category: ProductCategory;
  name: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  options: GarageOptions | GazeboOptions | PorchOptions | OakBeamOptions | OakFlooringOptions;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  vatAmount: number;
  shippingCost: number;
  total: number;
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  PAYPAL = 'paypal'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface OrderItem extends CartItem {
  totalPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  shippingCost: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Delivery and Shipping Types
 */
export interface DeliveryZone {
  id: string;
  name: string;
  postcodes: string[]; // Array of postcode patterns
  isAvailable: boolean;
}

export interface ShippingRate {
  id: string;
  name: string;
  ratePerCubicMeter: number; // For Beams & Flooring
  minCharge: number;
  freeDeliveryThreshold: number;
}

/**
 * Enquiry Types
 */
export enum EnquiryStatus {
  NEW = 'new',
  IN_PROGRESS = 'inProgress',
  COMPLETED = 'completed'
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  postcode?: string;
  message: string;
  productCategory?: ProductCategory;
  productOptions?: Record<string, any>;
  status: EnquiryStatus;
  adminNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Admin and Settings Types
 */
export interface PricingSettings {
  vatRate: number; // e.g., 0.20 for 20%
  currency: 'GBP';
  currencySymbol: '£';
  // Product-specific pricing
  garagePricing: Record<string, number>; // Combination pricing based on options
  gazeboPricing: Record<string, number>; // Combination pricing based on options
  porchPricing: Record<string, number>; // Combination pricing based on options
  beamPricing: {
    [OakType.RECLAIMED]: number; // Price per m³
    [OakType.KILN_DRIED]: number; // Price per m³
    [OakType.GREEN]: number; // Price per m³
  };
  flooringPricing: {
    [OakType.RECLAIMED]: number; // Price per m²
    [OakType.KILN_DRIED]: number; // Price per m²
  };
  flooringThickness: {
    [OakType.RECLAIMED]: number; // Fixed thickness in mm
    [OakType.KILN_DRIED]: number; // Fixed thickness in mm
  };
}

export interface DeliverySettings {
  minDeliveryCharge: number;
  freeDeliveryThreshold: number;
  shippingRatePerCubicMeter: number;
  estimatedDeliveryLeadTime: string; // Text description, e.g., "2-3 weeks"
  deliveryAreaDescription: string;
}

export interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  vatNumber: string;
  regNumber: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    pinterest?: string;
  };
  temporaryClosureNotice: {
    enabled: boolean;
    message: string;
  };
}

export interface SiteSettings {
  companyInfo: CompanySettings;
  pricing: PricingSettings;
  delivery: DeliverySettings;
}

/**
 * API Response Types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Utility Types
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type WithId<T> = T & { id: string };

export type PricingKey = string; // Format: "sizeType_trussType_numberOfBays_catSlide_oakType"

export function createGaragePricingKey(options: GarageOptions): string {
  return `${options.sizeType}_${options.trussType}_${options.numberOfBays}_${options.catSlide ? 'true' : 'false'}_${options.oakType}`;
}

export function createGazeboPricingKey(options: GazeboOptions): string {
  return `${options.legType}_${options.sizeType}_${options.trussType}_${options.oakType}`;
}

export function createPorchPricingKey(options: PorchOptions): string {
  return `${options.trussType}_${options.legType}_${options.sizeType}_${options.oakType}`;
}

