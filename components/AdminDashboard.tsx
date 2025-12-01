import React, { useState, useEffect } from 'react';
import { UserProfile, Order, Subscription, SiteContent, Meal, SubscriptionPlan, PromoCode } from '../types';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import { ShoppingBag, Users, FileText, Calendar, Package, LogOut, Check, X, Trash2, Plus, Settings, Key, Shield, Smartphone, Tag, LayoutList } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'ORDERS' | 'STORE' | 'USERS' | 'CONTENT' | 'SUBSCRIPTIONS' | 'SETTINGS' | 'POLICIES' | 'PLANS' | 'PROMO';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('ORDERS');
  
  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [content, setContent] = useState<SiteContent>({
      heroTitle: '', heroSubtitle: '', heroImage: '', missionTitle: '', missionText: '', featuresList: [],
      geminiApiKey: '',
      appBannerTitle1: '', appBannerHighlight: '', appBannerText: '', appBannerImage: '',
      privacyPolicy: '', returnPolicy: '', paymentPolicy: '', socialFacebook: '', socialInstagram: '', socialTwitter: '',
      linkAndroid: '', linkIOS: ''
  });
  const [meals, setMeals] = useState<Meal[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Inputs for Meal Add
  const [newMealName, setNewMealName] = useState('');
  const [newMealPrice, setNewMealPrice] = useState('');

  // Inputs for Plan Add
  const [newPlan, setNewPlan] = useState<Partial<SubscriptionPlan>>({ title: '', price: 0, features: [], durationLabel: '' });
  const [planFeaturesText, setPlanFeaturesText] = useState('');

  // Inputs for Promo Add
  const [newPromo, setNewPromo] = useState<Partial<PromoCode>>({ code: '', type: 'MEALS', discountAmount: 0, isPercentage: false, isActive: true });

  const fetchData = async () => {
    setLoading(true);
    try {
        if (activeTab === 'ORDERS') setOrders(await dataService.getOrders());
        if (activeTab === 'USERS') setUsers(await authService.getAllUsers());
        if (activeTab === 'SUBSCRIPTIONS') setSubscriptions(await dataService.getSubscriptions());
        if (activeTab === 'CONTENT' || activeTab === 'POLICIES' || activeTab === 'HOME' as any) setContent(await dataService.getContent());
        if (activeTab === 'STORE') setMeals(await dataService.getMeals());
        if (activeTab === 'PLANS') setPlans(await dataService.getSubscriptionPlans());
        if (activeTab === 'PROMO') setPromos(await dataService.getPromoCodes());
    } catch (e) {
        console.error("Failed to fetch data", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Handlers
  const handleStatusUpdate = async (id: string, status: any) => {
    await dataService.updateOrderStatus(id, status);
    setOrders(await dataService.getOrders());
  };

  const handleContentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await dataService.saveContent(content);
    setIsSaving(false);
    if (success) alert('تم حفظ التغييرات بنجاح ✅');
    else alert('عذراً، حدث خطأ أثناء الحفظ. ❌');
  };

  const handleDeleteMeal = async (id: string) => {
      if(window.confirm('هل أنت متأكد من حذف الوجبة؟')) {
          await dataService.deleteMeal(id);
          setMeals(await dataService.getMeals());
      }
  };

  const handleAddMeal = async () => {
      if(!newMealName || !newMealPrice) return;
      const newMeal: Meal = {
          id: `m${Date.now()}`,
          name: newMealName,
          price: Number(newMealPrice),
          description: 'وجبة جديدة',
          image: 'https://picsum.photos/400/300',
          ingredients: [],
          instructions: [],
          macros: { calories: 0, protein: 0, carbs: 0, fats: 0 }
      };
      await dataService.addMeal(newMeal);
      setMeals(await dataService.getMeals());
      setNewMealName('');
      setNewMealPrice('');
  };

  // Plan Handlers
  const handleAddPlan = async () => {
      if (!newPlan.title || !newPlan.price || !newPlan.durationLabel) return;
      
      const features = planFeaturesText.split('\n').filter(f => f.trim() !== '');
      const plan: SubscriptionPlan = {
          id: `plan_${Date.now()}`,
          title: newPlan.title,
          price: Number(newPlan.price),
          durationLabel: newPlan.durationLabel,
          features: features,
          isPopular: false
      };
      
      await dataService.saveSubscriptionPlan(plan);
      setPlans(await dataService.getSubscriptionPlans());
      setNewPlan({ title: '', price: 0, features: [], durationLabel: '' });
      setPlanFeaturesText('');
  };

  const handleDeletePlan = async (id: string) => {
      if(window.confirm('حذف هذه الباقة؟')) {
          await dataService.deleteSubscriptionPlan(id);
          setPlans(await dataService.getSubscriptionPlans());
      }
  };

  // Promo Handlers
  const handleAddPromo = async () => {
      if (!newPromo.code || !newPromo.discountAmount) return;
      
      const promo: PromoCode = {
          id: `promo_${Date.now()}`,
          code: newPromo.code,
          type: newPromo.type || 'MEALS',
          discountAmount: Number(newPromo.discountAmount),
          isPercentage: newPromo.isPercentage || false,
          isActive: true
      };

      await dataService.savePromoCode(promo);
      setPromos(await dataService.getPromoCodes());
      setNewPromo({ code: '', type: 'MEALS', discountAmount: 0, isPercentage: false });
  };

  const handleDeletePromo = async (id: string) => {
      if(window.confirm('حذف كوبون الخصم؟')) {
          await dataService.deletePromoCode(id);
          setPromos(await dataService.getPromoCodes());
      }
  };

  const renderSidebar = () => (
    <div className="w-full md:w-64 bg-uh-dark text-white p-6 flex flex-col gap-2 min-h-[300px] md:min-h-screen">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-brand text-uh-gold">لوحة الإدارة</h2>
        <p className="text-xs text-gray-400">نسخة الأدمن 1.1</p>
      </div>
      
      <button onClick={() => setActiveTab('ORDERS')} className={`flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'ORDERS' ? 'bg-uh-green text-white' : 'hover:bg-white/10'}`}>
        <ShoppingBag size={20}/> الطلبات
      </button>
      <button onClick={() => setActiveTab('SUBSCRIPTIONS')} className={`flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'SUBSCRIPTIONS' ? 'bg-uh-green text-white' : 'hover:bg-white/10'}`}>
        <Calendar size={20}/> الاشتراكات
      </button>
      <div className="h-px bg-white/10 my-2"></div>
      <button onClick={() => setActiveTab('STORE')} className={`flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'STORE' ? 'bg-uh-green text-white' : 'hover:bg-white/10'}`}>
        <Package size={20}/> إدارة الوجبات
      </button>
      <button onClick={() => setActiveTab('PLANS')} className={`flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'PLANS' ? 'bg-uh-green text-white' : 'hover:bg-white/10'}`}>
        <LayoutList size={20}/> باقات الاشتراك
      </button>
      <button onClick={() => setActiveTab('PROMO')} className={`flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'PROMO' ? 'bg-uh-green text-white' : 'hover:bg-white/10'}`}>
        <Tag size={20}/> كوبونات الخصم
      </button>
      <div className="h-px bg-white/10 my-2"></div>
      <button onClick={() => setActiveTab('USERS')} className={`flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'USERS' ? 'bg-uh-green text-white' : 'hover:bg-white/10'}`}>
        <Users size={20}/> المستخدمين
      </button>
      <button onClick={() => setActiveTab('CONTENT')} className={`flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'CONTENT' ? 'bg-uh-green text-white' : 'hover:bg-white/10'}`}>
        <FileText size={20}/> المحتوى
      </button>
      <button onClick={() => setActiveTab('POLICIES')} className={`flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'POLICIES' ? 'bg-uh-green text-white' : 'hover:bg-white/10'}`}>
        <Shield size={20}/> الروابط
      </button>
      
      <div className="flex-1"></div>

      <button onClick={onLogout} className="mt-2 flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/20 text-red-400 hover:text-red-200 transition">
        <LogOut size={20}/> تسجيل خروج
      </button>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row bg-gray-100 min-h-screen font-arabic">
      {renderSidebar()}
      
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        {loading && <div className="text-center p-4">جاري تحميل البيانات...</div>}
        
        {/* ORDERS TAB */}
        {!loading && activeTab === 'ORDERS' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-uh-dark mb-4">إدارة الطلبات ({orders.length})</h2>
            <div className="grid gap-4">
              {orders.length === 0 && <p className="text-gray-500">لا يوجد طلبات حالياً</p>}
              {orders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border-r-4 border-uh-gold flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg text-uh-dark">#{order.id.slice(-5)}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {order.status === 'pending' ? 'قيد الانتظار' : order.status === 'completed' ? 'مكتمل' : 'ملغي'}
                        </span>
                        {order.promoCode && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full border border-purple-200">كوبون: {order.promoCode}</span>}
                    </div>
                    <p className="text-gray-600 text-sm">👤 {order.user.name} | 📞 {order.phone}</p>
                    <p className="text-gray-500 text-xs mt-1">📍 {order.address}</p>
                    <div className="mt-2 text-sm font-bold text-uh-greenDark">
                        المجموع: {order.total.toFixed(2)} د.أ ({order.items.length} وجبة)
                    </div>
                  </div>
                  
                  {order.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatusUpdate(order.id, 'completed')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><Check size={20}/></button>
                        <button onClick={() => handleStatusUpdate(order.id, 'cancelled')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><X size={20}/></button>
                      </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STORE TAB */}
        {!loading && activeTab === 'STORE' && (
           <div className="space-y-6">
               <h2 className="text-2xl font-bold text-uh-dark">إدارة الوجبات</h2>
               
               {/* Add Meal */}
               <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-end">
                   <div className="flex-1 w-full">
                       <label className="text-xs text-gray-500">اسم الوجبة</label>
                       <input value={newMealName} onChange={e => setNewMealName(e.target.value)} className="w-full border rounded p-2" placeholder="اسم الوجبة الجديد" />
                   </div>
                   <div className="w-full md:w-32">
                       <label className="text-xs text-gray-500">السعر</label>
                       <input value={newMealPrice} onChange={e => setNewMealPrice(e.target.value)} type="number" className="w-full border rounded p-2" placeholder="0.0" />
                   </div>
                   <button onClick={handleAddMeal} className="bg-uh-dark text-white px-4 py-2 rounded-lg flex items-center gap-2">
                       <Plus size={16}/> إضافة
                   </button>
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {meals.map(meal => (
                       <div key={meal.id} className="bg-white p-4 rounded-xl shadow-sm relative group">
                           <img src={meal.image} className="w-full h-32 object-cover rounded-lg mb-3 opacity-80" />
                           <h3 className="font-bold">{meal.name}</h3>
                           <p className="text-uh-green font-bold">{meal.price} د.أ</p>
                           <button 
                             onClick={() => handleDeleteMeal(meal.id)}
                             className="absolute top-2 right-2 bg-white text-red-500 p-2 rounded-full shadow hover:bg-red-50 opacity-0 group-hover:opacity-100 transition"
                           >
                               <Trash2 size={16} />
                           </button>
                       </div>
                   ))}
               </div>
           </div>
        )}

        {/* PLANS TAB (NEW) */}
        {!loading && activeTab === 'PLANS' && (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-uh-dark">باقات الاشتراكات</h2>
                
                {/* Add Plan Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                    <h3 className="font-bold text-uh-greenDark">إضافة باقة جديدة</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs text-gray-500">عنوان الباقة</label>
                            <input value={newPlan.title} onChange={e => setNewPlan({...newPlan, title: e.target.value})} className="w-full border rounded p-2" placeholder="مثال: الباقة الذهبية" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">السعر</label>
                            <input type="number" value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: Number(e.target.value)})} className="w-full border rounded p-2" placeholder="0.0" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">نوع المدة (Label)</label>
                            <input value={newPlan.durationLabel} onChange={e => setNewPlan({...newPlan, durationLabel: e.target.value})} className="w-full border rounded p-2" placeholder="مثال: شهري / Weekly" />
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-xs text-gray-500">المميزات (كل ميزة في سطر)</label>
                            <textarea value={planFeaturesText} onChange={e => setPlanFeaturesText(e.target.value)} className="w-full border rounded p-2 h-20" placeholder="- ميزة 1&#10;- ميزة 2" />
                        </div>
                    </div>
                    <button onClick={handleAddPlan} className="bg-uh-dark text-white px-6 py-2 rounded-lg flex items-center gap-2">
                       <Plus size={16}/> حفظ الباقة
                    </button>
                </div>

                {/* Plans List */}
                <div className="grid md:grid-cols-2 gap-6">
                    {plans.map(plan => (
                        <div key={plan.id} className="bg-white border rounded-xl p-6 relative group hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">{plan.title}</h3>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{plan.durationLabel}</span>
                                </div>
                                <span className="text-2xl font-bold text-uh-green">{plan.price} د.أ</span>
                            </div>
                            <ul className="text-sm text-gray-600 space-y-1 mb-2">
                                {plan.features.map((f, i) => <li key={i}>• {f}</li>)}
                            </ul>
                            <button 
                                onClick={() => handleDeletePlan(plan.id)}
                                className="absolute top-4 left-4 text-red-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* PROMO CODE TAB (NEW) */}
        {!loading && activeTab === 'PROMO' && (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-uh-dark">كوبونات الخصم (Promo Codes)</h2>
                
                {/* Add Promo Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                    <h3 className="font-bold text-uh-greenDark">إنشاء كوبون جديد</h3>
                    <div className="grid md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="text-xs text-gray-500">الكود (Code)</label>
                            <input value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value})} className="w-full border rounded p-2 font-mono uppercase" placeholder="SALE20" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">يطبق على</label>
                            <select 
                                value={newPromo.type} 
                                onChange={e => setNewPromo({...newPromo, type: e.target.value as any})}
                                className="w-full border rounded p-2"
                            >
                                <option value="MEALS">طلبات الوجبات</option>
                                <option value="SUBSCRIPTION">الاشتراكات</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">قيمة الخصم</label>
                            <div className="flex gap-2">
                                <input type="number" value={newPromo.discountAmount} onChange={e => setNewPromo({...newPromo, discountAmount: Number(e.target.value)})} className="w-full border rounded p-2" placeholder="0" />
                                <div className="flex items-center gap-1 border px-2 rounded bg-gray-50">
                                    <input 
                                        type="checkbox" 
                                        checked={newPromo.isPercentage} 
                                        onChange={e => setNewPromo({...newPromo, isPercentage: e.target.checked})} 
                                    />
                                    <span className="text-xs">%</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleAddPromo} className="bg-uh-dark text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 h-10">
                           <Plus size={16}/> إنشاء
                        </button>
                    </div>
                </div>

                {/* Promo List */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 text-gray-500 text-sm">
                            <tr>
                                <th className="p-4">الكود</th>
                                <th className="p-4">النوع</th>
                                <th className="p-4">الخصم</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4">حذف</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {promos.map(promo => (
                                <tr key={promo.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-mono font-bold">{promo.code}</td>
                                    <td className="p-4">
                                        <span className={`text-xs px-2 py-1 rounded-full ${promo.type === 'MEALS' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {promo.type === 'MEALS' ? 'وجبات' : 'اشتراكات'}
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold text-uh-green">
                                        {promo.discountAmount}{promo.isPercentage ? '%' : ' د.أ'}
                                    </td>
                                    <td className="p-4 text-xs text-green-600">نشط</td>
                                    <td className="p-4">
                                        <button onClick={() => handleDeletePromo(promo.id)} className="text-red-400 hover:text-red-600">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* USERS TAB */}
        {!loading && activeTab === 'USERS' && (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-uh-dark">المستخدمين المسجلين ({users.length})</h2>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 text-gray-500 text-sm">
                            <tr>
                                <th className="p-4">الاسم</th>
                                <th className="p-4">الهاتف</th>
                                <th className="p-4">العمر</th>
                                <th className="p-4">الهدف</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.map((u, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="p-4 font-bold">{u.name} {u.isAdmin && '(مدير)'}</td>
                                    <td className="p-4 font-mono text-gray-600">{u.phone}</td>
                                    <td className="p-4">{u.age}</td>
                                    <td className="p-4 text-uh-greenDark text-sm">{u.goal}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* CONTENT TAB */}
        {!loading && activeTab === 'CONTENT' && (
             <div className="space-y-6">
                <h2 className="text-2xl font-bold text-uh-dark">تعديل نصوص الصفحة الرئيسية</h2>
                <form onSubmit={handleContentSave} className="bg-white p-8 rounded-xl shadow-sm space-y-6 max-w-4xl">
                    
                    {/* Hero Section */}
                    <div className="border-b pb-6">
                        <h3 className="text-lg font-bold text-uh-greenDark mb-4">الواجهة الرئيسية (Hero)</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">العنوان الرئيسي</label>
                                <input value={content.heroTitle} onChange={e => setContent({...content, heroTitle: e.target.value})} className="w-full border rounded-lg p-3" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">الوصف الفرعي</label>
                                <textarea value={content.heroSubtitle} onChange={e => setContent({...content, heroSubtitle: e.target.value})} className="w-full border rounded-lg p-3 h-20" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">رابط الصورة</label>
                                <input value={content.heroImage} onChange={e => setContent({...content, heroImage: e.target.value})} className="w-full border rounded-lg p-3 text-left" dir="ltr" />
                            </div>
                        </div>
                    </div>

                    {/* App Banner Section */}
                    <div className="border-b pb-6">
                         <h3 className="text-lg font-bold text-uh-greenDark mb-4 flex items-center gap-2">
                             <Smartphone size={20} />
                             بنر التطبيق
                         </h3>
                         <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                             <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">العنوان الأول (السطر 1)</label>
                                <input value={content.appBannerTitle1} onChange={e => setContent({...content, appBannerTitle1: e.target.value})} className="w-full border rounded-lg p-3" />
                             </div>
                             <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">النص المميز (السطر 2 - ملون)</label>
                                <input value={content.appBannerHighlight} onChange={e => setContent({...content, appBannerHighlight: e.target.value})} className="w-full border rounded-lg p-3" />
                             </div>
                             <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">وصف التطبيق</label>
                                <textarea value={content.appBannerText} onChange={e => setContent({...content, appBannerText: e.target.value})} className="w-full border rounded-lg p-3 h-20" />
                             </div>
                             <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">رابط صورة التطبيق</label>
                                <input value={content.appBannerImage} onChange={e => setContent({...content, appBannerImage: e.target.value})} className="w-full border rounded-lg p-3 text-left" dir="ltr" />
                             </div>
                         </div>
                    </div>

                    {/* Mission Section */}
                    <div className="border-b pb-6">
                        <h3 className="text-lg font-bold text-uh-greenDark mb-4">قسم من نحن / مهمتنا</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">العنوان</label>
                                <input value={content.missionTitle} onChange={e => setContent({...content, missionTitle: e.target.value})} className="w-full border rounded-lg p-3" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">النص التعريفي</label>
                                <textarea value={content.missionText} onChange={e => setContent({...content, missionText: e.target.value})} className="w-full border rounded-lg p-3 h-24" />
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div>
                        <h3 className="text-lg font-bold text-uh-greenDark mb-4">قسم "لماذا نحن" (المميزات)</h3>
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">القائمة (كل ميزة في سطر جديد)</label>
                             <textarea 
                                value={content.featuresList ? content.featuresList.join('\n') : ''} 
                                onChange={e => setContent({...content, featuresList: e.target.value.split('\n')})} 
                                className="w-full border rounded-lg p-3 h-32" 
                                placeholder="ميزة 1&#10;ميزة 2&#10;ميزة 3"
                             />
                        </div>
                    </div>
                    
                    <button type="submit" disabled={isSaving} className="bg-uh-gold text-uh-dark font-bold px-8 py-3 rounded-lg hover:bg-yellow-500 w-full md:w-auto disabled:opacity-50">
                        {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>
                </form>
             </div>
        )}

        {/* POLICIES & LINKS TAB */}
        {!loading && activeTab === 'POLICIES' && (
             <div className="space-y-6">
                <h2 className="text-2xl font-bold text-uh-dark">إدارة الروابط والصفحات القانونية</h2>
                <form onSubmit={handleContentSave} className="bg-white p-8 rounded-xl shadow-sm space-y-6 max-w-3xl">
                    
                    {/* Gemini API Key Section */}
                    <div className="bg-blue-50 p-4 rounded-xl space-y-4 border border-blue-100">
                        <div className="flex items-center gap-2 border-b border-blue-200 pb-2 mb-2">
                             <Key size={18} className="text-blue-700"/>
                             <h3 className="font-bold text-blue-900">إعدادات الذكاء الاصطناعي (AI Configuration)</h3>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Gemini API Key</label>
                            <input 
                                value={content.geminiApiKey || ''} 
                                onChange={e => setContent({...content, geminiApiKey: e.target.value})} 
                                className="w-full border rounded p-2 text-sm font-mono text-gray-600 bg-white" 
                                dir="ltr" 
                                type="password"
                                placeholder="AIzaSy..."
                            />
                            <p className="text-[10px] text-gray-500 mt-1">يستخدم هذا المفتاح لتشغيل الشات بوت وتوليد الخطط الغذائية.</p>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                        <h3 className="font-bold text-uh-greenDark border-b pb-2 mb-2">روابط التواصل الاجتماعي</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Facebook URL</label>
                                <input value={content.socialFacebook} onChange={e => setContent({...content, socialFacebook: e.target.value})} className="w-full border rounded p-2 text-sm" dir="ltr"/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Instagram URL</label>
                                <input value={content.socialInstagram} onChange={e => setContent({...content, socialInstagram: e.target.value})} className="w-full border rounded p-2 text-sm" dir="ltr"/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Twitter (X) URL</label>
                                <input value={content.socialTwitter} onChange={e => setContent({...content, socialTwitter: e.target.value})} className="w-full border rounded p-2 text-sm" dir="ltr"/>
                            </div>
                        </div>
                    </div>

                    {/* App Links */}
                    <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                        <div className="flex items-center gap-2 border-b pb-2 mb-2">
                             <Smartphone size={18} className="text-uh-greenDark"/>
                             <h3 className="font-bold text-uh-greenDark">روابط تحميل التطبيق</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">رابط Google Play (Android)</label>
                                <input value={content.linkAndroid} onChange={e => setContent({...content, linkAndroid: e.target.value})} className="w-full border rounded p-2 text-sm" dir="ltr" placeholder="https://play.google.com..."/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">رابط App Store (iOS)</label>
                                <input value={content.linkIOS} onChange={e => setContent({...content, linkIOS: e.target.value})} className="w-full border rounded p-2 text-sm" dir="ltr" placeholder="https://apps.apple.com..."/>
                            </div>
                        </div>
                    </div>

                    {/* Policies Text */}
                    <div className="space-y-6 pt-4 border-t">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">نص سياسة الاستخدام والخصوصية</label>
                            <textarea 
                                value={content.privacyPolicy}
                                onChange={e => setContent({...content, privacyPolicy: e.target.value})}
                                className="w-full border rounded-lg p-3 h-32 focus:ring-2 focus:ring-uh-green outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">نص سياسة الإرجاع</label>
                            <textarea 
                                value={content.returnPolicy}
                                onChange={e => setContent({...content, returnPolicy: e.target.value})}
                                className="w-full border rounded-lg p-3 h-32 focus:ring-2 focus:ring-uh-green outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">نص صفحة نظام الدفع</label>
                            <textarea 
                                value={content.paymentPolicy}
                                onChange={e => setContent({...content, paymentPolicy: e.target.value})}
                                className="w-full border rounded-lg p-3 h-32 focus:ring-2 focus:ring-uh-green outline-none" 
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={isSaving} className="bg-uh-gold text-uh-dark font-bold px-8 py-3 rounded-lg hover:bg-yellow-500 w-full md:w-auto disabled:opacity-50">
                        {isSaving ? 'جاري الحفظ...' : 'حفظ التحديثات'}
                    </button>
                </form>
             </div>
        )}
        
        {/* SUBSCRIPTIONS TAB */}
        {!loading && activeTab === 'SUBSCRIPTIONS' && (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-uh-dark">طلبات الاشتراك ({subscriptions.length})</h2>
                <div className="grid gap-4">
                    {subscriptions.map((sub, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border-r-4 border-blue-500">
                             <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{sub.planTitle || sub.duration}</h3>
                                    <p className="text-gray-500 text-sm mt-1">📞 {sub.phone}</p>
                                    <p className="text-gray-500 text-sm">📍 {sub.address}</p>
                                </div>
                                <div className="text-left">
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold block mb-2">
                                        {sub.deliverySlot}
                                    </span>
                                    <span className="text-xs text-gray-400">{new Date(sub.date).toLocaleDateString('ar-EG')}</span>
                                    {sub.pricePaid && <div className="mt-1 font-bold text-uh-green">{sub.pricePaid} د.أ</div>}
                                </div>
                             </div>
                        </div>
                    ))}
                    {subscriptions.length === 0 && <p className="text-gray-500">لا يوجد اشتراكات حتى الآن</p>}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
