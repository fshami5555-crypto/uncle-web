
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Onboarding } from './components/Onboarding';
import { Store } from './components/Store';
import { Profile } from './components/Profile';
import { Subscription } from './components/Subscription';
import { Login } from './components/Login';
import { MealDetail } from './components/MealDetail';
import { Cart } from './components/Cart';
import { AdminDashboard } from './components/AdminDashboard';
import { ChatWidget } from './components/ChatWidget';
import { StaticPage } from './components/StaticPage';
import { UserProfile, PageView, Meal, CartItem, SiteContent } from './types';
import { INITIAL_USER_PROFILE } from './constants';
import { dataService } from './services/dataService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<PageView>('HOME');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [initialPlanId, setInitialPlanId] = useState<string | null>(null);

  // Helper to update Meta Tags dynamically
  const updateMetaTags = (title: string, description: string, image: string) => {
      document.title = title;
      const setMeta = (selector: string, content: string) => {
          let element = document.querySelector(selector);
          if (!element) {
              element = document.createElement('meta');
              if (selector.startsWith('meta[property')) {
                  element.setAttribute('property', selector.split('"')[1]);
              } else if (selector.startsWith('meta[name')) {
                  element.setAttribute('name', selector.split('"')[1]);
              }
              document.head.appendChild(element);
          }
          element.setAttribute('content', content);
      };
      setMeta('meta[name="description"]', description);
      setMeta('meta[property="og:title"]', title);
      setMeta('meta[property="og:description"]', description);
      setMeta('meta[property="og:image"]', image);
      setMeta('meta[name="twitter:title"]', title);
      setMeta('meta[name="twitter:description"]', description);
      setMeta('meta[name="twitter:image"]', image);
  };

  const resetMetaTags = () => {
      updateMetaTags(
          "Uncle Healthy | منصة الوجبات الصحية الذكية",
          "انكل هيلثي: وجهتك الأولى للوجبات الصحية الفاخرة المدعومة بالذكاء الاصطناعي. تمتع بخطط غذائية مخصصة.",
          "https://i.ibb.co/nqmV5jzX/23.png"
      );
  };

  // Fetch content on mount and Track Visit
  useEffect(() => {
    const fetchContent = async () => {
        const c = await dataService.getContent();
        setContent(c);
        // Log visit
        dataService.logVisit();
    };
    fetchContent();
  }, []);

  // Handle Deep Linking (URL Query Params) on Mount
  useEffect(() => {
      const handleDeepLinks = async () => {
          const params = new URLSearchParams(window.location.search);
          const mealId = params.get('mealId');
          const planId = params.get('planId');

          if (mealId) {
              const allMeals = await dataService.getMeals();
              const meal = allMeals.find(m => m.id === mealId);
              if (meal) {
                  setSelectedMeal(meal);
                  setCurrentView('MEAL_DETAIL');
                  updateMetaTags(
                      `وجبة ${meal.name} | Uncle Healthy`,
                      `${meal.description} - ${meal.macros.calories} سعرة حرارية. اطلبها الآن!`,
                      meal.image
                  );
                  return;
              }
          } else if (planId) {
              const allPlans = await dataService.getSubscriptionPlans();
              const plan = allPlans.find(p => p.id === planId);
              setInitialPlanId(planId);
              setCurrentView('SUBSCRIPTION');
              if (plan) {
                  updateMetaTags(
                      `اشتراك ${plan.title} | Uncle Healthy`,
                      `اشترك في ${plan.title} بسعر ${plan.price} د.أ. ${plan.features.slice(0, 2).join('، ')}.`,
                      plan.image || "https://i.ibb.co/nqmV5jzX/23.png"
                  );
                  return;
              }
          }
          resetMetaTags();
      };
      handleDeepLinks();
  }, []);

  // Reset scroll on view change & Meta Tags Logic
  useEffect(() => {
    window.scrollTo(0, 0);
    if (['HOME', 'STORE', 'SUBSCRIPTION', 'PROFILE', 'CART'].includes(currentView) && !initialPlanId) {
       resetMetaTags();
    }
  }, [currentView, initialPlanId]);

  // Auth Handlers
  const handleLogin = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    if (loggedInUser.isAdmin) {
        setCurrentView('ADMIN');
    } else {
        setCurrentView('PROFILE');
    }
  };

  const handleProfileCreated = (profile: UserProfile) => {
    setUser(profile);
    setCurrentView('PROFILE');
  };

  const handleLogout = () => {
    setUser(INITIAL_USER_PROFILE);
    setCurrentView('HOME');
    setCart([]);
  };

  // Cart Handlers
  const handleAddToCart = (meal: Meal) => {
    setCart(prev => {
        const existing = prev.find(item => item.id === meal.id);
        if (existing) {
            return prev.map(item => item.id === meal.id ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...prev, { ...meal, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
        if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
    }));
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
      setCart([]);
  };

  // Navigation Handlers
  const handleMealClick = async (mealId: string) => {
    const allMeals = await dataService.getMeals();
    const meal = allMeals.find(m => m.id === mealId);
    if (meal) {
      setSelectedMeal(meal);
      setCurrentView('MEAL_DETAIL');
      updateMetaTags(
          `وجبة ${meal.name} | Uncle Healthy`,
          `${meal.description} - ${meal.macros.calories} سعرة حرارية.`,
          meal.image
      );
      window.history.pushState({}, '', `?mealId=${meal.id}`);
    }
  };

  const renderView = () => {
    const safeContent = content || {
        privacyPolicy: '', returnPolicy: '', paymentPolicy: '',
        heroTitle: '', heroSubtitle: '', heroImage: '', missionTitle: '', missionText: '', socialFacebook: '', socialInstagram: '', socialTwitter: ''
    };

    switch (currentView) {
      case 'HOME':
        return <Home onStart={() => setCurrentView(user.hasProfile ? 'PROFILE' : 'ONBOARDING')} />;
      case 'LOGIN':
        return <Login onLogin={handleLogin} onGoToSignup={() => setCurrentView('ONBOARDING')} />;
      case 'ONBOARDING':
        return <Onboarding onComplete={handleProfileCreated} />;
      case 'STORE':
        return <Store onMealClick={handleMealClick} onAddToCart={handleAddToCart} />;
      case 'PROFILE':
        if (!user.hasProfile) {
            return <Login onLogin={handleLogin} onGoToSignup={() => setCurrentView('ONBOARDING')} />;
        }
        return <Profile user={user} onMealClick={handleMealClick} onAddToCart={handleAddToCart} />;
      case 'SUBSCRIPTION':
        return <Subscription initialPlanId={initialPlanId} />;
      case 'CART':
        return (
            <Cart 
                items={cart} 
                user={user}
                onUpdateQuantity={handleUpdateCartQuantity}
                onRemoveItem={handleRemoveFromCart}
                onClearCart={handleClearCart}
                onBackToStore={() => setCurrentView('STORE')}
            />
        );
      case 'MEAL_DETAIL':
        return selectedMeal ? (
            <MealDetail 
                meal={selectedMeal} 
                onBack={() => {
                    setCurrentView('STORE');
                    window.history.pushState({}, '', window.location.pathname);
                }} 
                onAddToCart={(meal) => {
                    handleAddToCart(meal);
                    setCurrentView('CART');
                }}
            />
        ) : <Store onMealClick={handleMealClick} onAddToCart={handleAddToCart} />;
      
      case 'PRIVACY_POLICY':
        return <StaticPage title="سياسة الاستخدام والخصوصية" content={safeContent.privacyPolicy} type="PRIVACY" onBack={() => setCurrentView('HOME')} />;
      case 'RETURN_POLICY':
        return <StaticPage title="سياسة الإرجاع" content={safeContent.returnPolicy} type="RETURN" onBack={() => setCurrentView('HOME')} />;
      case 'PAYMENT_POLICY':
        return <StaticPage title="نظام الدفع" content={safeContent.paymentPolicy} type="PAYMENT" onBack={() => setCurrentView('HOME')} />;

      case 'ADMIN':
        if (!user.isAdmin) return <Home onStart={() => setCurrentView('LOGIN')} />;
        return <AdminDashboard onLogout={handleLogout} />;
      default:
        return <Home onStart={() => setCurrentView('LOGIN')} />;
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (currentView === 'ADMIN') {
      return renderView();
  }

  return (
    <>
      <Layout 
          setView={setCurrentView} 
          currentView={currentView} 
          isLoggedIn={user.hasProfile} 
          onLogout={handleLogout}
          cartItemCount={cartItemCount}
      >
        {renderView()}
      </Layout>
      <ChatWidget />
    </>
  );
};

export default App;
