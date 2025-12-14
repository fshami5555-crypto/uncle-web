import { Order, Subscription, SiteContent, Meal, SubscriptionPlan, PromoCode } from '../types';
import { MEALS } from '../constants';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

// Local cache only for configuration items (Plans/Promos/Content) to help with seeding if needed,
// but Orders and Subscriptions will now rely strictly on DB.
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
    // Strictly save to DB. If this fails, it will throw an error to be handled by the UI.
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
    // Strictly save to DB.
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
        contactPhone: '', // Default empty, admin should set it
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
        // Seed Defaults to DB if empty
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