
import { Order, Subscription, SiteContent, Meal, SubscriptionPlan, PromoCode, AnalyticsData } from '../types';
import { MEALS, PLANS } from '../constants';
import { db, auth } from './firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc, increment, getDocFromServer } from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Local cache only for configuration items (Plans/Promos/Content)
let localPlans: SubscriptionPlan[] = [];
let localPromos: PromoCode[] = [];

export const dataService = {
  // Connection test
  testConnection: async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      console.error("Firebase connection test failed:", error instanceof Error ? error.message : error);
    }
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    const path = "orders";
    try {
      const orders: Order[] = [];
      const querySnapshot = await getDocs(collection(db, path));
      querySnapshot.forEach((doc) => {
        orders.push(doc.data() as Order);
      });
      return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
      return [];
    }
  },
  
  saveOrder: async (order: Order) => {
    const path = `orders/${order.id}`;
    try {
        await setDoc(doc(db, "orders", order.id), order);
    } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, path);
    }
  },
  
  updateOrderStatus: async (id: string, status: 'pending' | 'completed' | 'cancelled') => {
    const path = `orders/${id}`;
    try {
        const orderRef = doc(db, "orders", id);
        await updateDoc(orderRef, { status: status });
    } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  // Subscriptions
  getSubscriptions: async (): Promise<Subscription[]> => {
    const path = "subscriptions";
    try {
      const subs: Subscription[] = [];
      const querySnapshot = await getDocs(collection(db, path));
      querySnapshot.forEach((doc) => {
        subs.push(doc.data() as Subscription);
      });
      return subs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
      return [];
    }
  },
  
  saveSubscription: async (sub: Subscription) => {
    const id = sub.id || `sub_${Date.now()}`;
    const path = `subscriptions/${id}`;
    const subWithId = { ...sub, id, status: 'active', deliveredCount: 0, postponedCount: 0 };
    try {
        await setDoc(doc(db, "subscriptions", id), subWithId);
    } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  updateSubscription: async (id: string, updates: Partial<Subscription>) => {
    const path = `subscriptions/${id}`;
    try {
        const subRef = doc(db, "subscriptions", id);
        await updateDoc(subRef, updates);
    } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  deleteSubscription: async (id: string) => {
    const path = `subscriptions/${id}`;
    try {
        const subRef = doc(db, "subscriptions", id);
        await deleteDoc(subRef);
    } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, path);
    }
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

    const path = "content/main_content";
    try {
      const docRef = doc(db, "content", "main_content");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as SiteContent;
        return { 
            ...defaults, 
            ...data, 
            featuresList: data.featuresList || defaults.featuresList,
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
    const path = "content/main_content";
    try {
      await setDoc(doc(db, "content", "main_content"), content);
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
      return false;
    }
  },

  // Meals
  getMeals: async (): Promise<Meal[]> => {
    const path = "meals";
    try {
      const querySnapshot = await getDocs(collection(db, path));
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
      handleFirestoreError(e, OperationType.GET, path);
      return MEALS;
    }
  },
  addMeal: async (meal: Meal) => {
    const path = `meals/${meal.id}`;
    try {
        await setDoc(doc(db, "meals", meal.id), meal);
    } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, path);
    }
  },
  deleteMeal: async (id: string) => {
    const path = `meals/${id}`;
    try {
        await deleteDoc(doc(db, "meals", id));
    } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, path);
    }
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

      const path = "analytics/main_stats";
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
          handleFirestoreError(e, OperationType.GET, path);
          return defaultAnalytics;
      }
  },

  logVisit: async () => {
      const path = "analytics/main_stats";
      try {
          const docRef = doc(db, "analytics", "main_stats");
          const currentHour = new Date().getHours();
          await setDoc(docRef, {
              totalVisits: increment(1),
              visitHours: {
                  [currentHour]: increment(1)
              }
          }, { merge: true });
      } catch(e) { handleFirestoreError(e, OperationType.WRITE, path); }
  },

  logMealView: async (mealId: string) => {
      const path = "analytics/main_stats";
      try {
          const docRef = doc(db, "analytics", "main_stats");
          await setDoc(docRef, {
              mealViews: {
                  [mealId]: increment(1)
              }
          }, { merge: true });
      } catch(e) { handleFirestoreError(e, OperationType.WRITE, path); }
  },

  logAppClick: async (platform: 'android' | 'ios') => {
      const path = "analytics/main_stats";
      try {
          const docRef = doc(db, "analytics", "main_stats");
          await setDoc(docRef, {
              [platform === 'android' ? 'androidClicks' : 'iosClicks']: increment(1)
          }, { merge: true });
      } catch(e) { handleFirestoreError(e, OperationType.WRITE, path); }
  },

  // Subscription Plans
  getSubscriptionPlans: async (): Promise<SubscriptionPlan[]> => {
    let plans: SubscriptionPlan[] = [];
    const path = "plans";
    try {
      const querySnapshot = await getDocs(collection(db, path));
      querySnapshot.forEach((doc) => {
        plans.push(doc.data() as SubscriptionPlan);
      });
    } catch (e) {
        handleFirestoreError(e, OperationType.GET, path);
    }

    localPlans.forEach(lp => {
        const idx = plans.findIndex(p => p.id === lp.id);
        if (idx >= 0) plans[idx] = lp;
        else plans.push(lp);
    });
      
    if (plans.length === 0) {
         try {
             for (const p of PLANS) {
                 await setDoc(doc(db, "plans", p.id), p);
             }
         } catch(err) {}
         return PLANS;
    }
    return plans;
  },

  saveSubscriptionPlan: async (plan: SubscriptionPlan) => {
    const existingIndex = localPlans.findIndex(p => p.id === plan.id);
    if (existingIndex >= 0) localPlans[existingIndex] = plan;
    else localPlans.push(plan);
    const path = `plans/${plan.id}`;
    try { await setDoc(doc(db, "plans", plan.id), plan); } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  deleteSubscriptionPlan: async (id: string) => {
    localPlans = localPlans.filter(p => p.id !== id);
    const path = `plans/${id}`;
    try { await deleteDoc(doc(db, "plans", id)); } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  // Promo Codes
  getPromoCodes: async (): Promise<PromoCode[]> => {
    let promos: PromoCode[] = [];
    const path = "promos";
    try {
      const querySnapshot = await getDocs(collection(db, path));
      querySnapshot.forEach((doc) => {
        promos.push(doc.data() as PromoCode);
      });
    } catch (e) {
        handleFirestoreError(e, OperationType.GET, path);
    }
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
    const path = `promos/${promo.id}`;
    try { await setDoc(doc(db, "promos", promo.id), promo); } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  deletePromoCode: async (id: string) => {
    localPromos = localPromos.filter(p => p.id !== id);
    const path = `promos/${id}`;
    try { await deleteDoc(doc(db, "promos", id)); } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  verifyPromoCode: async (code: string, type: 'MEALS' | 'SUBSCRIPTION'): Promise<PromoCode | null> => {
     const allPromos = await dataService.getPromoCodes();
     return allPromos.find(p => p.code === code && p.isActive && p.type === type) || null;
  }
};
