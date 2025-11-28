import React, { useState, useEffect } from 'react';
import { UserProfile, Order, Subscription, SiteContent, Meal } from '../types';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import { ShoppingBag, Users, FileText, Calendar, Package, LogOut, Check, X, Trash2, Plus, Settings, Key, Shield } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'ORDERS' | 'STORE' | 'USERS' | 'CONTENT' | 'SUBSCRIPTIONS' | 'SETTINGS' | 'POLICIES';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('ORDERS');
  
  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [content, setContent] = useState<SiteContent>(dataService.getContent());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [apiKey, setApiKey] = useState('');

  // Inputs for Meal Add (Simplified)
  const [newMealName, setNewMealName] = useState('');
  const [newMealPrice, setNewMealPrice] = useState('');

  useEffect(() => {
    setOrders(dataService.getOrders());
    setUsers(authService.getAllUsers());
    setSubscriptions(dataService.getSubscriptions());
    setContent(dataService.getContent());
    setMeals(dataService.getMeals());
    setApiKey(dataService.getApiKey());
  }, [activeTab]); // Refresh on tab switch

  // Handlers
  const handleStatusUpdate = (id: string, status: any) => {
    dataService.updateOrderStatus(id, status);
    setOrders(dataService.getOrders());
  };

  const handleContentSave = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.saveContent(content);
    alert('تم حفظ المحتوى بنجاح');
  };

  const handleApiKeySave = (e: React.FormEvent) => {
      e.preventDefault();
      dataService.saveApiKey(apiKey);
      alert('تم تحديث مفتاح API بنجاح');
  };

  const handleDeleteMeal = (id: string) => {
      if(window.confirm('هل أنت متأكد من حذف الوجبة؟')) {
          dataService.deleteMeal(id);
          setMeals(dataService.getMeals());
      }
  };

  const handleAddMeal = () => {
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
      dataService.addMeal(newMeal);
      setMeals(dataService.getMeals());
      setNewMealName('');
      setNewMealPrice('');
  };

  const renderSidebar = () => (
    <div className="w-full md:w-64 bg-uh-dark text-white p-6 flex flex-col gap-2 min-h-[300px] md:min-h-screen">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-brand text-uh-gold">لوحة الإدارة</h2>
        <p className="text-xs text-gray-400">نسخة الأدمن 1.0</p>
      </div>
      
      <button onClick={() => setActiveTab('ORDERS')} className={`flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'ORDERS' ? 'bg-uh-green text-white' : 'hover:bg-white/10'}`}>
        <ShoppingBag size={20}/> الطلبات
      </button>
      <button onClick={() => setActiveTab('STORE')} className={`flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'STORE' ? 'bg-uh-green text-white' : 'hover:bg-white/10'}`}>
        <Package size={20}/> المتجر (وجبات)
      </button>
      <button onClick={() => setActiveTab('USERS')} className={`flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'USERS' ? 'bg-uh-green text-white' : 'hover:bg-white/10'}`}>
        <Users size={20}/> المستخدمين
      </button>
      <button onClick={() => setActiveTab('CONTENT')} className={`flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'CONTENT' ? 'bg-uh-green text-white' : 'hover:bg-white/10'}`}>
        <FileText size={20}/> المحتوى النصي
      </button>
      <button onClick={() => setActiveTab('POLICIES')} className={`flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'POLICIES' ? 'bg-uh-green text-white' : 'hover:bg-white/10'}`}>
        <Shield size={20}/> الصفحات والروابط
      </button>
      <button onClick={() => setActiveTab('SUBSCRIPTIONS')} className={`flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'SUBSCRIPTIONS' ? 'bg-uh-green text-white' : 'hover:bg-white/10'}`}>
        <Calendar size={20}/> الاشتراكات
      </button>
      
      <div className="flex-1"></div>

      <button onClick={() => setActiveTab('SETTINGS')} className={`flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'SETTINGS' ? 'bg-uh-green text-white' : 'hover:bg-white/10'}`}>
        <Settings size={20}/> الإعدادات
      </button>

      <button onClick={onLogout} className="mt-2 flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/20 text-red-400 hover:text-red-200 transition">
        <LogOut size={20}/> تسجيل خروج
      </button>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row bg-gray-100 min-h-screen font-arabic">
      {renderSidebar()}
      
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* ORDERS TAB */}
        {activeTab === 'ORDERS' && (
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
                    </div>
                    <p className="text-gray-600 text-sm">👤 {order.user.name} | 📞 {order.phone}</p>
                    <p className="text-gray-500 text-xs mt-1">📍 {order.address}</p>
                    <div className="mt-2 text-sm font-bold text-uh-greenDark">
                        المجموع: {order.total} د.أ ({order.items.length} وجبة)
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
        {activeTab === 'STORE' && (
           <div className="space-y-6">
               <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-uh-dark">إدارة الوجبات</h2>
               </div>
               
               {/* Simple Add Meal */}
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

        {/* USERS TAB */}
        {activeTab === 'USERS' && (
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
        {activeTab === 'CONTENT' && (
             <div className="space-y-6">
                <h2 className="text-2xl font-bold text-uh-dark">تعديل نصوص الموقع</h2>
                <form onSubmit={handleContentSave} className="bg-white p-8 rounded-xl shadow-sm space-y-6 max-w-2xl">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">عنوان الصفحة الرئيسية (Hero Title)</label>
                        <input 
                            value={content.heroTitle}
                            onChange={e => setContent({...content, heroTitle: e.target.value})}
                            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-uh-green outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">الوصف الرئيسي (Hero Subtitle)</label>
                        <textarea 
                            value={content.heroSubtitle}
                            onChange={e => setContent({...content, heroSubtitle: e.target.value})}
                            className="w-full border rounded-lg p-3 h-24 focus:ring-2 focus:ring-uh-green outline-none" 
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">رابط الصورة الرئيسية</label>
                        <input 
                            value={content.heroImage || ''}
                            onChange={e => setContent({...content, heroImage: e.target.value})}
                            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-uh-green outline-none" 
                            dir="ltr"
                            placeholder="https://..."
                        />
                    </div>
                    <div className="border-t pt-4">
                         <label className="block text-sm font-bold text-gray-700 mb-2">عنوان قسم المهمة</label>
                         <input 
                            value={content.missionTitle}
                            onChange={e => setContent({...content, missionTitle: e.target.value})}
                            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-uh-green outline-none" 
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">نص المهمة</label>
                         <textarea 
                            value={content.missionText}
                            onChange={e => setContent({...content, missionText: e.target.value})}
                            className="w-full border rounded-lg p-3 h-24 focus:ring-2 focus:ring-uh-green outline-none" 
                        />
                    </div>
                    <button type="submit" className="bg-uh-gold text-uh-dark font-bold px-8 py-3 rounded-lg hover:bg-yellow-500 w-full md:w-auto">
                        حفظ التغييرات
                    </button>
                </form>
             </div>
        )}

        {/* POLICIES TAB */}
        {activeTab === 'POLICIES' && (
             <div className="space-y-6">
                <h2 className="text-2xl font-bold text-uh-dark">الصفحات القانونية والروابط</h2>
                <form onSubmit={handleContentSave} className="bg-white p-8 rounded-xl shadow-sm space-y-6 max-w-3xl">
                    
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

                    {/* Policies */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">سياسة الاستخدام والخصوصية</label>
                        <textarea 
                            value={content.privacyPolicy}
                            onChange={e => setContent({...content, privacyPolicy: e.target.value})}
                            className="w-full border rounded-lg p-3 h-32 focus:ring-2 focus:ring-uh-green outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">سياسة الإرجاع</label>
                        <textarea 
                            value={content.returnPolicy}
                            onChange={e => setContent({...content, returnPolicy: e.target.value})}
                            className="w-full border rounded-lg p-3 h-32 focus:ring-2 focus:ring-uh-green outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">نظام الدفع</label>
                        <textarea 
                            value={content.paymentPolicy}
                            onChange={e => setContent({...content, paymentPolicy: e.target.value})}
                            className="w-full border rounded-lg p-3 h-32 focus:ring-2 focus:ring-uh-green outline-none" 
                        />
                    </div>

                    <button type="submit" className="bg-uh-gold text-uh-dark font-bold px-8 py-3 rounded-lg hover:bg-yellow-500 w-full md:w-auto">
                        حفظ التحديثات
                    </button>
                </form>
             </div>
        )}

        {/* SUBSCRIPTIONS TAB */}
        {activeTab === 'SUBSCRIPTIONS' && (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-uh-dark">طلبات الاشتراك ({subscriptions.length})</h2>
                <div className="grid gap-4">
                    {subscriptions.map((sub, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border-r-4 border-blue-500">
                             <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{sub.duration === 'Weekly' ? 'اشتراك أسبوعي' : 'اشتراك شهري'}</h3>
                                    <p className="text-gray-500 text-sm mt-1">📞 {sub.phone}</p>
                                    <p className="text-gray-500 text-sm">📍 {sub.address}</p>
                                </div>
                                <div className="text-left">
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold block mb-2">
                                        {sub.deliverySlot}
                                    </span>
                                    <span className="text-xs text-gray-400">{new Date(sub.date).toLocaleDateString('ar-EG')}</span>
                                </div>
                             </div>
                        </div>
                    ))}
                    {subscriptions.length === 0 && <p className="text-gray-500">لا يوجد اشتراكات حتى الآن</p>}
                </div>
            </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'SETTINGS' && (
             <div className="space-y-6">
                <h2 className="text-2xl font-bold text-uh-dark">إعدادات النظام</h2>
                
                <form onSubmit={handleApiKeySave} className="bg-white p-8 rounded-xl shadow-sm space-y-6 max-w-2xl">
                    <div className="flex items-center gap-2 mb-4 text-uh-greenDark bg-uh-cream p-3 rounded-lg">
                        <Key size={24} />
                        <span className="font-bold">إعدادات Gemini AI</span>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Gemini API Key</label>
                        <div className="relative">
                            <input 
                                type="password"
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                className="w-full border rounded-lg p-3 pr-10 focus:ring-2 focus:ring-uh-green outline-none font-mono" 
                                placeholder="AIzaSy..."
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            هذا المفتاح يستخدم لتشغيل المساعد الذكي وتوليد الجداول الغذائية.
                        </p>
                    </div>

                    <button type="submit" className="bg-uh-dark text-white font-bold px-8 py-3 rounded-lg hover:bg-black w-full md:w-auto">
                        حفظ المفتاح
                    </button>
                </form>
             </div>
        )}
      </div>
    </div>
  );
};
