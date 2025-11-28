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

export interface Subscription {
  id?: string;
  duration: SubscriptionDuration;
  deliverySlot: DeliverySlot;
  address: string;
  phone: string;
  user?: UserProfile;
  date: string;
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
}

export interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  missionTitle: string;
  missionText: string;
  // Policies
  privacyPolicy: string;
  returnPolicy: string;
  paymentPolicy: string;
  // Social Links
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
}

export type PageView = 'HOME' | 'LOGIN' | 'ONBOARDING' | 'STORE' | 'PROFILE' | 'SUBSCRIPTION' | 'MEAL_DETAIL' | 'CART' | 'ADMIN' | 'PRIVACY_POLICY' | 'RETURN_POLICY' | 'PAYMENT_POLICY';
