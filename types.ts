
export interface Meal {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
  ingredients: string[];
  instructions: string[];
}

export interface DayConfig {
  mealIds: string[]; // Array of meal IDs for the day
  status: 'pending' | 'delivered' | 'postponed';
}

export interface UserProfile {
  id: string;
  password?: string;
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  goal: string;
  allergies: string;
  phone: string;
  hasProfile: boolean;
  savedPlan?: DailyPlan[];
  isAdmin?: boolean;
  isChef?: boolean;
  isEmployee?: boolean;
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
  image?: string;
  features: string[];
  durationLabel: string;
  isPopular?: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'MEALS' | 'SUBSCRIPTION';
  discountAmount: number;
  isPercentage: boolean;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  duration: string;
  deliverySlot: DeliverySlot;
  address: string;
  phone: string;
  notes?: string; 
  user?: UserProfile;
  date: string;
  planTitle?: string;
  pricePaid?: number;
  mealsPerDay: number; // Fixed number of meals per day for this subscription
  // Enhanced tracking
  totalMeals: number;
  deliveredCount: number;
  postponedCount: number;
  dailyConfigs?: Record<string, DayConfig>; // Key is date string YYYY-MM-DD
  departureTime?: string;
  arrivalTime?: string;
  status: 'active' | 'postponed' | 'delivered' | 'out-for-delivery' | 'cancelled';
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
  tax?: number;
}

export interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  missionTitle: string;
  missionText: string;
  featuresList: string[];
  contactPhone: string;
  appBannerTitle1?: string;
  appBannerHighlight?: string;
  appBannerText?: string;
  appBannerImage?: string;
  privacyPolicy: string;
  returnPolicy: string;
  paymentPolicy: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
  linkAndroid: string;
  linkIOS: string;
}

export interface AnalyticsData {
  totalVisits: number;
  androidClicks: number;
  iosClicks: number;
  mealViews: Record<string, number>;
  visitHours: Record<string, number>;
}

export type PageView = 'HOME' | 'LOGIN' | 'ONBOARDING' | 'STORE' | 'PROFILE' | 'SUBSCRIPTION' | 'MEAL_DETAIL' | 'CART' | 'ADMIN' | 'CHEF' | 'PRIVACY_POLICY' | 'RETURN_POLICY' | 'PAYMENT_POLICY';
