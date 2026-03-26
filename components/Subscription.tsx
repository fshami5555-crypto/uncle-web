
import React, { useState, useEffect } from 'react';
import { Subscription as SubscriptionModel, DeliverySlot, SubscriptionPlan } from '../types';
import { dataService } from '../services/dataService';
import { Check, Clock, MapPin, Truck, Tag, Edit3, Phone, Share2, ChevronRight, ChevronLeft, MessageCircle } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { motion, AnimatePresence } from 'motion/react';
import { MealTable } from './MealTable';

interface SubscriptionProps {
    initialPlanId?: string | null;
    onPlanClick?: (planId: string) => void;
    onClearInitialPlan?: () => void;
}

export const Subscription: React.FC<SubscriptionProps> = ({ initialPlanId, onPlanClick, onClearInitialPlan }) => {
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  
  const [subData, setSubData] = useState<Partial<SubscriptionModel>>({
    deliverySlot: DeliverySlot.MORNING,
    address: '',
    phone: '',
    notes: ''
  });
  
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoMessage, setPromoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
        setPlans(await dataService.getSubscriptionPlans());
    };
    fetchPlans();
  }, []);

  useEffect(() => {
      if (initialPlanId && plans.length > 0) {
          const exists = plans.some(p => p.id === initialPlanId);
          if (exists) {
              setSelectedPlanId(initialPlanId);
              setSubData(prev => ({ ...prev, duration: initialPlanId }));
              setStep(2);
          }
      } else if (!initialPlanId) {
          setSelectedPlanId(null);
          setStep(1);
      }
  }, [initialPlanId, plans]);

  const handleSelectPlan = (id: string) => {
    if (onPlanClick) {
        onPlanClick(id);
    } else {
        setSelectedPlanId(id);
        setSubData(prev => ({ ...prev, duration: id }));
        setStep(2);
        window.history.pushState({}, '', `?planId=${id}`);
    }
    setDiscount(0);
    setAppliedPromo(null);
    setPromoCode('');
    setPromoMessage('');
  };

  const handleSharePlan = (e: React.MouseEvent, planId: string) => {
      e.stopPropagation();
      const url = `${window.location.origin}?planId=${planId}`;
      navigator.clipboard.writeText(url);
      setCopiedId(planId);
      setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyPromo = async () => {
      if (!promoCode) return;
      const promo = await dataService.verifyPromoCode(promoCode.toUpperCase(), 'SUBSCRIPTION');
      if (promo) {
          const selectedPlan = plans.find(p => p.id === selectedPlanId);
          if (selectedPlan) {
             let discVal = 0;
             if (promo.isPercentage) {
                 discVal = selectedPlan.price * (promo.discountAmount / 100);
             } else {
                 discVal = promo.discountAmount;
             }
             setDiscount(discVal);
             setAppliedPromo(promo.code);
             setPromoMessage('تم تفعيل الخصم بنجاح! 🎉');
          }
      } else {
          setPromoMessage('كود الخصم غير صالح أو غير مخصص للاشتراكات ❌');
          setDiscount(0);
          setAppliedPromo(null);
      }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const selectedPlan = plans.find(p => p.id === selectedPlanId);

    if(subData.address && subData.phone && selectedPlanId && subData.deliverySlot && selectedPlan) {
        const finalPrice = Math.max(0, selectedPlan.price - discount);
        
        // WhatsApp Integration
        const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '962788078118';
        const message = `مرحباً Uncle Healthy، أود الاشتراك في باقة: ${selectedPlan.title}
التفاصيل:
- العنوان: ${subData.address}
- الهاتف: ${subData.phone}
- وقت التوصيل: ${subData.deliverySlot === DeliverySlot.MORNING ? 'صباحي' : 'مسائي'}
- السعر: ${finalPrice.toFixed(2)} د.أ
- ملاحظات: ${subData.notes || 'لا يوجد'}
- الكود المستخدم: ${appliedPromo || 'لا يوجد'}`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
        
        alert('تم تجهيز طلب الاشتراك! سيتم توجيهك للواتساب لإتمام العملية.');
        setStep(1);
        setSelectedPlanId(null);
        setSubData({ deliverySlot: DeliverySlot.MORNING, address: '', phone: '', notes: '' });
        if (onClearInitialPlan) onClearInitialPlan();
    }
    setLoading(false);
  };

  const nextPlan = () => {
    setCarouselIndex((prev) => (prev + 1) % plans.length);
  };

  const prevPlan = () => {
    setCarouselIndex((prev) => (prev - 1 + plans.length) % plans.length);
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <div className="max-w-6xl mx-auto py-8 mb-20 md:mb-0 px-4">
      <div className="text-center mb-12">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-brand text-uh-dark mb-2"
        >
          اختر باقتك الصحية
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 text-lg"
        >
          وجبات فاخرة تصلك يومياً أينما كنت
        </motion.p>
      </div>

      {step === 1 && (
        <div className="space-y-16">
          {/* Carousel Section */}
          <div className="relative overflow-hidden py-8">
            <div className="flex items-center justify-center gap-4 md:gap-8">
              <button 
                onClick={prevPlan}
                className="hidden md:flex bg-white shadow-lg p-4 rounded-full text-uh-dark hover:bg-uh-green hover:text-white transition-all z-10"
              >
                <ChevronRight size={24} />
              </button>

              <div className="w-full max-w-4xl overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={carouselIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="grid md:grid-cols-1 gap-8"
                  >
                    {plans.length > 0 && (
                      <div className="bg-white rounded-[2.5rem] shadow-2xl border-2 border-transparent hover:border-uh-green transition-all duration-500 relative overflow-hidden group flex flex-col md:flex-row max-w-3xl mx-auto">
                        {plans[carouselIndex].image && (
                          <div className="md:w-1/2 h-64 md:h-auto overflow-hidden relative">
                              <OptimizedImage 
                                src={plans[carouselIndex].image} 
                                alt={plans[carouselIndex].title} 
                                width={800} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                              />
                              <button 
                                onClick={(e) => handleSharePlan(e, plans[carouselIndex].id)}
                                className="absolute top-4 left-4 bg-white/90 p-3 rounded-full hover:bg-white text-uh-dark shadow-lg z-20 transition active:scale-90"
                                title="مشاركة الباقة"
                              >
                                  {copiedId === plans[carouselIndex].id ? <Check size={20} className="text-green-600"/> : <Share2 size={20} />}
                              </button>
                          </div>
                        )}
                        
                        {plans[carouselIndex].isPopular && (
                            <div className="absolute top-0 right-0 bg-uh-gold text-uh-dark px-6 py-2 rounded-bl-3xl text-sm font-bold shadow-md z-10">الأكثر طلباً</div>
                        )}
                        
                        <div className="p-10 flex flex-col flex-1 md:w-1/2">
                          <h3 className="text-3xl font-bold text-uh-dark mb-2">{plans[carouselIndex].title}</h3>
                          <div className="text-5xl font-brand text-uh-greenDark mb-8">
                            {plans[carouselIndex].price} 
                            <span className="text-lg text-gray-400 mr-2">د.أ</span> 
                            <span className="text-sm text-gray-400 font-sans">/ {plans[carouselIndex].durationLabel}</span>
                          </div>
                          
                          <ul className="space-y-4 mb-10 flex-1">
                              {plans[carouselIndex].features.map((f, i) => (
                                  <li key={i} className="flex items-center gap-4 text-gray-600 text-lg">
                                      <div className="bg-uh-green/10 p-1 rounded-full">
                                        <Check className="text-uh-green" size={18} />
                                      </div>
                                      {f}
                                  </li>
                              ))}
                          </ul>
                          <button 
                              onClick={() => handleSelectPlan(plans[carouselIndex].id)}
                              className="w-full bg-uh-dark text-white py-4 rounded-2xl font-bold text-xl hover:bg-black transition-all shadow-xl hover:shadow-uh-green/20 active:scale-95"
                          >
                              اختيار الباقة
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <button 
                onClick={nextPlan}
                className="hidden md:flex bg-white shadow-lg p-4 rounded-full text-uh-dark hover:bg-uh-green hover:text-white transition-all z-10"
              >
                <ChevronLeft size={24} />
              </button>
            </div>

            {/* Mobile Controls */}
            <div className="flex justify-center gap-4 mt-8 md:hidden">
              <button onClick={prevPlan} className="bg-white shadow-md p-3 rounded-full"><ChevronRight /></button>
              <div className="flex items-center gap-2">
                {plans.map((_, i) => (
                  <div key={i} className={`h-2 rounded-full transition-all ${carouselIndex === i ? 'w-8 bg-uh-green' : 'w-2 bg-gray-300'}`} />
                ))}
              </div>
              <button onClick={nextPlan} className="bg-white shadow-md p-3 rounded-full"><ChevronLeft /></button>
            </div>
          </div>

          {/* Meal Table Section */}
          <MealTable />
        </div>
      )}

      {step === 2 && selectedPlan && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] shadow-2xl p-10 max-w-2xl mx-auto border border-uh-cream"
        >
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Truck className="text-uh-gold" size={28} />
                تفاصيل الاشتراك: <span className="text-uh-green">{selectedPlan.title}</span>
            </h3>
            
            <form onSubmit={handleDetailsSubmit} className="space-y-8">
                <div className="group">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 transition-colors group-focus-within:text-uh-green">
                        <MapPin size={18}/> عنوان التوصيل بالتفصيل
                    </label>
                    <input 
                        required 
                        value={subData.address}
                        onChange={e => setSubData({...subData, address: e.target.value})}
                        className="w-full border-2 border-gray-100 rounded-2xl p-4 bg-gray-50 focus:bg-white focus:border-uh-green outline-none transition-all" 
                        placeholder="المدينة، الحي، اسم الشارع، رقم البناية..." 
                    />
                </div>

                <div className="group">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 transition-colors group-focus-within:text-uh-green">
                        <Phone size={18}/> رقم الهاتف
                    </label>
                    <input 
                         required
                         type="tel"
                         value={subData.phone}
                         onChange={e => setSubData({...subData, phone: e.target.value})}
                         className="w-full border-2 border-gray-100 rounded-2xl p-4 bg-gray-50 focus:bg-white focus:border-uh-green outline-none transition-all" 
                         placeholder="079xxxxxxx"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Clock size={18}/> وقت التوصيل المفضل
                    </label>
                    <div className="grid grid-cols-2 gap-6">
                        <div 
                            onClick={() => setSubData({...subData, deliverySlot: DeliverySlot.MORNING})}
                            className={`p-6 border-2 rounded-2xl cursor-pointer text-center transition-all ${subData.deliverySlot === DeliverySlot.MORNING ? 'border-uh-green bg-green-50 text-uh-greenDark shadow-md' : 'border-gray-100 hover:bg-gray-50'}`}
                        >
                            <span className="block font-bold text-lg">صباحي</span>
                            <span className="text-sm text-gray-500">10:00 - 12:00</span>
                        </div>
                        <div 
                            onClick={() => setSubData({...subData, deliverySlot: DeliverySlot.EVENING})}
                            className={`p-6 border-2 rounded-2xl cursor-pointer text-center transition-all ${subData.deliverySlot === DeliverySlot.EVENING ? 'border-uh-green bg-green-50 text-uh-greenDark shadow-md' : 'border-gray-100 hover:bg-gray-50'}`}
                        >
                            <span className="block font-bold text-lg">مسائي</span>
                            <span className="text-sm text-gray-500">15:00 - 17:00</span>
                        </div>
                    </div>
                </div>

                <div className="group">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 transition-colors group-focus-within:text-uh-green">
                        <Edit3 size={18}/> ملاحظات إضافية (اختياري)
                    </label>
                    <textarea 
                         rows={3}
                         value={subData.notes}
                         onChange={e => setSubData({...subData, notes: e.target.value})}
                         className="w-full border-2 border-gray-100 rounded-2xl p-4 bg-gray-50 focus:bg-white focus:border-uh-green outline-none transition-all" 
                         placeholder="هل لديك تعليمات خاصة للتوصيل أو ملاحظات غذائية؟"
                    />
                </div>

                <div className="bg-uh-cream/30 p-6 rounded-[2rem] border-2 border-uh-cream/50">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <Tag size={18}/> لديك كوبون خصم?
                    </label>
                    <div className="flex gap-3">
                        <input 
                            value={promoCode}
                            onChange={e => setPromoCode(e.target.value)}
                            disabled={!!appliedPromo}
                            className="flex-1 border-2 border-white rounded-xl p-3 uppercase font-mono text-sm outline-none shadow-inner"
                            placeholder="CODE"
                        />
                        {appliedPromo ? (
                            <button type="button" onClick={() => { setAppliedPromo(null); setDiscount(0); setPromoCode(''); setPromoMessage(''); }} className="text-red-500 text-sm font-bold px-4 hover:bg-red-50 rounded-xl transition">إلغاء</button>
                        ) : (
                            <button type="button" onClick={handleApplyPromo} className="bg-uh-dark text-white px-6 rounded-xl text-sm font-bold hover:bg-black transition shadow-md">تطبيق</button>
                        )}
                    </div>
                    {promoMessage && <p className={`text-sm mt-3 font-medium ${appliedPromo ? 'text-green-600' : 'text-red-500'}`}>{promoMessage}</p>}
                </div>

                <div className="border-t-2 border-gray-50 pt-8">
                    <div className="flex justify-between text-gray-500 mb-2">
                        <span>سعر الباقة</span>
                        <span className="font-bold">{selectedPlan.price} د.أ</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-green-600 mb-2 font-bold">
                            <span>خصم الكوبون</span>
                            <span>- {discount.toFixed(2)} د.أ</span>
                        </div>
                    )}
                    <div className="flex justify-between text-3xl font-bold text-uh-dark mt-4">
                        <span>الإجمالي</span>
                        <span className="text-uh-greenDark">{(Math.max(0, selectedPlan.price - discount)).toFixed(2)} د.أ</span>
                    </div>
                </div>

                <div className="pt-8 flex flex-col md:flex-row gap-4">
                    <button 
                        type="button" 
                        onClick={() => {
                            setStep(1);
                            setSelectedPlanId(null);
                            if (onClearInitialPlan) onClearInitialPlan();
                            window.history.pushState({}, '', window.location.pathname);
                        }} 
                        className="px-8 py-4 text-gray-500 hover:bg-gray-100 rounded-2xl font-bold transition"
                    >
                        رجوع
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="flex-1 bg-uh-green text-white font-bold py-4 rounded-2xl hover:bg-uh-greenDark shadow-xl shadow-uh-green/20 disabled:opacity-50 flex items-center justify-center gap-3 text-xl transition-all active:scale-95"
                    >
                        {loading ? 'جاري المعالجة...' : (
                          <>
                            <MessageCircle size={24} />
                            تأكيد وإرسال عبر واتساب
                          </>
                        )}
                    </button>
                </div>
            </form>
        </motion.div>
      )}
    </div>
  );
};
