
export interface Meal {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  macros: {
    protein: number; // grams
    carbs: number;
    fats: number;
    calories: number;
  };
  ingredients: string[];
  instructions: string[]; // Added for Recipe details
}

export interface UserProfile {
  id: string; // Unique ID (phone number mostly)
  password?: string; // For auth
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  goal: string;
  allergies: string;
  phone: string;
  hasProfile: boolean;
  savedPlan?: DailyPlan[]; // Persist the generated plan
  isAdmin?: boolean; // Admin flag
}

export enum SubscriptionDuration {
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly'
}

export enum DeliverySlot {
  MORNING = '10:00 - 12:00',
  EVENING = '15:00 - 17:00'
}

export interface SubscriptionPlan {
  id: string;
  title: string;
  price: number;
  image?: string; // Added image for the plan
  features: string[];
  durationLabel: string; // e.g., "Weekly", "Monthly", "VIP"
  isPopular?: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'MEALS' | 'SUBSCRIPTION'; // Where it can be used
  discountAmount: number; // Value
  isPercentage: boolean; // True for %, False for Fixed Amount
  isActive: boolean;
}

export interface Subscription {
  id?: string;
  duration: string; // Changed from enum to string to support dynamic plans
  deliverySlot: DeliverySlot;
  address: string;
  phone: string;
  notes?: string; // Added notes field
  user?: UserProfile;
  date: string;
  planTitle?: string; // To store snapshot of plan name
  pricePaid?: number; // To store snapshot of price
}

export interface DailyPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

export interface CartItem extends Meal {
  quantity: number;
}

export interface Order {
  id: string;
  user: UserProfile;
  items: CartItem[];
  total: number;
  address: string;
  phone: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  promoCode?: string;
  discountApplied?: number;
  tax?: number; // Added tax field
}

export interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  missionTitle: string;
  missionText: string;
  featuresList: string[]; // Added: List of "Why Us" features
  // Gemini Configuration
  geminiApiKey?: string;
  // App Banner Section
  appBannerTitle1?: string; // "صحتك صارت"
  appBannerHighlight?: string; // "أسهل وأقرب"
  appBannerText?: string;
  appBannerImage?: string; // The screen image
  // Contact Info
  contactPhone: string; // The restaurant phone number to receive orders
  // Policies
  privacyPolicy: string;
  returnPolicy: string;
  paymentPolicy: string;
  // Social Links
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
  // App Links
  linkAndroid: string;
  linkIOS: string;
}

export interface AnalyticsData {
  totalVisits: number;
  androidClicks: number;
  iosClicks: number;
  mealViews: Record<string, number>; // mealId: count
  visitHours: Record<string, number>; // hour(0-23): count
}

export type PageView = 'HOME' | 'LOGIN' | 'ONBOARDING' | 'STORE' | 'PROFILE' | 'SUBSCRIPTION' | 'MEAL_DETAIL' | 'CART' | 'ADMIN' | 'PRIVACY_POLICY' | 'RETURN_POLICY' | 'PAYMENT_POLICY';
