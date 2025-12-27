
import React, { useState, useEffect } from 'react';
import { UserProfile, Order, Subscription, SiteContent, Meal, SubscriptionPlan, PromoCode, AnalyticsData } from '../types';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import { ShoppingBag, Users, FileText, Calendar, Package, LogOut, Check, X, Trash2, Plus, Settings, Key, Shield, Smartphone, Tag, LayoutList, Menu, Edit, Zap, MessageCircle, Phone, MapPin, Clock, Copy, Link as LinkIcon, BarChart2, TrendingUp, Download, Eye, PieChart } from 'lucide-react';
import { INITIAL_USER_PROFILE, MEALS } from '../constants';
import { ImageUploader } from './ImageUploader';
import { OptimizedImage } from './OptimizedImage';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'STATISTICS' | 'ORDERS' | 'STORE' | 'USERS' | 'CONTENT' | 'SUBSCRIPTIONS' | 'PLANS' | 'PROMO';

const SimpleBarChart: React.FC<{ data: { label: string, value: number }[], height?: number, color?: string }> = ({ data, height = 150, color = "#a8c038" }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="flex items-end gap-1 w-full" style={{ height: `${height}px` }}>
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative">
                    <div 
                        className="w-full rounded-t-sm transition-all duration-500 hover:opacity-80"
                        style={{ height: `${(d.value / maxVal) * 100}%`, backgroundColor: color }}
                    >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition z-10 whitespace-nowrap">
                            {d.value} زيارة
                        </div>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 rotate-0 md:rotate-0 truncate w-full text-center">{d.label}</span>
                </div>
            ))}
        </div>
    );
};

