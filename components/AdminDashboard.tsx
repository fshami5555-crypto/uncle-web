import React, { useState, useEffect } from 'react';
import { UserProfile, Order, Subscription, SiteContent, Meal, SubscriptionPlan, PromoCode } from '../types';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import { ShoppingBag, Users, FileText, Calendar, Package, LogOut, Check, X, Trash2, Plus, Settings, Key, Shield, Smartphone, Tag, LayoutList, Menu, Edit } from 'lucide-react';
import { INITIAL_USER_PROFILE, MEALS } from '../constants';

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
      geminiApiKey: '',
      appBannerTitle1: '', appBannerHighlight: '', appBannerText: '', appBannerImage: '',
      privacyPolicy: '', returnPolicy: '', paymentPolicy: '', socialFacebook: '', socialInstagram: '', socialTwitter: '',
      linkAndroid: '', linkIOS: ''
  });

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
      alert('تم حفظ المحتوى بنجاح');
  };

  const handleDeleteMeal = async (id: string) => {
      if(confirm('هل أنت متأكد من حذف هذه الوجبة؟')) {
          await dataService.deleteMeal(id);
          setMeals(await dataService.getMeals());
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
                      <div className="grid gap-4">
                          {orders.map(order => (
                              <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                  <div>
                                      <div className="flex items-center gap-2 mb-2">
                                          <span className="font-bold text-lg text-uh-dark">#{order.id.slice(-6)}</span>
                                          <span className={`text-xs px-2 py-1 rounded-full ${
                                              order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                              order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                          }`}>
                                              {order.status === 'completed' ? 'مكتمل' : order.status === 'cancelled' ? 'ملغي' : 'قيد الانتظار'}
                                          </span>
                                      </div>
                                      <p className="text-gray-600 text-sm">{order.user.name} | {order.phone}</p>
                                      <p className="text-gray-500 text-xs mt-1">{new Date(order.date).toLocaleString('ar-EG')}</p>
                                      <p className="font-bold text-uh-green mt-2">{order.total} د.أ</p>
                                  </div>
                                  <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                                      {order.status === 'pending' && (
                                          <div className="flex gap-2 w-full md:w-auto">
                                              <button onClick={() => handleUpdateOrderStatus(order.id, 'completed')} className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm">إكمال</button>
                                              <button onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')} className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm">إلغاء</button>
                                          </div>
                                      )}
                                      <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded w-full md:w-auto">
                                          {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                      </div>
                                  </div>
                              </div>
                          ))}
                          {orders.length === 0 && <div className="text-center text-gray-400 py-10">لا يوجد طلبات حالياً</div>}
                      </div>
                  </div>
              )}

              {/* MEALS TAB */}
              {activeTab === 'STORE' && (
                  <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-uh-dark">قائمة الوجبات</h2>
                        {/* Note: In a full app, we'd add a modal to create new meals here */}
                        <button className="bg-uh-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black"><Plus size={18}/> إضافة وجبة</button>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {meals.map(meal => (
                              <div key={meal.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 group">
                                  <img src={meal.image} alt={meal.name} className="h-40 w-full object-cover" />
                                  <div className="p-4">
                                      <h3 className="font-bold text-uh-dark">{meal.name}</h3>
                                      <p className="text-uh-green font-bold text-sm">{meal.price} د.أ</p>
                                      <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                                          <button onClick={() => handleDeleteMeal(meal.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button>
                                          <button className="text-blue-500 hover:bg-blue-50 p-2 rounded"><Edit size={18}/></button>
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
                          <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-bold mb-1">العنوان الرئيسي</label>
                                  <input value={content.heroTitle} onChange={e => setContent({...content, heroTitle: e.target.value})} className="w-full border rounded p-2" />
                              </div>
                              {/* Removed API Key management as it should be handled via environment variables */}
                          </div>
                          
                          <div>
                              <label className="block text-sm font-bold mb-1">نص المهمة (Mission)</label>
                              <textarea rows={3} value={content.missionText} onChange={e => setContent({...content, missionText: e.target.value})} className="w-full border rounded p-2" />
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
                       {subscriptions.map(sub => (
                           <div key={sub.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                               <div>
                                   <div className="font-bold text-lg text-uh-dark">{sub.planTitle}</div>
                                   <div className="text-gray-500 text-sm">{sub.phone} | {sub.deliverySlot}</div>
                                   <div className="text-gray-400 text-xs mt-1">{sub.address}</div>
                               </div>
                               <div className="text-right">
                                   <span className="block font-bold text-uh-green">{sub.pricePaid} د.أ</span>
                                   <span className="text-xs text-gray-400">{new Date(sub.date).toLocaleDateString('ar-EG')}</span>
                               </div>
                           </div>
                       ))}
                       {subscriptions.length === 0 && <div className="text-center text-gray-400 py-10">لا يوجد اشتراكات بعد</div>}
                  </div>
              )}
          </main>
      </div>
    </div>
  );
};