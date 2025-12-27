
import React, { useState, useEffect } from 'react';
import { Subscription, UserProfile, SubscriptionPlan, DeliverySlot, Meal, DayConfig } from '../types';
import { dataService } from '../services/dataService';
import { ChefHat, LogOut, Clock, MapPin, Phone, Truck, CheckCircle, AlertTriangle, Calendar, User, Info, RefreshCcw, Plus, Trash2, X, ChevronDown, ChevronUp, CalendarDays, Edit3, Hash } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';

interface ChefDashboardProps {
  onLogout: () => void;
  user: UserProfile;
}

export const ChefDashboard: React.FC<ChefDashboardProps> = ({ onLogout, user }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'out-for-delivery' | 'delivered'>('all');
  
  // Modals States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  
  // Role Permission Flags
  const isEmployee = user.isEmployee;

  // Day Editing State
  const [activeDayEdit, setActiveDayEdit] = useState<{subId: string, date: string, mealsPerDay: number} | null>(null);
  const [dayEditForm, setDayEditForm] = useState<DayConfig>({ mealIds: [], status: 'pending' });

  const [newSub, setNewSub] = useState({
      customerName: '',
      phone: '',
      address: '',
      planId: '',
      totalMeals: 30,
      mealsPerDay: 1, // New field: 1, 2, or 3
      deliverySlot: DeliverySlot.MORNING,
      notes: '',
      allergies: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [subsData, plansData, mealsData] = await Promise.all([
        dataService.getSubscriptions(),
        dataService.getSubscriptionPlans(),
        dataService.getMeals()
    ]);
    setSubscriptions(subsData);
    setPlans(plansData);
    setMeals(mealsData);
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, updates: Partial<Subscription>) => {
      try {
          await dataService.updateSubscription(id, updates);
          setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      } catch (err) {
          alert('فشل في تحديث الحالة');
      }
  };

  const handleDeleteSubscription = async (id: string) => {
      if (isEmployee) return;
      if (confirm('هل أنت متأكد من حذف هذا الاشتراك نهائياً من النظام؟ لا يمكن التراجع عن هذه الخطوة.')) {
          try {
              await dataService.deleteSubscription(id);
              setSubscriptions(prev => prev.filter(s => s.id !== id));
              alert('تم حذف الاشتراك بنجاح');
          } catch (err) {
              alert('حدث خطأ أثناء محاولة الحذف');
          }
      }
  };

  const handleAddSub = async (e: React.FormEvent) => {
      if (isEmployee) return;
      e.preventDefault();
      const selectedPlan = plans.find(p => p.id === newSub.planId);
      if (!selectedPlan) { alert('يرجى اختيار باقة'); return; }

      const subscription: Subscription = {
          id: `sub_chef_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          address: newSub.address,
          phone: newSub.phone,
          deliverySlot: newSub.deliverySlot,
          planTitle: selectedPlan.title,
          pricePaid: selectedPlan.price,
          duration: selectedPlan.durationLabel,
          mealsPerDay: Number(newSub.mealsPerDay),
          status: 'active',
          totalMeals: Number(newSub.totalMeals),
          deliveredCount: 0,
          postponedCount: 0,
          notes: newSub.notes,
          dailyConfigs: {},
          user: {
              id: newSub.phone,
              name: newSub.customerName,
              phone: newSub.phone,
              allergies: newSub.allergies,
              hasProfile: true,
              age: '', gender: '', height: '', weight: '', goal: ''
          }
      };

      await dataService.saveSubscription(subscription);
      setShowAddModal(false);
      setNewSub({ customerName: '', phone: '', address: '', planId: '', totalMeals: 30, mealsPerDay: 1, deliverySlot: DeliverySlot.MORNING, notes: '', allergies: '' });
      loadData();
  };

  const handleDayClick = (sub: Subscription, date: string) => {
      if (isEmployee) return;
      const existing = sub.dailyConfigs?.[date] || { mealIds: [], status: 'pending' };
      
      // Ensure mealIds array is initialized with correct length
      const initialMealIds = [...existing.mealIds];
      while (initialMealIds.length < sub.mealsPerDay) {
          initialMealIds.push('');
      }
      
      setActiveDayEdit({ subId: sub.id, date, mealsPerDay: sub.mealsPerDay });
      setDayEditForm({ ...existing, mealIds: initialMealIds });
      setShowDayModal(true);
  };

  const saveDayConfig = async () => {
      if (!activeDayEdit || isEmployee) return;
      const sub = subscriptions.find(s => s.id === activeDayEdit.subId);
      if (!sub) return;

      const newConfigs = { ...sub.dailyConfigs, [activeDayEdit.date]: dayEditForm };
      await handleUpdateStatus(sub.id, { dailyConfigs: newConfigs });
      setShowDayModal(false);
  };

  const handlePostpone = async (sub: Subscription) => {
      if(confirm('سيتم تأجيل وجبة اليوم وإضافة يوم إضافي للاشتراك. متابعة؟')) {
          const newPostponedCount = (sub.postponedCount || 0) + 1;
          const todayKey = new Date().toISOString().split('T')[0];
          
          const newConfigs = { ...sub.dailyConfigs };
          if (newConfigs[todayKey]) {
              newConfigs[todayKey].status = 'postponed';
          } else {
              newConfigs[todayKey] = { mealIds: [], status: 'postponed' };
          }

          await handleUpdateStatus(sub.id, {
              status: 'active',
              postponedCount: newPostponedCount,
              dailyConfigs: newConfigs,
              departureTime: '',
              arrivalTime: ''
          });
          alert('تم التأجيل وتمديد المدة');
      }
  };

  const renderMonthlySchedule = (sub: Subscription) => {
      const startDate = new Date(sub.date);
      const totalDaysToShow = 30 + (sub.postponedCount || 0);
      const days = Array.from({ length: totalDaysToShow });
      
      return (
          <div className="mt-4 border-t pt-4 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-uh-dark flex items-center gap-2">
                      <CalendarDays size={18} className="text-uh-green" />
                      الجدول الزمني (ممتد لـ {totalDaysToShow} يوم)
                  </h4>
                  {!isEmployee && <p className="text-xs text-gray-400">اضغط على اليوم لبرمجة الوجبات الـ {sub.mealsPerDay}</p>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {days.map((_, idx) => {
                      const currentDate = new Date(startDate);
                      currentDate.setDate(startDate.getDate() + idx);
                      const dateKey = currentDate.toISOString().split('T')[0];
                      const config = sub.dailyConfigs?.[dateKey];
                      const isToday = currentDate.toDateString() === new Date().toDateString();
                      const isPast = currentDate < new Date(new Date().setHours(0,0,0,0));
                      const activeMeals = config?.mealIds?.filter(id => id).map(id => meals.find(m => m.id === id)) || [];

                      return (
                          <div 
                            key={idx} 
                            onClick={() => handleDayClick(sub, dateKey)}
                            className={`p-2 rounded-xl text-center border transition-all ${!isEmployee ? 'cursor-pointer hover:scale-105' : ''} ${
                                isToday ? 'bg-uh-gold/10 border-uh-gold' : 
                                config?.status === 'postponed' ? 'bg-red-50 border-red-200' :
                                isPast ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-100'
                            }`}
                          >
                              <div className="text-[10px] text-gray-400 mb-1">
                                  {currentDate.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                              </div>
                              <div className="text-xs font-bold">يوم {idx + 1}</div>
                              
                              {activeMeals.length > 0 && (
                                  <div className="mt-1 space-y-0.5">
                                      {activeMeals.map((m, i) => (
                                          <div key={i} className="text-[8px] bg-uh-green/10 text-uh-greenDark rounded px-1 truncate font-bold">
                                              {m ? m.name : 'صنف مخصص'}
                                          </div>
                                      ))}
                                      <div className="text-[8px] font-bold text-uh-dark">الإجمالي: {activeMeals.length}</div>
                                  </div>
                              )}

                              {config?.status === 'postponed' && (
                                  <div className="text-[8px] text-red-500 font-bold mt-1">مؤجل ⏳</div>
                              )}
                              {isToday && <div className="text-[8px] bg-uh-green text-white rounded mt-1 px-1">اليوم</div>}
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  };

  const filteredSubs = subscriptions.filter(s => filter === 'all' || s.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-arabic" dir="rtl">
      {/* Header */}
      <header className="bg-uh-dark text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3">
              <div className="bg-uh-green p-2 rounded-lg"><ChefHat size={24} /></div>
              <h1 className="text-xl font-bold">لوحة {isEmployee ? 'موظف' : 'مطبخ'} Uncle Healthy</h1>
          </div>
          <div className="flex items-center gap-4">
              {!isEmployee && (
                  <button onClick={() => setShowAddModal(true)} className="bg-uh-gold text-uh-dark px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-500 transition shadow-sm">
                      <Plus size={20}/> <span>إضافة اشتراك</span>
                  </button>
              )}
              <button onClick={onLogout} className="text-red-400 hover:text-red-300 transition font-bold flex items-center gap-2"><LogOut size={20}/> <span>خروج</span></button>
          </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-6">
          
          {/* Dashboard Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400 font-bold mb-1">الوجبات الموزعة</p>
                  <p className="text-2xl font-bold text-uh-green">{subscriptions.reduce((sum, s) => sum + (s.deliveredCount || 0), 0)}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400 font-bold mb-1">الوجبات المتبقية</p>
                  <p className="text-2xl font-bold text-uh-dark">{subscriptions.reduce((sum, s) => sum + (s.totalMeals - (s.deliveredCount || 0)), 0)}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400 font-bold mb-1">الطلبات النشطة</p>
                  <p className="text-2xl font-bold text-blue-500">{subscriptions.filter(s => s.status !== 'delivered').length}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400 font-bold mb-1">أيام التأجيل</p>
                  <p className="text-2xl font-bold text-red-500">{subscriptions.reduce((sum, s) => sum + (s.postponedCount || 0), 0)}</p>
              </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {['all', 'active', 'out-for-delivery', 'delivered'].map((f) => (
                  <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${filter === f ? 'bg-uh-dark text-white' : 'bg-white text-gray-500 border hover:bg-gray-50'}`}>
                      {f === 'all' ? 'الكل' : f === 'active' ? 'بانتظار التجهيز' : f === 'out-for-delivery' ? 'في الطريق' : 'تم التسليم'}
                  </button>
              ))}
          </div>

          <div className="grid gap-6">
              {filteredSubs.map(sub => {
                  const customer = sub.user;
                  const isExpanded = expandedSubId === sub.id;
                  const todayKey = new Date().toISOString().split('T')[0];
                  const todayConfig = sub.dailyConfigs?.[todayKey];
                  const todayMeals = todayConfig?.mealIds?.filter(id => id).map(id => meals.find(m => m.id === id)) || [];
                  const remaining = sub.totalMeals - (sub.deliveredCount || 0);

                  return (
                      <div key={sub.id} className={`bg-white rounded-3xl shadow-sm border overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-uh-green' : 'border-gray-100'}`}>
                          <div className="grid md:grid-cols-3">
                              
                              <div className="p-6 border-l border-gray-50 relative group">
                                  {!isEmployee && (
                                      <button 
                                        onClick={() => handleDeleteSubscription(sub.id)}
                                        className="absolute top-2 left-2 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition opacity-0 group-hover:opacity-100"
                                        title="حذف الاشتراك نهائياً"
                                      >
                                          <Trash2 size={18} />
                                      </button>
                                  )}
                                  
                                  <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => setExpandedSubId(isExpanded ? null : sub.id)}>
                                      <div className="w-12 h-12 bg-uh-cream rounded-full flex items-center justify-center text-uh-dark font-bold"><User size={24}/></div>
                                      <div>
                                          <h3 className="font-bold text-lg text-uh-dark">{customer?.name}</h3>
                                          <div className="flex gap-2 items-center">
                                              <span className="text-[10px] bg-uh-gold/20 text-uh-greenDark px-2 py-0.5 rounded-full font-bold">{sub.planTitle}</span>
                                              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">بدأ في: {sub.date}</span>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                      <a href={`tel:${sub.phone}`} className="flex items-center gap-2 text-blue-600 font-bold"><Phone size={14}/> {sub.phone}</a>
                                      <p className="text-gray-500 flex items-start gap-2"><MapPin size={14} className="mt-1 flex-shrink-0"/> {sub.address}</p>
                                  </div>
                              </div>

                              <div className="p-6 bg-gray-50/50 border-l border-gray-50 cursor-pointer" onClick={() => setExpandedSubId(isExpanded ? null : sub.id)}>
                                  <div className="flex justify-between items-start mb-4">
                                      <h4 className="text-xs font-bold text-gray-400 uppercase">مهمة لليوم ({sub.mealsPerDay} وجبات)</h4>
                                      <div className="flex gap-1">
                                          <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-full font-bold">المتبقي: {remaining}</span>
                                          {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                      </div>
                                  </div>
                                  
                                  {todayMeals.length > 0 ? (
                                      <div className="bg-white p-3 rounded-2xl shadow-sm border border-uh-green/20 space-y-2">
                                          {todayMeals.map((meal, idx) => (
                                              <div key={idx} className="flex items-center gap-3">
                                                  {meal && <img src={meal.image} className="w-8 h-8 rounded-lg object-cover" alt=""/>}
                                                  <p className="font-bold text-xs">{meal ? meal.name : 'وجبة مخصصة'}</p>
                                              </div>
                                          ))}
                                          <div className="pt-1 border-t text-[10px] text-uh-green font-bold">نظام {sub.mealsPerDay} وجبة يومياً</div>
                                      </div>
                                  ) : (
                                      <div className="text-center py-4 text-gray-400 text-xs italic">لا توجد وجبات مبرمجة لليوم</div>
                                  )}

                                  <div className="mt-3 p-2 rounded-xl bg-red-50 text-red-700 text-xs font-bold">
                                      ⚠️ {customer?.allergies || 'لا توجد ملاحظات صحية'}
                                  </div>
                              </div>

                              <div className="p-6 flex flex-col justify-between">
                                  <div className="flex justify-between items-center mb-4">
                                      <span className="text-[10px] text-gray-400 font-bold uppercase">الحالة: {sub.status}</span>
                                      <div className="flex items-center gap-1 text-uh-greenDark font-bold text-xs"><Clock size={12}/> {sub.deliverySlot}</div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                      {sub.status !== 'delivered' ? (
                                          <>
                                              {sub.status === 'active' && (
                                                  <button onClick={() => handleUpdateStatus(sub.id, { status: 'out-for-delivery', departureTime: new Date().toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}) })} className="col-span-2 bg-uh-dark text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition shadow-sm"><Truck size={16}/> خروج الطلب</button>
                                              )}
                                              {sub.status === 'out-for-delivery' && (
                                                  <button onClick={() => handleUpdateStatus(sub.id, { status: 'delivered', arrivalTime: new Date().toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}), deliveredCount: (sub.deliveredCount || 0) + sub.mealsPerDay })} className="col-span-2 bg-uh-green text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-uh-greenDark transition shadow-md"><CheckCircle size={16}/> تم التسليم</button>
                                              )}
                                              <button onClick={() => handlePostpone(sub)} className="col-span-2 border border-red-200 text-red-500 py-2 rounded-xl text-xs font-bold hover:bg-red-50 transition">تأجيل لليوم (تمديد الاشتراك)</button>
                                          </>
                                      ) : (
                                          <div className="col-span-2 bg-green-50 text-green-700 py-2 rounded-xl text-center font-bold text-xs border border-green-100 animate-pulse">اكتمل التوصيل اليوم ✅</div>
                                      )}
                                  </div>
                              </div>
                          </div>
                          
                          {isExpanded && <div className="p-6 bg-gray-50/20 border-t border-gray-100">{renderMonthlySchedule(sub)}</div>}
                      </div>
                  );
              })}
          </div>
      </main>

      {/* Day Editing Modal */}
      {showDayModal && activeDayEdit && !isEmployee && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
                  <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2 text-uh-dark">
                          <Edit3 className="text-uh-green" />
                          <h3 className="font-bold text-xl">برمجة يوم: {activeDayEdit.date}</h3>
                      </div>
                      <button onClick={() => setShowDayModal(false)} className="text-gray-400 hover:text-uh-dark"><X/></button>
                  </div>
                  
                  <div className="space-y-6">
                      <div className="space-y-4">
                          <p className="text-sm font-bold text-uh-greenDark">نظام الوجبات: {activeDayEdit.mealsPerDay} وجبة يومياً</p>
                          {dayEditForm.mealIds.map((mealId, idx) => (
                              <div key={idx}>
                                  <label className="block text-xs font-bold mb-1">الوجبة {idx + 1}</label>
                                  <select 
                                    className="w-full border p-3 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-uh-green transition"
                                    value={mealId}
                                    onChange={e => {
                                        const newMealIds = [...dayEditForm.mealIds];
                                        newMealIds[idx] = e.target.value;
                                        setDayEditForm({...dayEditForm, mealIds: newMealIds});
                                    }}
                                  >
                                      <option value="">اختر وجبة من المتجر...</option>
                                      {meals.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                  </select>
                              </div>
                          ))}
                      </div>

                      <div className="bg-uh-cream/50 p-4 rounded-xl border border-uh-cream text-[10px] text-uh-greenDark leading-relaxed">
                          ⚠️ سيتم تسجيل {activeDayEdit.mealsPerDay} وجبات عند تأكيد توصيل هذا اليوم.
                      </div>

                      <button onClick={saveDayConfig} className="w-full bg-uh-green text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-uh-greenDark transition transform hover:-translate-y-1">حفظ إعدادات اليوم</button>
                  </div>
              </div>
          </div>
      )}

      {/* Add Subscription Modal */}
      {showAddModal && !isEmployee && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
              <div className="bg-white rounded-3xl w-full max-w-xl p-8 shadow-2xl my-8 relative">
                  <div className="flex justify-between items-center mb-6 border-b pb-4">
                      <h3 className="text-xl font-bold flex items-center gap-2"><Plus className="text-uh-green" /> تفعيل اشتراك زبون جديد</h3>
                      <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-red-500 transition"><X /></button>
                  </div>
                  
                  <form onSubmit={handleAddSub} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                          <input required placeholder="اسم الزبون الكامل" className="border p-4 rounded-xl bg-gray-50 outline-none focus:bg-white transition" value={newSub.customerName} onChange={e => setNewSub({...newSub, customerName: e.target.value})} />
                          <input required type="tel" placeholder="رقم هاتف الزبون" className="border p-4 rounded-xl bg-gray-50 outline-none focus:bg-white transition" value={newSub.phone} onChange={e => setNewSub({...newSub, phone: e.target.value})} />
                      </div>
                      <textarea required placeholder="العنوان بالتفصيل" className="w-full border p-4 rounded-xl bg-gray-50 outline-none focus:bg-white transition" rows={2} value={newSub.address} onChange={e => setNewSub({...newSub, address: e.target.value})} />
                      
                      <div className="grid md:grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-gray-400 mb-1 block uppercase">باقة الاشتراك</label>
                              <select required className="w-full border p-4 rounded-xl bg-gray-50 outline-none" value={newSub.planId} onChange={e => setNewSub({...newSub, planId: e.target.value})}>
                                  <option value="">اختر باقة...</option>
                                  {plans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-uh-greenDark mb-1 block uppercase">نظام الوجبات اليومي</label>
                              <select required className="w-full border p-4 rounded-xl bg-uh-cream outline-none font-bold" value={newSub.mealsPerDay} onChange={e => setNewSub({...newSub, mealsPerDay: Number(e.target.value)})}>
                                  <option value={1}>وجبة واحدة يومياً</option>
                                  <option value={2}>وجبتين يومياً</option>
                                  <option value={3}>ثلاث وجبات يومياً</option>
                              </select>
                          </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                             <label className="text-xs font-bold text-gray-400 mb-1 block uppercase">رصيد الوجبات الإجمالي</label>
                             <input type="number" className="w-full border p-4 rounded-xl bg-gray-50 outline-none" value={newSub.totalMeals} onChange={e => setNewSub({...newSub, totalMeals: Number(e.target.value)})} />
                          </div>
                          <div>
                             <label className="text-xs font-bold text-gray-400 mb-1 block uppercase">فترة التوصيل</label>
                             <select className="w-full border p-4 rounded-xl bg-gray-50 outline-none" value={newSub.deliverySlot} onChange={e => setNewSub({...newSub, deliverySlot: e.target.value as DeliverySlot})}>
                                  <option value={DeliverySlot.MORNING}>صباحي</option>
                                  <option value={DeliverySlot.EVENING}>مسائي</option>
                             </select>
                          </div>
                      </div>

                      <button type="submit" className="w-full bg-uh-green text-white font-bold py-4 rounded-2xl shadow-lg mt-4 hover:bg-uh-greenDark transition-all active:scale-95">حفظ وتفعيل عضوية الزبون</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

const Minus: React.FC<{size?: number}> = ({size = 24}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
