import { Order, Subscription, SiteContent, Meal } from '../types';
import { MEALS } from '../constants';

const ORDERS_KEY = 'uh_orders';
const SUBS_KEY = 'uh_subscriptions';
const CONTENT_KEY = 'uh_content';
const MEALS_KEY = 'uh_meals';
const API_KEY_STORAGE = 'uh_api_key';

// Default provided key as fallback
const DEFAULT_API_KEY = 'AIzaSyA9Mik-C-2DwTZ90IRZ-9YhBLB-YoR5zFE'; 

export const dataService = {
  // Orders
  getOrders: (): Order[] => {
    const data = localStorage.getItem(ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveOrder: (order: Order) => {
    const orders = dataService.getOrders();
    orders.unshift(order); // Add to top
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  },
  updateOrderStatus: (id: string, status: 'pending' | 'completed' | 'cancelled') => {
    const orders = dataService.getOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx > -1) {
        orders[idx].status = status;
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
  },

  // Subscriptions
  getSubscriptions: (): Subscription[] => {
    const data = localStorage.getItem(SUBS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveSubscription: (sub: Subscription) => {
    const subs = dataService.getSubscriptions();
    subs.unshift(sub);
    localStorage.setItem(SUBS_KEY, JSON.stringify(subs));
  },

  // Content
  getContent: (): SiteContent => {
    const dataStr = localStorage.getItem(CONTENT_KEY);
    const defaults: SiteContent = {
        heroTitle: 'نمط حياة خفيف وصحي للجميع',
        heroSubtitle: 'انكل هيلثي هو وجهتك الأولى للوجبات الصحية الفاخرة. نجمع بين الذكاء الاصطناعي والمكونات الطبيعية 100% لنقدم لك تجربة غذائية لا تُنسى.',
        heroImage: 'https://i.ibb.co/6J8BHK9s/28.jpg',
        missionTitle: 'مهمتنا',
        missionText: 'توفير وجبات صحية فاخرة مصنوعة من مكونات طبيعية 100%. نحن نجعل الحياة الصحية بسيطة، لذيذة، ومتاحة للجميع.',
        
        // Default Policies
        privacyPolicy: 'نحن نلتزم بحماية خصوصيتك. يتم استخدام بياناتك فقط لتحسين تجربتك وتوصيل طلباتك.',
        returnPolicy: 'نظراً لطبيعة المنتجات الغذائية، لا يمكن إرجاع الطلبات بعد استلامها إلا في حال وجود عيب مصنعي أو خطأ في الطلب.',
        paymentPolicy: 'نقبل الدفع نقداً عند الاستلام، أو عبر المحافظ الإلكترونية والبطاقات الائتمانية.',
        
        // Default Social
        socialFacebook: 'https://facebook.com',
        socialInstagram: 'https://instagram.com',
        socialTwitter: 'https://twitter.com'
    };

    if (dataStr) {
        const parsed = JSON.parse(dataStr);
        // Merge with defaults to ensure new fields exist
        return { ...defaults, ...parsed };
    }
    
    return defaults;
  },
  saveContent: (content: SiteContent) => {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
  },

  // Meals (Allowing edits)
  getMeals: (): Meal[] => {
    const data = localStorage.getItem(MEALS_KEY);
    return data ? JSON.parse(data) : MEALS;
  },
  saveMeals: (meals: Meal[]) => {
    localStorage.setItem(MEALS_KEY, JSON.stringify(meals));
  },
  addMeal: (meal: Meal) => {
      const meals = dataService.getMeals();
      meals.push(meal);
      dataService.saveMeals(meals);
  },
  deleteMeal: (id: string) => {
      const meals = dataService.getMeals();
      const filtered = meals.filter(m => m.id !== id);
      dataService.saveMeals(filtered);
  },

  // API Key Management
  getApiKey: (): string => {
      return localStorage.getItem(API_KEY_STORAGE) || DEFAULT_API_KEY;
  },
  saveApiKey: (key: string) => {
      localStorage.setItem(API_KEY_STORAGE, key);
  }
};
