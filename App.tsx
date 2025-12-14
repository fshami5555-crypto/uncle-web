
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

      // Update Meta Tags Helper
      const setMeta = (selector: string, content: string) => {
          let element = document.querySelector(selector);
          if (!element) {
              element = document.createElement('meta');
              // Guess attribute based on selector
              if (selector.startsWith('meta[property')) {
                  element.setAttribute('property', selector.split('"')[1]);
              } else if (selector.startsWith('meta[name')) {
                  element.setAttribute('name', selector.split('"')[1]);
              }
              document.head.appendChild(element);
          }
          element.setAttribute('content', content);
      };

      // Standard SEO
      setMeta('meta[name="description"]', description);

      // Open Graph (Facebook/WhatsApp)
      setMeta('meta[property="og:title"]', title);
      setMeta('meta[property="og:description"]', description);
      setMeta('meta[property="og:image"]', image);
      
      // Twitter Card
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

  // Fetch content on mount
  useEffect(() => {
    const fetchContent = async () => {
        const c = await dataService.getContent();
        setContent(c);
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
                  // Update Meta for Meal
                  updateMetaTags(
                      `وجبة ${meal.name} | Uncle Healthy`,
                      `${meal.description} - ${meal.macros.calories} سعرة حرارية. اطلبها الآن!`,
                      meal.image
                  );
                  return; // Exit to avoid reset
              }
          } else if (planId) {
              const allPlans = await dataService.getSubscriptionPlans();
              const plan = allPlans.find(p => p.id === planId);
              setInitialPlanId(planId);
              setCurrentView('SUBSCRIPTION');
              
              if (plan) {
                  // Update Meta for Plan
                  updateMetaTags(
                      `اشتراك ${plan.title} | Uncle Healthy`,
                      `اشترك في ${plan.title} بسعر ${plan.price} د.أ. ${plan.features.slice(0, 2).join('، ')}.`,
                      plan.image || "https://i.ibb.co/nqmV5jzX/23.png"
                  );
                  return;
              }
          }
          
          // If no specific content found or on root
          resetMetaTags();
      };

      handleDeepLinks();
  }, []);

  // Reset scroll on view change & Meta Tags Logic
  useEffect(() => {
    window.scrollTo(0, 0);

    // Reset meta tags when returning to main views to prevent stale data
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
    setCart([]); // Optional: Clear cart on logout
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
    // Optional: could show toast notification
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
    const allMeals = await dataService.getMeals(); // Get latest from service (async)
    const meal = allMeals.find(m => m.id === mealId);
    if (meal) {
      setSelectedMeal(meal);
      setCurrentView('MEAL_DETAIL');
      // Update Meta Tags dynamically when clicking inside the app
      updateMetaTags(
          `وجبة ${meal.name} | Uncle Healthy`,
          `${meal.description} - ${meal.macros.calories} سعرة حرارية.`,
          meal.image
      );
      // Update URL without reloading page for shareability
      window.history.pushState({}, '', `?mealId=${meal.id}`);
    }
  };

  const renderView = () => {
    // If content hasn't loaded yet, we can show a loader or fallback
    // But StaticPage handles inputs, so if null, we just pass defaults inside logic or ensure content is not null
    const safeContent = content || {
        privacyPolicy: '',
        returnPolicy: '',
        paymentPolicy: '',
        heroTitle: '', heroSubtitle: '', heroImage: '', missionTitle: '', missionText: '', socialFacebook: '', socialInstagram: '', socialTwitter: ''
    };

    switch (currentView) {
      case 'HOME':
        // Modified: onStart now goes directly to ONBOARDING for new users instead of Login
        return <Home onStart={() => setCurrentView(user.hasProfile ? 'PROFILE' : 'ONBOARDING')} />;
      case 'LOGIN':
        return <Login onLogin={handleLogin} onGoToSignup={() => setCurrentView('ONBOARDING')} />;
      case 'ONBOARDING':
        return <Onboarding onComplete={handleProfileCreated} />;
      case 'STORE':
        return <Store onMealClick={handleMealClick} onAddToCart={handleAddToCart} />;
      case 'PROFILE':
         // If user tries to access profile without login, send to login
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
                    // Reset URL to clean state
                    window.history.pushState({}, '', window.location.pathname);
                }} 
                onAddToCart={(meal) => {
                    handleAddToCart(meal);
                    setCurrentView('CART'); // Optionally go straight to cart
                }}
            />
        ) : <Store onMealClick={handleMealClick} onAddToCart={handleAddToCart} />;
      
      // Legal Pages
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

  // If Admin, render Dashboard without Layout wrapper (full screen dashboard)
  if (currentView === 'ADMIN') {
      return renderView();
  }

  // Regular View
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
      {/* ChatWidget outside Layout to ensure fixed positioning works correctly relative to viewport */}
      <ChatWidget />
    </>
  );
};

export default App;