const SimpleDonutChart: React.FC<{ data: { label: string, value: number, color: string }[], total: number }> = ({ data, total }) => {
    let cumulativePercent = 0;
    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };
    return (
        <div className="relative w-40 h-40 mx-auto">
            <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full">
                {data.map((slice, i) => {
                    const percent = slice.value / total;
                    if (percent === 0) return null;
                    const start = cumulativePercent;
                    cumulativePercent += percent;
                    const [startX, startY] = getCoordinatesForPercent(start);
                    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                    const largeArcFlag = percent > 0.5 ? 1 : 0;
                    const pathData = `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
                    return <path key={i} d={pathData} fill={slice.color} className="hover:opacity-80 transition" />;
                })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="bg-white w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-inner">
                     <span className="text-xl font-bold text-uh-dark">{total}</span>
                     <span className="text-[10px] text-gray-400">طلب</span>
                 </div>
            </div>
        </div>
    );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('STATISTICS');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
      totalVisits: 0, androidClicks: 0, iosClicks: 0, mealViews: {}, visitHours: {}
  });
  const [content, setContent] = useState<SiteContent>({
      heroTitle: '', heroSubtitle: '', heroImage: '', missionTitle: '', missionText: '', featuresList: [],
      contactPhone: '', appBannerTitle1: '', appBannerHighlight: '', appBannerText: '', appBannerImage: '',
      privacyPolicy: '', returnPolicy: '', paymentPolicy: '', socialFacebook: '', socialInstagram: '', socialTwitter: '',
      linkAndroid: '', linkIOS: ''
  });

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlan, setNewPlan] = useState<Partial<SubscriptionPlan>>({ title: '', price: 0, features: [], durationLabel: 'شهر', image: '' });
  const [planFeaturesText, setPlanFeaturesText] = useState('');
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [newPromo, setNewPromo] = useState<Partial<PromoCode>>({ code: '', discountAmount: 0, isPercentage: false, type: 'SUBSCRIPTION', isActive: true });
  const [showMealModal, setShowMealModal] = useState(false);
  const [newMeal, setNewMeal] = useState<Partial<Meal>>({ name: '', description: '', image: '', price: 0, macros: { protein: 0, carbs: 0, fats: 0, calories: 0 }, ingredients: [], instructions: [] });
  const [mealIngredientsText, setMealIngredientsText] = useState('');
  const [mealInstructionsText, setMealInstructionsText] = useState('');

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    setOrders(await dataService.getOrders());
    setUsers(await authService.getAllUsers());
    setSubscriptions(await dataService.getSubscriptions());
    setMeals(await dataService.getMeals());
    setContent(await dataService.getContent());
    setPlans(await dataService.getSubscriptionPlans());
    setPromos(await dataService.getPromoCodes());
    setAnalytics(await dataService.getAnalytics());
  };

  const handleCopyLink = (type: 'mealId' | 'planId', id: string) => {
      const url = `${window.location.origin}?${type}=${id}`;
      navigator.clipboard.writeText(url);
      alert('تم نسخ الرابط المباشر إلى الحافظة!');
  };

  const handleUpdateOrderStatus = async (id: string, status: 'pending' | 'completed' | 'cancelled') => {
      await dataService.updateOrderStatus(id, status);
      const order = orders.find(o => o.id === id);
      if (order && (status === 'completed' || status === 'cancelled')) {
          const cleanPhone = order.phone.replace(/\D/g, '').replace(/^0/, '962');
          const customerName = order.user.name || 'عميلنا العزيز';
          const orderRef = order.id.slice(-6);
          let message = status === 'completed' 
            ? `مرحباً ${customerName} 👋\nيسعدنا إخبارك بأن طلبك رقم #${orderRef} من Uncle Healthy قد تم تجهيزه واكتماله! 🍽️✅\nشكراً لثقتك بنا.`
            : `مرحباً ${customerName} 👋\nنأسف لإبلاغك بأن طلبك رقم #${orderRef} قد تم إلغاؤه ❌.\nيرجى التواصل معنا للاستفسار.`;
          window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
      }
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
      setNewMeal({ name: '', description: '', image: '', price: 0, macros: { protein: 0, carbs: 0, fats: 0, calories: 0 }, ingredients: [], instructions: [] });
      setMealIngredientsText('');
      setMealInstructionsText('');
      setShowMealModal(true);
  };

  const handleSaveMeal = async () => {
      if (!newMeal.name || !newMeal.price) { alert('الرجاء إدخال اسم الوجبة والسعر'); return; }
      const mealToSave: Meal = {
          id: newMeal.id || `m_${Date.now()}`,
          name: newMeal.name,
          description: newMeal.description || '',
          image: newMeal.image || 'https://picsum.photos/400/300',
          price: Number(newMeal.price),
          macros: newMeal.macros || { protein: 0, carbs: 0, fats: 0, calories: 0 },
          ingredients: mealIngredientsText.split('\n').filter(i => i.trim()),
          instructions: mealInstructionsText.split('\n').filter(i => i.trim())
      };
      await dataService.addMeal(mealToSave);
      setMeals(await dataService.getMeals());
      setShowMealModal(false);
  };

  const handleSavePlan = async () => {
      if (!newPlan.title || !newPlan.price) { alert('الرجاء إكمال بيانات الباقة'); return; }
      const planToSave: SubscriptionPlan = {
          id: newPlan.id || `plan_${Date.now()}`,
          title: newPlan.title,
          price: Number(newPlan.price),
          durationLabel: newPlan.durationLabel || 'شهر',
          image: newPlan.image || '',
          features: planFeaturesText.split('\n').filter(f => f.trim() !== ''),
          isPopular: newPlan.isPopular || false
      };
      await dataService.saveSubscriptionPlan(planToSave);
      setPlans(await dataService.getSubscriptionPlans());
      setShowPlanModal(false);
  };

  const handleDeletePlan = async (id: string) => {
      if(confirm('حذف هذه الباقة؟')) {
          await dataService.deleteSubscriptionPlan(id);
          setPlans(await dataService.getSubscriptionPlans());
      }
  };

  const handleSavePromo = async () => {
      if (!newPromo.code || !newPromo.discountAmount) { alert('الرجاء إدخال الكود والقيمة'); return; }
      const promoToSave: PromoCode = {
          id: `promo_${Date.now()}`,
          code: newPromo.code.toUpperCase(),
          discountAmount: Number(newPromo.discountAmount),
          type: newPromo.type as 'MEALS' | 'SUBSCRIPTION',
          isPercentage: newPromo.isPercentage || false,
          isActive: true
      };
      await dataService.savePromoCode(promoToSave);
      setPromos(await dataService.getPromoCodes());
      setShowPromoModal(false);
  };

  const handleDeletePromo = async (id: string) => {
      if(confirm('حذف هذا الكود؟')) {
          await dataService.deletePromoCode(id);
          setPromos(await dataService.getPromoCodes());
      }
  };

  // Fix: Added missing getOrderStatusCounts function to provide data for the Donut Chart
  const getOrderStatusCounts = () => {
      const counts = {
          pending: orders.filter(o => o.status === 'pending').length,
          completed: orders.filter(o => o.status === 'completed').length,
          cancelled: orders.filter(o => o.status === 'cancelled').length,
      };
      return [
          { label: 'قيد الانتظار', value: counts.pending, color: '#facc15' }, // yellow-400
          { label: 'مكتمل', value: counts.completed, color: '#a8c038' },     // uh-green
          { label: 'ملغي', value: counts.cancelled, color: '#ef4444' },     // red-500
      ];
  };

  const renderSidebarItem = (tab: Tab, label: string, Icon: any) => (
      <button onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}
        className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === tab ? 'bg-uh-gold text-uh-dark font-bold' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
          <Icon size={20} /> <span>{label}</span>
      </button>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-arabic" dir="rtl">
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-uh-dark text-white transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="p-6 border-b border-white/10 flex justify-between items-center">
             <h2 className="text-xl font-brand font-bold text-white">لوحة التحكم</h2>
             <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400"><X /></button>
         </div>
         <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
             {renderSidebarItem('STATISTICS', 'الإحصائيات', BarChart2)}
             {renderSidebarItem('ORDERS', 'الطلبات', ShoppingBag)}
             {renderSidebarItem('SUBSCRIPTIONS', 'الاشتراكات', Calendar)}
             {renderSidebarItem('STORE', 'إدارة الوجبات', Package)}
             {renderSidebarItem('USERS', 'المستخدمين', Users)}
             {renderSidebarItem('PLANS', 'خطط الاشتراك', LayoutList)}
             {renderSidebarItem('PROMO', 'كوبونات الخصم', Tag)}
             {renderSidebarItem('CONTENT', 'محتوى الموقع', FileText)}
             <div className="pt-8 mt-8 border-t border-white/10">
                 <button onClick={onLogout} className="flex items-center gap-3 w-full p-3 text-red-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition">
                     <LogOut size={20} /> <span>تسجيل خروج</span>
                 </button>
             </div>
         </nav>
      </aside>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden">
              <button onClick={() => setSidebarOpen(true)} className="text-uh-dark"><Menu /></button>
              <span className="font-bold text-uh-dark">Admin Panel</span>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
              {activeTab === 'STATISTICS' && (
                  <div className="space-y-8 animate-fade-in">
                      <div className="flex justify-between items-center">
                          <h2 className="text-2xl font-bold text-uh-dark">ملخص الأداء</h2>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                              <div className="text-gray-500 text-xs mb-1">إجمالي الزيارات</div>
                              <div className="text-2xl font-bold text-uh-dark">{analytics?.totalVisits || 0} <Eye size={16} className="text-blue-500 inline ml-1"/></div>
                          </div>
                          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                              <div className="text-gray-500 text-xs mb-1">المستخدمين</div>
                              <div className="text-2xl font-bold text-uh-dark">{users.length} <Users size={16} className="text-uh-green inline ml-1"/></div>
                          </div>
                          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                              <div className="text-gray-500 text-xs mb-1">إجمالي الطلبات</div>
                              <div className="text-2xl font-bold text-uh-dark">{orders.length} <ShoppingBag size={16} className="text-uh-gold inline ml-1"/></div>
                          </div>
                          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                              <div className="text-gray-500 text-xs mb-1">تحميل التطبيق</div>
                              <div className="text-2xl font-bold text-uh-dark">{(analytics?.androidClicks || 0) + (analytics?.iosClicks || 0)} <Download size={16} className="text-purple-500 inline ml-1"/></div>
                          </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-6">
                          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                              <h3 className="font-bold text-gray-700 mb-6">أوقات الذروة</h3>
                              <SimpleBarChart data={Array.from({length: 24}).map((_, i) => ({ label: `${i}:00`, value: analytics.visitHours[String(i)] || 0 }))} />
                          </div>
                          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                              <h3 className="font-bold text-gray-700 mb-6">حالة الطلبات</h3>
                              <SimpleDonutChart data={getOrderStatusCounts()} total={orders.length || 1} />
                          </div>
                      </div>
                  </div>
              )}
              {activeTab === 'ORDERS' && (
                  <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-uh-dark">الطلبات الأخيرة</h2>
                      <div className="space-y-4">
                          {orders.map(order => (
                              <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                  <div>
                                      <div className="font-bold">#{order.id.slice(-6)} - {order.user.name}</div>
                                      <div className="text-sm text-gray-500">{order.phone} | {order.total} د.أ</div>
                                  </div>
                                  <div className="flex gap-2">
                                      {order.status === 'pending' && (
                                          <>
                                              <button onClick={() => handleUpdateOrderStatus(order.id, 'completed')} className="bg-uh-green text-white p-2 rounded"><Check size={16}/></button>
                                              <button onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')} className="bg-red-500 text-white p-2 rounded"><X size={16}/></button>
                                          </>
                                      )}
                                      <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
              {activeTab === 'STORE' && (
                  <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-uh-dark">الوجبات</h2>
                        <button onClick={handleOpenAddMeal} className="bg-uh-dark text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={18}/> إضافة</button>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                          {meals.map(meal => (
                              <div key={meal.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                  <img src={meal.image} className="w-full h-32 object-cover rounded mb-2" alt=""/>
                                  <div className="font-bold">{meal.name}</div>
                                  <div className="text-uh-green font-bold">{meal.price} د.أ</div>
                                  <div className="flex justify-end gap-2 mt-2">
                                      <button onClick={() => handleEditMeal(meal)} className="text-blue-500"><Edit size={16}/></button>
                                      <button onClick={() => handleDeleteMeal(meal.id)} className="text-red-500"><Trash2 size={16}/></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </main>
      </div>
      {showMealModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 className="text-xl font-bold">{newMeal.id ? 'تعديل الوجبة' : 'إضافة وجبة جديدة'}</h3>
                      <button onClick={() => setShowMealModal(false)}><X className="text-gray-500"/></button>
                  </div>
                  <div className="space-y-4">
                      <input placeholder="اسم الوجبة" className="w-full border p-3 rounded-lg" value={newMeal.name} onChange={e => setNewMeal({...newMeal, name: e.target.value})} />
                      <textarea placeholder="وصف الوجبة" rows={2} className="w-full border p-3 rounded-lg" value={newMeal.description} onChange={e => setNewMeal({...newMeal, description: e.target.value})} />
                      <ImageUploader label="صورة الوجبة" value={newMeal.image || ''} onChange={(url) => setNewMeal({...newMeal, image: url})} />
                      <input type="number" placeholder="السعر (د.أ)" className="w-full border p-3 rounded-lg" value={newMeal.price || ''} onChange={e => setNewMeal({...newMeal, price: Number(e.target.value)})} />
                      <div className="grid grid-cols-4 gap-2 text-center text-sm">
                          <div><label className="block mb-1 text-xs">سعرات</label><input type="number" className="w-full border p-2 rounded" value={newMeal.macros?.calories || ''} onChange={e => setNewMeal({...newMeal, macros: {...newMeal.macros!, calories: Number(e.target.value)}})} /></div>
                          <div><label className="block mb-1 text-xs">بروتين</label><input type="number" className="w-full border p-2 rounded" value={newMeal.macros?.protein || ''} onChange={e => setNewMeal({...newMeal, macros: {...newMeal.macros!, protein: Number(e.target.value)}})} /></div>
                          <div><label className="block mb-1 text-xs">كارب</label><input type="number" className="w-full border p-2 rounded" value={newMeal.macros?.carbs || ''} onChange={e => setNewMeal({...newMeal, macros: {...newMeal.macros!, carbs: Number(e.target.value)}})} /></div>
                          <div><label className="block mb-1 text-xs">دهون</label><input type="number" className="w-full border p-2 rounded" value={newMeal.macros?.fats || ''} onChange={e => setNewMeal({...newMeal, macros: {...newMeal.macros!, fats: Number(e.target.value)}})} /></div>
                      </div>
                      <textarea placeholder="المكونات (كل مكون في سطر)" rows={3} className="w-full border p-3 rounded-lg" value={mealIngredientsText} onChange={e => setMealIngredientsText(e.target.value)} />
                      <textarea placeholder="طريقة التحضير (كل خطوة في سطر)" rows={3} className="w-full border p-3 rounded-lg" value={mealInstructionsText} onChange={e => setMealInstructionsText(e.target.value)} />
                      <button onClick={handleSaveMeal} className="w-full bg-uh-green text-white font-bold py-3 rounded-lg">
                          {newMeal.id ? 'حفظ التعديلات' : 'إضافة الوجبة'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
