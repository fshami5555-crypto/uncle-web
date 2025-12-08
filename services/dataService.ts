import { Order, Subscription, SiteContent, Meal, SubscriptionPlan, PromoCode } from '../types';
import { MEALS } from '../constants';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

// In-memory cache for persistence within session if DB writes fail (e.g. permission issues)
let localPlans: SubscriptionPlan[] = [];
let localPromos: PromoCode[] = [];

export const dataService = {
  // Orders
  getOrders: async (): Promise<Order[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      const orders: Order[] = [];
      querySnapshot.forEach((doc) => {
        orders.push(doc.data() as Order);
      });
      return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.warn("Using local/empty orders due to DB error");
      return [];
    }
  },
  saveOrder: async (order: Order) => {
    try {
      await setDoc(doc(db, "orders", order.id), order);
    } catch (e) {
      console.warn("Failed to save order to DB");
    }
  },
  updateOrderStatus: async (id: string, status: 'pending' | 'completed' | 'cancelled') => {
    try {
      const orderRef = doc(db, "orders", id);
      await updateDoc(orderRef, { status: status });
    } catch (e) {
      console.warn("Failed to update order status");
    }
  },

  // Subscriptions
  getSubscriptions: async (): Promise<Subscription[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "subscriptions"));
      const subs: Subscription[] = [];
      querySnapshot.forEach((doc) => {
        subs.push(doc.data() as Subscription);
      });
      return subs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.warn("Using local/empty subscriptions due to DB error");
      return [];
    }
  },
  saveSubscription: async (sub: Subscription) => {
    try {
      const id = sub.id || `sub_${Date.now()}`;
      await setDoc(doc(db, "subscriptions", id), { ...sub, id });
    } catch (e) {
      console.warn("Failed to save subscription");
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
        geminiApiKey: '',
        appBannerTitle1: 'صحتك صارت',
        appBannerHighlight: 'أسهل وأقرب',
        appBannerText: 'حمل التطبيق الآن واستمتع بتجربة طلب أسرع، تتبع لخطتك الغذائية، وعروض حصرية. وجباتك الصحية بلمسة زر.',
        appBannerImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        privacyPolicy: 'نحن نلتزم بحماية خصوصيتك. يتم استخدام بياناتك فقط لتحسين تجربتك وتوصيل طلباتك.',
        returnPolicy: 'نظراً لطبيعة المنتجات الغذائية، لا يمكن إرجاع الطلبات بعد استلامها إلا في حال وجود عيب مصنعي أو خطأ في الطلب.',
        paymentPolicy: 'نقبل الدفع نقداً عند الاستلام، أو عبر المحافظ الإلكترونية والبطاقات الائتمانية.',
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
            geminiApiKey: data.geminiApiKey || defaults.geminiApiKey
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
        // Seed Defaults
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
    try {
        await setDoc(doc(db, "meals", meal.id), meal);
    } catch (e) {
        console.warn("Failed to add meal");
    }
  },
  deleteMeal: async (id: string) => {
    try {
        await deleteDoc(doc(db, "meals", id));
    } catch (e) {
        console.warn("Failed to delete meal");
    }
  },

  // Subscription Plans Management
  getSubscriptionPlans: async (): Promise<SubscriptionPlan[]> => {
    let plans: SubscriptionPlan[] = [];
    
    // 1. Try Fetch from DB
    try {
      const querySnapshot = await getDocs(collection(db, "plans"));
      querySnapshot.forEach((doc) => {
        plans.push(doc.data() as SubscriptionPlan);
      });
    } catch (e) {
      // Ignore DB error, proceed to use local/defaults
    }

    // 2. Merge with Local Plans (Added in this session but failed to save to DB)
    localPlans.forEach(lp => {
        // Update if exists, else add
        const idx = plans.findIndex(p => p.id === lp.id);
        if (idx >= 0) {
            plans[idx] = lp;
        } else {
            plans.push(lp);
        }
    });
      
    // 3. If still empty, use Defaults
    if (plans.length === 0) {
         const defaults: SubscriptionPlan[] = [
            { 
              id: 'plan_slimming', 
              title: 'باقة الرشاقة (تخفيف)', 
              price: 130, 
              image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
              features: ['وجبتين يومياً (غداء + عشاء)', 'اشتراك لمدة 24 يوم', 'سناك صحي يومي', 'توصيل مجاني'], 
              durationLabel: 'شهر', 
              isPopular: false 
            },
            { 
              id: 'plan_muscle', 
              title: 'باقة العضلات (تضخيم)', 
              price: 175, 
              image: 'https://images.unsplash.com/photo-1543362906-ac1b48263852?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
              features: ['3 وجبات بروتين عالي', 'اشتراك لمدة 26 يوم', '2 سناك بروتين', 'استشارة كابتن مجانية'], 
              durationLabel: 'شهر', 
              isPopular: true 
            },
            { 
              id: 'plan_lifestyle', 
              title: 'باقة لايف ستايل', 
              price: 90, 
              image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
              features: ['وجبة غداء يومية للعمل', 'اشتراك لمدة 20 يوم', 'توصيل مكتبي', 'مرونة في التوقيت'], 
              durationLabel: 'شهر', 
              isPopular: false 
            },
            { 
              id: 'plan_vip', 
              title: 'باقة VIP الملكية', 
              price: 260, 
              image: 'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
              features: ['4 وجبات كاملة يومياً', 'مشروبات ديتوكس', 'متابعة أسبوعية خاصة', 'أولوية قصوى في التوصيل'], 
              durationLabel: 'شهر', 
              isPopular: false 
            },
         ];
         
         // If we have local plans, they are more important than defaults.
         // But if we are resorting to defaults, we should include local ones too.
         // Actually, if plans array is empty here, it means no DB plans AND no local plans.
         // So we return defaults.
         // Wait, if we cleared DB plans but have local plans, plans array won't be empty.
         return defaults;
    }
    return plans;
  },

  saveSubscriptionPlan: async (plan: SubscriptionPlan) => {
    // Optimistic: Always save locally first
    const existingIndex = localPlans.findIndex(p => p.id === plan.id);
    if (existingIndex >= 0) {
        localPlans[existingIndex] = plan;
    } else {
        localPlans.push(plan);
    }

    try {
        await setDoc(doc(db, "plans", plan.id), plan);
    } catch (e) {
        console.warn("Failed to save plan to DB (likely permission issue). Saved locally.");
        // Do NOT throw error, assume success from user perspective for this session
    }
  },

  deleteSubscriptionPlan: async (id: string) => {
    localPlans = localPlans.filter(p => p.id !== id);
    try {
        await deleteDoc(doc(db, "plans", id));
    } catch (e) {
        console.warn("Failed to delete plan from DB");
    }
  },

  // Promo Codes Management
  getPromoCodes: async (): Promise<PromoCode[]> => {
    let promos: PromoCode[] = [];
    try {
      const querySnapshot = await getDocs(collection(db, "promos"));
      querySnapshot.forEach((doc) => {
        promos.push(doc.data() as PromoCode);
      });
    } catch (e) {}

    // Merge Local
    localPromos.forEach(lp => {
         const idx = promos.findIndex(p => p.id === lp.id);
         if (idx >= 0) promos[idx] = lp;
         else promos.push(lp);
    });

    return promos;
  },

  savePromoCode: async (promo: PromoCode) => {
    // Optimistic Save
    const idx = localPromos.findIndex(p => p.id === promo.id);
    if (idx >= 0) localPromos[idx] = promo;
    else localPromos.push(promo);

    try {
        await setDoc(doc(db, "promos", promo.id), promo);
    } catch (e) {
        console.warn("Failed to save promo to DB. Saved locally.");
    }
  },

  deletePromoCode: async (id: string) => {
    localPromos = localPromos.filter(p => p.id !== id);
    try {
        await deleteDoc(doc(db, "promos", id));
    } catch (e) {}
  },

  verifyPromoCode: async (code: string, type: 'MEALS' | 'SUBSCRIPTION'): Promise<PromoCode | null> => {
     // Fetch using the main getter which combines DB and Local
     const allPromos = await dataService.getPromoCodes();
     return allPromos.find(p => p.code === code && p.isActive && p.type === type) || null;
  }
};