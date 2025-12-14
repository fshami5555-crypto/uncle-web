
import React, { useState, useEffect } from 'react';
import { UserProfile, Order, Subscription, SiteContent, Meal, SubscriptionPlan, PromoCode } from '../types';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import { ShoppingBag, Users, FileText, Calendar, Package, LogOut, Check, X, Trash2, Plus, Settings, Key, Shield, Smartphone, Tag, LayoutList, Menu, Edit, Zap, MessageCircle, Phone, MapPin, Clock } from 'lucide-react';
import { INITIAL_USER_PROFILE, MEALS } from '../constants';
import { ImageUploader } from './ImageUploader';
import { OptimizedImage } from './OptimizedImage';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'ORDERS' | 'STORE' | 'USERS' | 'CONTENT' | 'SUBSCRIPTIONS' | 'PLANS' | 'PROMO';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('ORDERS');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  
  const [content, setContent] = useState<SiteContent>({
      heroTitle: '', heroSubtitle: '', heroImage: '', missionTitle: '', missionText: '', featuresList: [],
      geminiApiKey: '', contactPhone: '',
      appBannerTitle1: '', appBannerHighlight: '', appBannerText: '', appBannerImage: '',
      privacyPolicy: '', returnPolicy: '', paymentPolicy: '', socialFacebook: '', socialInstagram: '', socialTwitter: '',
      linkAndroid: '', linkIOS: ''
  });

  // Modal State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlan, setNewPlan] = useState<Partial<SubscriptionPlan>>({
      title: '', price: 0, features: [], durationLabel: 'شهر', image: ''
  });
  const [planFeaturesText, setPlanFeaturesText] = useState('');

  const [showPromoModal, setShowPromoModal] = useState(false);
  const [newPromo, setNewPromo] = useState<Partial<PromoCode>>({
      code: '', discountAmount: 0, isPercentage: false, type: 'SUBSCRIPTION', isActive: true
  });

  // Meal Modal State
  const [showMealModal, setShowMealModal] = useState(false);
  const [newMeal, setNewMeal] = useState<Partial<Meal>>({
      name: '', description: '', image: '', price: 0, 
      macros: { protein: 0, carbs: 0, fats: 0, calories: 0 },
      ingredients: [], instructions: []
  });
  const [mealIngredientsText, setMealIngredientsText] = useState('');
  const [mealInstructionsText, setMealInstructionsText] = useState('');

  // Load Data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setOrders(await dataService.getOrders());
    setUsers(await authService.getAllUsers());
    setSubscriptions(await dataService.getSubscriptions());
    setMeals(await dataService.getMeals());
    setContent(await dataService.getContent());
    setPlans(await dataService.getSubscriptionPlans());
    setPromos(await dataService.getPromoCodes());
  };

  // Actions
  const handleUpdateOrderStatus = async (id: string, status: 'pending' | 'completed' | 'cancelled') => {
      await dataService.updateOrderStatus(id, status);
      setOrders(await dataService.getOrders());
  };

  const handleSaveContent = async (e: React.FormEvent) => {
      e.preventDefault();
      await dataService.saveContent(content);
      alert('تم حفظ المحتوى والإعدادات بنجاح');
  };

  const handleDeleteMeal = async (id: string) => {
      if(confirm('هل أنت متأكد من حذف هذه الوجبة؟')) {
          await dataService.deleteMeal(id);
          setMeals(await dataService.getMeals());
      }
  };

  const handleEditMeal = (meal: Meal) => {
      setNewMeal({...meal});
      setMealIngredientsText(meal.ingredients.join('\n'));
      setMealInstructionsText(meal.instructions.join('\n'));
      setShowMealModal(true);
  };

  const handleOpenAddMeal = () => {
      setNewMeal({
         name: '', description: '', image: '', price: 0, 
         macros: { protein: 0, carbs: 0, fats: 0, calories: 0 },
         ingredients: [], instructions: []
      });
      setMealIngredientsText('');
      setMealInstructionsText('');
      setShowMealModal(true);
  };

  const handleSaveMeal = async () => {
      if (!newMeal.name || !newMeal.price) {
          alert('الرجاء إدخال اسم الوجبة والسعر');
          return;
      }

      // Check if updating existing or creating new
      const idToUse = newMeal.id || `m_${Date.now()}`;

      const mealToSave: Meal = {
          id: idToUse,
          name: newMeal.name,
          description: newMeal.description || '',
          image: newMeal.image || 'https://picsum.photos/400/300',
          price: Number(newMeal.price),
          macros: newMeal.macros || { protein: 0, carbs: 0, fats: 0, calories: 0 },
          ingredients: mealIngredientsText.split('\n').filter(i => i.trim()),
          instructions: mealInstructionsText.split('\n').filter(i => i.trim())
      };

      try {
          await dataService.addMeal(mealToSave);
          alert(newMeal.id ? 'تم تحديث الوجبة بنجاح!' : 'تم إضافة الوجبة بنجاح!');
          setMeals(await dataService.getMeals());
          setShowMealModal(false);
          setNewMeal({
             name: '', description: '', image: '', price: 0, 
             macros: { protein: 0, carbs: 0, fats: 0, calories: 0 },
             ingredients: [], instructions: []
          });
          setMealIngredientsText('');
          setMealInstructionsText('');
      } catch (err) {
          alert('حدث خطأ أثناء حفظ الوجبة');
      }
  };

  // --- PLAN MANAGEMENT FUNCTIONS ---

  const handleOpenAddPlan = () => {
      setNewPlan({ title: '', price: 0, features: [], durationLabel: 'شهر', image: '' });
      setPlanFeaturesText('');
      setShowPlanModal(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
      setNewPlan({ ...plan });
      setPlanFeaturesText(plan.features.join('\n'));
      setShowPlanModal(true);
  };

  const handleSavePlan = async () => {
      if (!newPlan.title) {
          alert('الرجاء إدخال اسم الباقة');
          return;
      }
      if (!newPlan.price || Number(newPlan.price) <= 0) {
          alert('الرجاء إدخال سعر صحيح للباقة');
          return;
      }
      
      // Use existing ID if editing, or create new
      const idToUse = newPlan.id || `plan_${Date.now()}`;

      const planToSave: SubscriptionPlan = {
          id: idToUse,
          title: newPlan.title,
          price: Number(newPlan.price),
          durationLabel: newPlan.durationLabel || 'شهر',
          image: newPlan.image || 'https://images.unsplash.com/photo-1543362906-ac1b48263852?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
          features: planFeaturesText.split('\n').filter(f => f.trim() !== ''),
          isPopular: newPlan.isPopular || false
      };
      
      try {
          await dataService.saveSubscriptionPlan(planToSave);
          alert(newPlan.id ? 'تم تحديث الباقة بنجاح!' : 'تم إضافة الباقة بنجاح!');
          setPlans(await dataService.getSubscriptionPlans());
          setShowPlanModal(false);
          setNewPlan({ title: '', price: 0, features: [], durationLabel: 'شهر', image: '' });
          setPlanFeaturesText('');
      } catch (err) {
          alert('حدث خطأ أثناء حفظ الباقة، يرجى المحاولة مرة أخرى.');
      }
  };

  const handleDeletePlan = async (id: string) => {
      if(confirm('حذف هذه الباقة؟')) {
          await dataService.deleteSubscriptionPlan(id);
          setPlans(await dataService.getSubscriptionPlans());
      }
  };

  // --- PROMO MANAGEMENT FUNCTIONS ---

  const handleSavePromo = async () => {
      if (!newPromo.code) {
          alert('الرجاء إدخال كود الخصم');
          return;
      }
      if (!newPromo.discountAmount || Number(newPromo.discountAmount) <= 0) {
          alert('الرجاء إدخال قيمة الخصم');
          return;
      }
      
      const promoToSave: PromoCode = {
          id: `promo_${Date.now()}`,
          code: newPromo.code.toUpperCase(),
          discountAmount: Number(newPromo.discountAmount),
          type: newPromo.type as 'MEALS' | 'SUBSCRIPTION',
          isPercentage: newPromo.isPercentage || false,
          isActive: true
      };
      
      try {
          await dataService.savePromoCode(promoToSave);
          alert('تم إضافة كود الخصم بنجاح!');
          setPromos(await dataService.getPromoCodes());
          setShowPromoModal(false);
          setNewPromo({ code: '', discountAmount: 0, isPercentage: false, type: 'SUBSCRIPTION', isActive: true });
      } catch (err) {
          alert('حدث خطأ أثناء حفظ الكود.');
      }
  };

  const handleDeletePromo = async (id: string) => {
      if(confirm('حذف هذا الكود؟')) {
          await dataService.deletePromoCode(id);
          setPromos(await dataService.getPromoCodes());
      }
  };

  // Render Helpers
  const renderSidebarItem = (tab: Tab, label: string, Icon: any) => (
      <button 
        onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}
        className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === tab ? 'bg-uh-gold text-uh-dark font-bold' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
      >
          <Icon size={20} />
          <span>{label}</span>
      </button>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-arabic" dir="rtl">
      {/* Sidebar (Desktop) */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-uh-dark text-white transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="p-6 border-b border-white/10 flex justify-between items-center">
             <h2 className="text-xl font-brand font-bold text-white">لوحة التحكم</h2>
             <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400"><X /></button>
         </div>
         <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
             {renderSidebarItem('ORDERS', 'الطلبات', ShoppingBag)}
             {renderSidebarItem('SUBSCRIPTIONS', 'الاشتراكات', Calendar)}
             {renderSidebarItem('STORE', 'إدارة الوجبات', Package)}
             {renderSidebarItem('USERS', 'المستخدمين', Users)}
             {renderSidebarItem('PLANS', 'خطط الاشتراك', LayoutList)}
             {renderSidebarItem('PROMO', 'كوبونات الخصم', Tag)}
             {renderSidebarItem('CONTENT', 'محتوى الموقع', FileText)}
             
             <div className="pt-8 mt-8 border-t border-white/10">
                 <button onClick={onLogout} className="flex items-center gap-3 w-full p-3 text-red-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition">
                     <LogOut size={20} />
                     <span>تسجيل خروج</span>
                 </button>
             </div>
         </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Mobile Header */}
          <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden">
              <button onClick={() => setSidebarOpen(true)} className="text-uh-dark"><Menu /></button>
              <span className="font-bold text-uh-dark">Admin Panel</span>
          </header>

          {/* Scrollable Content Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
              
              {/* ORDERS TAB */}
              {activeTab === 'ORDERS' && (
                  <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-uh-dark mb-4">أحدث الطلبات</h2>
                      <div className="grid gap-6">
                          {orders.map(order => {
                              // Ensure Whatsapp link uses international format if starts with 0
                              const cleanPhone = order.phone.replace(/\D/g, '').replace(/^0/, '962');
                              const whatsappLink = `https://wa.me/${cleanPhone}`;

                              return (
                                  <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                      {/* Order Header */}
                                      <div className="bg-gray-50 p-4 border-b flex flex-wrap justify-between items-center gap-4">
                                          <div className="flex items-center gap-3">
                                              <span className="font-bold text-lg text-uh-dark font-mono">#{order.id.slice(-6)}</span>
                                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                                  <Clock size={12}/> {new Date(order.date).toLocaleString('ar-EG')}
                                              </span>
                                          </div>
                                          
                                          <div className="flex items-center gap-2">
                                              {order.status === 'pending' && (
                                                  <div className="flex gap-2">
                                                      <button onClick={() => handleUpdateOrderStatus(order.id, 'completed')} className="bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 text-xs font-bold flex items-center gap-1">
                                                          <Check size={12}/> إكمال
                                                      </button>
                                                      <button onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')} className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 text-xs font-bold flex items-center gap-1">
                                                          <X size={12}/> إلغاء
                                                      </button>
                                                  </div>
                                              )}
                                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                  order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                              }`}>
                                                  {order.status === 'completed' ? 'مكتمل' : order.status === 'cancelled' ? 'ملغي' : 'قيد الانتظار'}
                                              </span>
                                          </div>
                                      </div>

                                      <div className="p-6 grid md:grid-cols-2 gap-8">
                                          {/* Customer & Location Details */}
                                          <div className="space-y-4">
                                              <h4 className="text-sm font-bold text-gray-400 uppercase border-b pb-2 mb-2">بيانات العميل والتوصيل</h4>
                                              
                                              <div className="flex items-start gap-3">
                                                  <div className="bg-uh-cream p-2 rounded-full"><Users size={18} className="text-uh-dark"/></div>
                                                  <div>
                                                      <p className="font-bold text-uh-dark">{order.user.name || 'زائر'}</p>
                                                      <p className="text-sm text-gray-500">{order.phone}</p>
                                                      <div className="flex gap-2 mt-2">
                                                          <a href={`tel:${order.phone}`} className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-100 transition">
                                                              <Phone size={12}/> اتصال
                                                          </a>
                                                          <a href={whatsappLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded text-xs hover:bg-green-100 transition">
                                                              <MessageCircle size={12}/> واتساب
                                                          </a>
                                                      </div>
                                                  </div>
                                              </div>

                                              <div className="flex items-start gap-3">
                                                  <div className="bg-uh-cream p-2 rounded-full"><MapPin size={18} className="text-uh-dark"/></div>
                                                  <div className="flex-1">
                                                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 leading-relaxed">
                                                          {order.address}
                                                      </p>
                                                  </div>
                                              </div>
                                          </div>

                                          {/* Order Items & Totals */}
                                          <div className="space-y-4">
                                              <h4 className="text-sm font-bold text-gray-400 uppercase border-b pb-2 mb-2">تفاصيل الطلب</h4>
                                              
                                              <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                                  {order.items.map((item, idx) => (
                                                      <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
                                                          <div className="flex items-center gap-2">
                                                              <span className="bg-gray-100 text-gray-600 w-6 h-6 flex items-center justify-center rounded text-xs font-bold">{item.quantity}x</span>
                                                              <span className="text-gray-700">{item.name}</span>
                                                          </div>
                                                          <span className="font-bold text-gray-900">{(item.price * item.quantity).toFixed(2)}</span>
                                                      </li>
                                                  ))}
                                              </ul>

                                              <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm mt-4">
                                                  {order.discountApplied && (
                                                      <div className="flex justify-between text-green-600">
                                                          <span>خصم ({order.promoCode})</span>
                                                          <span>- {order.discountApplied} د.أ</span>
                                                      </div>
                                                  )}
                                                  <div className="flex justify-between font-bold text-lg text-uh-dark border-t pt-2">
                                                      <span>الإجمالي النهائي</span>
                                                      <span>{order.total} د.أ</span>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              );
                          })}
                          {orders.length === 0 && <div className="text-center text-gray-400 py-10">لا يوجد طلبات حالياً</div>}
                      </div>
                  </div>
              )}

              {/* MEALS TAB */}
              {activeTab === 'STORE' && (
                  <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-uh-dark">قائمة الوجبات</h2>
                        <button 
                            onClick={handleOpenAddMeal}
                            className="bg-uh-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black"
                        >
                            <Plus size={18}/> إضافة وجبة
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {meals.map(meal => (
                              <div key={meal.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 group">
                                  <div className="h-40 w-full">
                                    <OptimizedImage src={meal.image} alt={meal.name} width={300} className="h-full w-full" />
                                  </div>
                                  <div className="p-4">
                                      <h3 className="font-bold text-uh-dark">{meal.name}</h3>
                                      <p className="text-uh-green font-bold text-sm">{meal.price} د.أ</p>
                                      <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                                          <button onClick={() => handleDeleteMeal(meal.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button>
                                          <button onClick={() => handleEditMeal(meal)} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><Edit size={18}/></button>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* CONTENT TAB */}
              {activeTab === 'CONTENT' && (
                  <div className="max-w-3xl">
                      <h2 className="text-2xl font-bold text-uh-dark mb-6">إدارة المحتوى</h2>
                      <form onSubmit={handleSaveContent} className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
                          
                          {/* API KEY & PHONE SECTION */}
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                              <h3 className="font-bold border-b border-blue-200 pb-2 mb-2 flex items-center gap-2 text-uh-dark">
                                  <Zap className="text-uh-gold" fill="currentColor" />
                                  الإعدادات الأساسية
                              </h3>
                              <div>
                                  <label className="block text-sm font-bold mb-1 text-gray-700">مفتاح API (Gemini API Key)</label>
                                  <div className="relative">
                                    <input 
                                        type="text" 
                                        value={content.geminiApiKey || ''} 
                                        onChange={e => setContent({...content, geminiApiKey: e.target.value})} 
                                        className="w-full border border-blue-200 rounded p-3 pl-10 font-mono text-sm bg-white focus:ring-2 focus:ring-blue-300 outline-none" 
                                        placeholder="AIzaSy..." 
                                    />
                                    <Key className="absolute left-3 top-3 text-gray-400" size={18} />
                                  </div>
                              </div>
                              
                              <div>
                                  <label className="block text-sm font-bold mb-1 text-gray-700">رقم واتساب استلام الطلبات</label>
                                  <div className="relative">
                                    <input 
                                        type="tel" 
                                        value={content.contactPhone || ''} 
                                        onChange={e => setContent({...content, contactPhone: e.target.value})} 
                                        className="w-full border border-blue-200 rounded p-3 pl-10 font-mono text-sm bg-white focus:ring-2 focus:ring-blue-300 outline-none" 
                                        placeholder="079xxxxxxx" 
                                    />
                                    <MessageCircle className="absolute left-3 top-3 text-gray-400" size={18} />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                      * هذا الرقم الذي سيتم تحويل العميل إليه لإرسال تفاصيل الطلب عبر واتساب.
                                  </p>
                              </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-bold mb-1">العنوان الرئيسي</label>
                                  <input value={content.heroTitle} onChange={e => setContent({...content, heroTitle: e.target.value})} className="w-full border rounded p-2" />
                              </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                             <div>
                                <ImageUploader 
                                    label="صورة الغلاف (Hero Image)"
                                    value={content.heroImage}
                                    onChange={(url) => setContent({...content, heroImage: url})}
                                />
                             </div>
                             <div>
                                <label className="block text-sm font-bold mb-1">نص المهمة (Mission)</label>
                                <textarea rows={5} value={content.missionText} onChange={e => setContent({...content, missionText: e.target.value})} className="w-full border rounded p-2" />
                             </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                              <h3 className="font-bold border-b pb-2">روابط التطبيق</h3>
                              <div className="grid md:grid-cols-2 gap-4">
                                  <input value={content.linkAndroid} onChange={e => setContent({...content, linkAndroid: e.target.value})} className="w-full border rounded p-2" placeholder="Android Link" />
                                  <input value={content.linkIOS} onChange={e => setContent({...content, linkIOS: e.target.value})} className="w-full border rounded p-2" placeholder="iOS Link" />
                              </div>
                          </div>

                           <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                              <h3 className="font-bold border-b pb-2">بانر التطبيق (الصفحة الرئيسية)</h3>
                              <div className="grid md:grid-cols-2 gap-4">
                                  <input value={content.appBannerTitle1} onChange={e => setContent({...content, appBannerTitle1: e.target.value})} className="w-full border rounded p-2" placeholder="عنوان 1 (صحتك صارت)" />
                                  <input value={content.appBannerHighlight} onChange={e => setContent({...content, appBannerHighlight: e.target.value})} className="w-full border rounded p-2" placeholder="النص المميز (أسهل وأقرب)" />
                                  <div className="col-span-2">
                                     <ImageUploader 
                                        label="صورة البانر"
                                        value={content.appBannerImage || ''}
                                        onChange={(url) => setContent({...content, appBannerImage: url})}
                                    />
                                  </div>
                                  <div className="col-span-2">
                                     <textarea rows={2} value={content.appBannerText} onChange={e => setContent({...content, appBannerText: e.target.value})} className="w-full border rounded p-2" placeholder="وصف البانر" />
                                  </div>
                              </div>
                          </div>

                          <button type="submit" className="w-full bg-uh-green text-white font-bold py-3 rounded-lg hover:bg-uh-greenDark">حفظ التغييرات</button>
                      </form>
                  </div>
              )}

              {/* USERS TAB */}
              {activeTab === 'USERS' && (
                  <div>
                      <h2 className="text-2xl font-bold text-uh-dark mb-4">المستخدمين المسجلين</h2>
                      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                          <table className="w-full text-right">
                              <thead className="bg-gray-50 text-gray-500 text-sm">
                                  <tr>
                                      <th className="p-4">الاسم</th>
                                      <th className="p-4">الهاتف</th>
                                      <th className="p-4">الهدف</th>
                                      <th className="p-4">القياسات</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y">
                                  {users.map((u, i) => (
                                      <tr key={i}>
                                          <td className="p-4 font-bold">{u.name}</td>
                                          <td className="p-4">{u.phone}</td>
                                          <td className="p-4"><span className="bg-uh-cream px-2 py-1 rounded text-xs text-uh-dark font-bold">{u.goal}</span></td>
                                          <td className="p-4 text-sm text-gray-500">{u.weight}kg | {u.height}cm</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {/* SUBSCRIPTIONS TAB */}
              {activeTab === 'SUBSCRIPTIONS' && (
                  <div className="space-y-4">
                       <h2 className="text-2xl font-bold text-uh-dark mb-4">الاشتراكات النشطة</h2>
                       {subscriptions.map(sub => {
                           // Ensure Whatsapp link uses international format if starts with 0
                           const cleanPhone = sub.phone.replace(/\D/g, '').replace(/^0/, '962');
                           const whatsappLink = `https://wa.me/${cleanPhone}`;
                           
                           return (
                               <div key={sub.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                   <div>
                                       <div className="flex items-center gap-2 mb-1">
                                            <div className="font-bold text-lg text-uh-dark">{sub.planTitle}</div>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">نشط</span>
                                       </div>
                                       
                                       <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                                            <Phone size={14}/> {sub.phone} | <Clock size={14}/> {sub.deliverySlot}
                                       </div>
                                       
                                       <div className="text-gray-600 text-xs bg-gray-50 p-2 rounded flex gap-2 items-start">
                                            <MapPin size={14} className="mt-0.5 flex-shrink-0"/> 
                                            <span>{sub.address}</span>
                                       </div>
                                       
                                       <div className="flex gap-2 mt-3">
                                            <a href={`tel:${sub.phone}`} className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-100 transition">
                                                <Phone size={12}/> اتصال
                                            </a>
                                            <a href={whatsappLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded text-xs hover:bg-green-100 transition">
                                                <MessageCircle size={12}/> واتساب
                                            </a>
                                       </div>
                                   </div>
                                   <div className="text-right border-t md:border-t-0 md:border-r border-gray-100 pt-3 md:pt-0 md:pr-4 w-full md:w-auto mt-2 md:mt-0">
                                       <span className="block font-bold text-uh-green text-xl mb-1">{sub.pricePaid} د.أ</span>
                                       <span className="text-xs text-gray-400 block">تاريخ الطلب:</span>
                                       <span className="text-xs text-gray-600">{new Date(sub.date).toLocaleDateString('ar-EG')}</span>
                                   </div>
                               </div>
                           );
                       })}
                       {subscriptions.length === 0 && <div className="text-center text-gray-400 py-10">لا يوجد اشتراكات بعد</div>}
                  </div>
              )}

              {/* PLANS TAB */}
              {activeTab === 'PLANS' && (
                  <div className="space-y-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <h2 className="text-2xl font-bold text-uh-dark">باقات الاشتراك</h2>
                        <button onClick={handleOpenAddPlan} className="bg-uh-dark text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-black w-full md:w-auto shadow-md">
                            <Plus size={18}/> 
                            <span>إضافة باقة جديدة</span>
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {plans.map(plan => (
                              <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group">
                                  {plan.image && (
                                    <div className="h-32 w-full">
                                        <OptimizedImage src={plan.image} alt="" width={300} className="w-full h-full" />
                                    </div>
                                  )}
                                  <div className="p-6">
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <button onClick={() => handleDeletePlan(plan.id)} className="bg-white/80 p-1.5 rounded-full text-red-500 hover:text-red-600 hover:bg-white shadow-sm transition"><Trash2 size={16}/></button>
                                        <button onClick={() => handleEditPlan(plan)} className="bg-white/80 p-1.5 rounded-full text-blue-500 hover:text-blue-600 hover:bg-white shadow-sm transition"><Edit size={16}/></button>
                                    </div>
                                    <h3 className="font-bold text-lg text-uh-dark mb-2">{plan.title}</h3>
                                    <div className="text-3xl font-bold text-uh-green mb-4">{plan.price} <span className="text-sm text-gray-400">د.أ</span></div>
                                    <ul className="text-sm text-gray-500 space-y-1 mb-4">
                                        {plan.features.map((f, i) => <li key={i}>- {f}</li>)}
                                    </ul>
                                    <div className="bg-gray-50 px-2 py-1 rounded text-xs inline-block">
                                        {plan.durationLabel}
                                    </div>
                                  </div>
                              </div>
                          ))}
                          {plans.length === 0 && <div className="col-span-full text-center text-gray-400 py-10">لا يوجد باقات</div>}
                      </div>
                  </div>
              )}

              {/* PROMO TAB */}
              {activeTab === 'PROMO' && (
                  <div className="space-y-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <h2 className="text-2xl font-bold text-uh-dark">كوبونات الخصم</h2>
                        <button onClick={() => setShowPromoModal(true)} className="bg-uh-dark text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-black w-full md:w-auto shadow-md">
                            <Plus size={18}/> 
                            <span>إضافة كود خصم</span>
                        </button>
                      </div>
                      
                      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                          <table className="w-full text-right">
                              <thead className="bg-gray-50 text-gray-500 text-sm">
                                  <tr>
                                      <th className="p-4">الكود</th>
                                      <th className="p-4">القيمة</th>
                                      <th className="p-4">النوع</th>
                                      <th className="p-4">الحالة</th>
                                      <th className="p-4">حذف</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y">
                                  {promos.map(p => (
                                      <tr key={p.id}>
                                          <td className="p-4 font-bold font-mono">{p.code}</td>
                                          <td className="p-4 text-uh-green font-bold">{p.discountAmount} {p.isPercentage ? '%' : 'د.أ'}</td>
                                          <td className="p-4 text-xs">{p.type === 'MEALS' ? 'وجبات' : 'اشتراكات'}</td>
                                          <td className="p-4">
                                              <span className={`px-2 py-1 rounded-full text-xs ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                  {p.isActive ? 'نشط' : 'متوقف'}
                                              </span>
                                          </td>
                                          <td className="p-4">
                                              <button onClick={() => handleDeletePromo(p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                                          </td>
                                      </tr>
                                  ))}
                                  {promos.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">لا يوجد كوبونات</td></tr>}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}
          </main>

          {/* ADD/EDIT PLAN MODAL */}
          {showPlanModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
                  <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in my-8">
                      <div className="flex justify-between items-center mb-4 border-b pb-2">
                          <h3 className="text-xl font-bold">{newPlan.id ? 'تعديل الباقة' : 'إضافة باقة جديدة'}</h3>
                          <button onClick={() => setShowPlanModal(false)}><X className="text-gray-500"/></button>
                      </div>
                      <div className="space-y-4">
                          <input 
                            placeholder="اسم الباقة" 
                            className="w-full border p-3 rounded-lg"
                            value={newPlan.title}
                            onChange={e => setNewPlan({...newPlan, title: e.target.value})}
                          />
                          <ImageUploader 
                            label="صورة الباقة"
                            value={newPlan.image || ''}
                            onChange={(url) => setNewPlan({...newPlan, image: url})}
                          />
                          <div className="flex gap-2">
                             <input 
                                type="number"
                                placeholder="السعر" 
                                className="w-1/2 border p-3 rounded-lg"
                                value={newPlan.price || ''}
                                onChange={e => setNewPlan({...newPlan, price: Number(e.target.value)})}
                             />
                             <input 
                                placeholder="المدة (مثال: شهر)" 
                                className="w-1/2 border p-3 rounded-lg"
                                value={newPlan.durationLabel}
                                onChange={e => setNewPlan({...newPlan, durationLabel: e.target.value})}
                             />
                          </div>
                          <textarea 
                             placeholder="المميزات (ميزة في كل سطر)"
                             rows={4}
                             className="w-full border p-3 rounded-lg"
                             value={planFeaturesText}
                             onChange={e => setPlanFeaturesText(e.target.value)}
                          />
                          <button onClick={handleSavePlan} className="w-full bg-uh-green text-white font-bold py-3 rounded-lg">حفظ الباقة</button>
                      </div>
                  </div>
              </div>
          )}

           {/* ADD MEAL MODAL */}
           {showMealModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
                  <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-4 border-b pb-2">
                          <h3 className="text-xl font-bold">{newMeal.id ? 'تعديل الوجبة' : 'إضافة وجبة جديدة'}</h3>
                          <button onClick={() => setShowMealModal(false)}><X className="text-gray-500"/></button>
                      </div>
                      <div className="space-y-4">
                          <input 
                            placeholder="اسم الوجبة" 
                            className="w-full border p-3 rounded-lg"
                            value={newMeal.name}
                            onChange={e => setNewMeal({...newMeal, name: e.target.value})}
                          />
                          <textarea 
                             placeholder="وصف الوجبة"
                             rows={2}
                             className="w-full border p-3 rounded-lg"
                             value={newMeal.description}
                             onChange={e => setNewMeal({...newMeal, description: e.target.value})}
                          />
                          
                          <ImageUploader 
                            label="صورة الوجبة"
                            value={newMeal.image || ''}
                            onChange={(url) => setNewMeal({...newMeal, image: url})}
                          />

                          <input 
                            type="number"
                            placeholder="السعر (د.أ)" 
                            className="w-full border p-3 rounded-lg"
                            value={newMeal.price || ''}
                            onChange={e => setNewMeal({...newMeal, price: Number(e.target.value)})}
                          />
                          
                          <div className="grid grid-cols-4 gap-2 text-center text-sm">
                              <div>
                                  <label className="block mb-1 text-xs">سعرات</label>
                                  <input type="number" className="w-full border p-2 rounded" value={newMeal.macros?.calories || ''} onChange={e => setNewMeal({...newMeal, macros: {...newMeal.macros!, calories: Number(e.target.value)}})} />
                              </div>
                              <div>
                                  <label className="block mb-1 text-xs">بروتين</label>
                                  <input type="number" className="w-full border p-2 rounded" value={newMeal.macros?.protein || ''} onChange={e => setNewMeal({...newMeal, macros: {...newMeal.macros!, protein: Number(e.target.value)}})} />
                              </div>
                              <div>
                                  <label className="block mb-1 text-xs">كارب</label>
                                  <input type="number" className="w-full border p-2 rounded" value={newMeal.macros?.carbs || ''} onChange={e => setNewMeal({...newMeal, macros: {...newMeal.macros!, carbs: Number(e.target.value)}})} />
                              </div>
                              <div>
                                  <label className="block mb-1 text-xs">دهون</label>
                                  <input type="number" className="w-full border p-2 rounded" value={newMeal.macros?.fats || ''} onChange={e => setNewMeal({...newMeal, macros: {...newMeal.macros!, fats: Number(e.target.value)}})} />
                              </div>
                          </div>

                          <textarea 
                             placeholder="المكونات (كل مكون في سطر)"
                             rows={3}
                             className="w-full border p-3 rounded-lg"
                             value={mealIngredientsText}
                             onChange={e => setMealIngredientsText(e.target.value)}
                          />
                          <textarea 
                             placeholder="طريقة التحضير (كل خطوة في سطر)"
                             rows={3}
                             className="w-full border p-3 rounded-lg"
                             value={mealInstructionsText}
                             onChange={e => setMealInstructionsText(e.target.value)}
                          />

                          <button onClick={handleSaveMeal} className="w-full bg-uh-green text-white font-bold py-3 rounded-lg">
                              {newMeal.id ? 'حفظ التعديلات' : 'إضافة الوجبة'}
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {/* ADD PROMO MODAL */}
          {showPromoModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                  <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in">
                      <div className="flex justify-between items-center mb-4 border-b pb-2">
                          <h3 className="text-xl font-bold">إضافة كود خصم</h3>
                          <button onClick={() => setShowPromoModal(false)}><X className="text-gray-500"/></button>
                      </div>
                      <div className="space-y-4">
                          <input 
                            placeholder="الكود (مثال: SAVE20)" 
                            className="w-full border p-3 rounded-lg uppercase"
                            value={newPromo.code}
                            onChange={e => setNewPromo({...newPromo, code: e.target.value})}
                          />
                          <div className="flex gap-2">
                             <input 
                                type="number"
                                placeholder="القيمة" 
                                className="w-1/2 border p-3 rounded-lg"
                                value={newPromo.discountAmount || ''}
                                onChange={e => setNewPromo({...newPromo, discountAmount: Number(e.target.value)})}
                             />
                             <div className="w-1/2 flex items-center gap-2 border p-3 rounded-lg">
                                <input 
                                    type="checkbox" 
                                    checked={newPromo.isPercentage}
                                    onChange={e => setNewPromo({...newPromo, isPercentage: e.target.checked})}
                                />
                                <span className="text-sm">نسبة مئوية؟</span>
                             </div>
                          </div>
                          <select 
                            className="w-full border p-3 rounded-lg"
                            value={newPromo.type}
                            onChange={e => setNewPromo({...newPromo, type: e.target.value as any})}
                          >
                              <option value="SUBSCRIPTION">خاص بالاشتراكات</option>
                              <option value="MEALS">خاص بالوجبات (المتجر)</option>
                          </select>
                          <button onClick={handleSavePromo} className="w-full bg-uh-green text-white font-bold py-3 rounded-lg">حفظ الكود</button>
                      </div>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};
