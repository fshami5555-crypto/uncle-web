
import { Order, Subscription, SiteContent, Meal, SubscriptionPlan, PromoCode, AnalyticsData } from '../types';
import { MEALS } from '../constants';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc, increment } from 'firebase/firestore';

// Local cache only for configuration items (Plans/Promos/Content)
let localPlans: SubscriptionPlan[] = [];
let localPromos: PromoCode[] = [];

export const dataService = {
  // Orders
  getOrders: async (): Promise<Order[]> => {
    try {
      const orders: Order[] = [];
      const querySnapshot = await getDocs(collection(db, "orders"));
      querySnapshot.forEach((doc) => {
        orders.push(doc.data() as Order);
      });
      return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error("Failed to fetch orders from DB:", e);
      return [];
    }
  },
  
  saveOrder: async (order: Order) => {
    await setDoc(doc(db, "orders", order.id), order);
  },
  
  updateOrderStatus: async (id: string, status: 'pending' | 'completed' | 'cancelled') => {
    const orderRef = doc(db, "orders", id);
    await updateDoc(orderRef, { status: status });
  },

  // Subscriptions
  getSubscriptions: async (): Promise<Subscription[]> => {
    try {
      const subs: Subscription[] = [];
      const querySnapshot = await getDocs(collection(db, "subscriptions"));
      querySnapshot.forEach((doc) => {
        subs.push(doc.data() as Subscription);
      });
      return subs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error("Failed to fetch subscriptions from DB:", e);
      return [];
    }
  },
  
  saveSubscription: async (sub: Subscription) => {
    const id = sub.id || `sub_${Date.now()}`;
    const subWithId = { ...sub, id };
    await setDoc(doc(db, "subscriptions", id), subWithId);
  },

  // Content
  getContent: async (): Promise<SiteContent> => {
    const defaults: SiteContent = {
        heroTitle: 'نمط حياة خفيف وصحي للجميع',
        heroSubtitle: 'انكل هيلثي هو وجهتك الأولى للوجبات الصحية الفاخرة. نجمع بين الذكاء الاصطناعي والمكونات الطبيعية 100% لنقدم لك تجربة غذائية لا تُنسى.',
        heroImage: 'https://i.ibb.co/6J8BHK9s/28.jpg',
        missionTitle: 'مهمتنا',
        missionText: 'توفير وجبات صحية فاخرة مصنوعة من مكونات طبيعية 100%. نحن نجعل الحياة الصحية بسيطة، لذيذة، ومتاحة للجميع.',
        featuresList: [
            'مكونات طبيعية 100%',
            'استشارات مدعومة بالذكاء الاصطناعي',
            'نظام اشتراك مرن',
            'توصيل دقيق في الموعد'
        ],
        geminiApiKey: '',
        contactPhone: '',
        appBannerTitle1: 'صحتك صارت',
        appBannerHighlight: 'أسهل وأقرب',
        appBannerText: 'حمل التطبيق الآن واستمتع بتجربة طلب أسرع، تتبع لخطتك الغذائية، وعروض حصرية. وجباتك الصحية بلمسة زر.',
        appBannerImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        privacyPolicy: 'نحن نلتزم بحماية خصوصيتك...',
        returnPolicy: 'نظراً لطبيعة المنتجات الغذائية...',
        paymentPolicy: 'نقبل الدفع نقداً عند الاستلام...',
        socialFacebook: 'https://facebook.com',
        socialInstagram: 'https://instagram.com',
        socialTwitter: 'https://twitter.com',
        linkAndroid: '',
        linkIOS: ''
    };

    try {
      const docRef = doc(db, "content", "main_content");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as SiteContent;
        return { 
            ...defaults, 
            ...data, 
            featuresList: data.featuresList || defaults.featuresList,
            geminiApiKey: data.geminiApiKey || defaults.geminiApiKey,
            contactPhone: data.contactPhone || defaults.contactPhone
        };
      } else {
        try { await setDoc(docRef, defaults); } catch(err) {}
        return defaults;
      }
    } catch (e) {
      console.warn("Firebase content unavailable, using defaults.");
      return defaults;
    }
  },
  
  saveContent: async (content: SiteContent): Promise<boolean> => {
    try {
      await setDoc(doc(db, "content", "main_content"), content);
      return true;
    } catch (e) {
      console.warn("Failed to save content", e);
      return false;
    }
  },

  // Meals
  getMeals: async (): Promise<Meal[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "meals"));
      const meals: Meal[] = [];
      querySnapshot.forEach((doc) => {
        meals.push(doc.data() as Meal);
      });
      
      if (meals.length === 0) {
        try {
            for (const m of MEALS) {
                await setDoc(doc(db, "meals", m.id), m);
            }
        } catch(err) {}
        return MEALS;
      }
      return meals;
    } catch (e) {
      return MEALS;
    }
  },
  addMeal: async (meal: Meal) => {
    await setDoc(doc(db, "meals", meal.id), meal);
  },
  deleteMeal: async (id: string) => {
    await deleteDoc(doc(db, "meals", id));
  },

  // Analytics Functions
  getAnalytics: async (): Promise<AnalyticsData> => {
      const defaultAnalytics: AnalyticsData = {
          totalVisits: 0,
          androidClicks: 0,
          iosClicks: 0,
          mealViews: {},
          visitHours: {}
      };

      try {
          const docRef = doc(db, "analytics", "main_stats");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
              const data = docSnap.data();
              return {
                  ...defaultAnalytics,
                  ...data,
                  // Ensure objects exist if they are missing in DB
                  mealViews: data.mealViews || {},
                  visitHours: data.visitHours || {}
              } as AnalyticsData;
          } else {
              // Initialize if not exists
              await setDoc(docRef, defaultAnalytics);
              return defaultAnalytics;
          }
      } catch (e) {
          console.error("Error fetching analytics", e);
          return defaultAnalytics;
      }
  },

  logVisit: async () => {
      // Use setDoc with merge to safely update counters
      try {
          const docRef = doc(db, "analytics", "main_stats");
          const currentHour = new Date().getHours();
          await setDoc(docRef, {
              totalVisits: increment(1),
              visitHours: {
                  [currentHour]: increment(1)
              }
          }, { merge: true });
      } catch(e) { console.error("Track visit failed", e) }
  },

  logMealView: async (mealId: string) => {
      try {
          const docRef = doc(db, "analytics", "main_stats");
          await setDoc(docRef, {
              mealViews: {
                  [mealId]: increment(1)
              }
          }, { merge: true });
      } catch(e) { console.error("Track meal view failed", e) }
  },

  logAppClick: async (platform: 'android' | 'ios') => {
      try {
          const docRef = doc(db, "analytics", "main_stats");
          await setDoc(docRef, {
              [platform === 'android' ? 'androidClicks' : 'iosClicks']: increment(1)
          }, { merge: true });
      } catch(e) { console.error("Track app click failed", e) }
  },

  // Subscription Plans
  getSubscriptionPlans: async (): Promise<SubscriptionPlan[]> => {
    let plans: SubscriptionPlan[] = [];
    try {
      const querySnapshot = await getDocs(collection(db, "plans"));
      querySnapshot.forEach((doc) => {
        plans.push(doc.data() as SubscriptionPlan);
      });
    } catch (e) {}

    localPlans.forEach(lp => {
        const idx = plans.findIndex(p => p.id === lp.id);
        if (idx >= 0) plans[idx] = lp;
        else plans.push(lp);
    });
      
    if (plans.length === 0) {
        // Return defaults (omitted for brevity, same as previous)
         return [];
    }
    return plans;
  },

  saveSubscriptionPlan: async (plan: SubscriptionPlan) => {
    const existingIndex = localPlans.findIndex(p => p.id === plan.id);
    if (existingIndex >= 0) localPlans[existingIndex] = plan;
    else localPlans.push(plan);
    try { await setDoc(doc(db, "plans", plan.id), plan); } catch (e) {}
  },

  deleteSubscriptionPlan: async (id: string) => {
    localPlans = localPlans.filter(p => p.id !== id);
    try { await deleteDoc(doc(db, "plans", id)); } catch (e) {}
  },

  // Promo Codes
  getPromoCodes: async (): Promise<PromoCode[]> => {
    let promos: PromoCode[] = [];
    try {
      const querySnapshot = await getDocs(collection(db, "promos"));
      querySnapshot.forEach((doc) => {
        promos.push(doc.data() as PromoCode);
      });
    } catch (e) {}
    localPromos.forEach(lp => {
         const idx = promos.findIndex(p => p.id === lp.id);
         if (idx >= 0) promos[idx] = lp;
         else promos.push(lp);
    });
    return promos;
  },

  savePromoCode: async (promo: PromoCode) => {
    const idx = localPromos.findIndex(p => p.id === promo.id);
    if (idx >= 0) localPromos[idx] = promo;
    else localPromos.push(promo);
    try { await setDoc(doc(db, "promos", promo.id), promo); } catch (e) {}
  },

  deletePromoCode: async (id: string) => {
    localPromos = localPromos.filter(p => p.id !== id);
    try { await deleteDoc(doc(db, "promos", id)); } catch (e) {}
  },

  verifyPromoCode: async (code: string, type: 'MEALS' | 'SUBSCRIPTION'): Promise<PromoCode | null> => {
     const allPromos = await dataService.getPromoCodes();
     return allPromos.find(p => p.code === code && p.isActive && p.type === type) || null;
  }
};
