import { Order, Subscription, SiteContent, Meal, SubscriptionPlan, PromoCode } from '../types';
import { MEALS } from '../constants';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

export const dataService = {
  // Orders
  getOrders: async (): Promise<Order[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      const orders: Order[] = [];
      querySnapshot.forEach((doc) => {
        orders.push(doc.data() as Order);
      });
      // Sort manually since we fetched all (newest first)
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
      console.warn("Failed to save order to DB (Permissions/Network)");
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
      // Create a unique ID if not present
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
        
        // Features Defaults
        featuresList: [
            'مكونات طبيعية 100%',
            'استشارات مدعومة بالذكاء الاصطناعي',
            'نظام اشتراك مرن',
            'توصيل دقيق في الموعد'
        ],

        // Config
        // Note: The API Key has been removed from source code to prevent build errors.
        // Please add the key via the Admin Dashboard > Policies Tab > AI Configuration.
        geminiApiKey: '',

        // App Banner Defaults
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
        // Merge with defaults to ensure new fields (like featuresList, geminiApiKey) exist if DB is old
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
        // Try to populate defaults
        try {
            for (const m of MEALS) {
                await setDoc(doc(db, "meals", m.id), m);
            }
        } catch(err) {}
        return MEALS;
      }
      return meals;
    } catch (e) {
      console.warn("Firebase meals unavailable, using local menu.");
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
    try {
      const querySnapshot = await getDocs(collection(db, "plans"));
      const plans: SubscriptionPlan[] = [];
      querySnapshot.forEach((doc) => {
        plans.push(doc.data() as SubscriptionPlan);
      });
      
      if (plans.length === 0) {
         // 4 Default Plans
         const defaults: SubscriptionPlan[] = [
            { 
              id: 'plan_slimming', 
              title: 'باقة الرشاقة (تخفيف)', 
              price: 130, 
              features: ['وجبتين يومياً (غداء + عشاء)', 'اشتراك لمدة 24 يوم', 'سناك صحي يومي', 'توصيل مجاني'], 
              durationLabel: 'Monthly', 
              isPopular: false 
            },
            { 
              id: 'plan_muscle', 
              title: 'باقة العضلات (تضخيم)', 
              price: 175, 
              features: ['3 وجبات بروتين عالي', 'اشتراك لمدة 26 يوم', '2 سناك بروتين', 'استشارة كابتن مجانية'], 
              durationLabel: 'Monthly', 
              isPopular: true 
            },
            { 
              id: 'plan_lifestyle', 
              title: 'باقة لايف ستايل', 
              price: 90, 
              features: ['وجبة غداء يومية للعمل', 'اشتراك لمدة 20 يوم', 'توصيل مكتبي', 'مرونة في التوقيت'], 
              durationLabel: 'Monthly', 
              isPopular: false 
            },
            { 
              id: 'plan_vip', 
              title: 'باقة VIP الملكية', 
              price: 260, 
              features: ['4 وجبات كاملة يومياً', 'مشروبات ديتوكس', 'متابعة أسبوعية خاصة', 'أولوية قصوى في التوصيل'], 
              durationLabel: 'Monthly', 
              isPopular: false 
            },
         ];
         return defaults;
      }
      return plans;
    } catch (e) {
      return [];
    }
  },
  saveSubscriptionPlan: async (plan: SubscriptionPlan) => {
    try {
        await setDoc(doc(db, "plans", plan.id), plan);
    } catch (e) {
        console.warn("Failed to save plan");
    }
  },
  deleteSubscriptionPlan: async (id: string) => {
    try {
        await deleteDoc(doc(db, "plans", id));
    } catch (e) {
        console.warn("Failed to delete plan");
    }
  },

  // Promo Codes Management
  getPromoCodes: async (): Promise<PromoCode[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "promos"));
      const promos: PromoCode[] = [];
      querySnapshot.forEach((doc) => {
        promos.push(doc.data() as PromoCode);
      });
      return promos;
    } catch (e) {
      return [];
    }
  },
  savePromoCode: async (promo: PromoCode) => {
    try {
        await setDoc(doc(db, "promos", promo.id), promo);
    } catch (e) {
        console.warn("Failed to save promo");
    }
  },
  deletePromoCode: async (id: string) => {
    try {
        await deleteDoc(doc(db, "promos", id));
    } catch (e) {
        console.warn("Failed to delete promo");
    }
  },
  verifyPromoCode: async (code: string, type: 'MEALS' | 'SUBSCRIPTION'): Promise<PromoCode | null> => {
     try {
        const querySnapshot = await getDocs(collection(db, "promos"));
        let validPromo: PromoCode | null = null;
        querySnapshot.forEach((doc) => {
            const data = doc.data() as PromoCode;
            if (data.code === code && data.isActive && data.type === type) {
                validPromo = data;
            }
        });
        return validPromo;
     } catch (e) {
         return null;
     }
  }
};