import React, { useState, useEffect } from 'react';
import { Subscription as SubscriptionModel, DeliverySlot, SubscriptionPlan } from '../types';
import { dataService } from '../services/dataService';
import { Check, Clock, MapPin, Truck, Tag } from 'lucide-react';

export const Subscription: React.FC = () => {
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  const [subData, setSubData] = useState<Partial<SubscriptionModel>>({
    deliverySlot: DeliverySlot.MORNING,
    address: '',
    phone: ''
  });
  
  // Promo Logic
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

  const handleSelectPlan = (id: string) => {
    setSelectedPlanId(id);
    setSubData(prev => ({ ...prev, duration: id }));
    setStep(2);
    // Reset Promo when changing plans
    setDiscount(0);
    setAppliedPromo(null);
    setPromoCode('');
    setPromoMessage('');
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
        
        await dataService.saveSubscription({
            duration: selectedPlan.durationLabel, // Store label for readability
            deliverySlot: subData.deliverySlot,
            address: subData.address,
            phone: subData.phone,
            date: new Date().toISOString(),
            planTitle: selectedPlan.title,
            pricePaid: finalPrice
        });
    }

    setLoading(false);
    alert('تم استلام طلب الاشتراك بنجاح! سيتواصل معك فريقنا قريباً.');
    setStep(1);
    setSelectedPlanId(null);
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-brand text-uh-dark">اختر باقتك</h2>
        <p className="text-gray-500">وجبات صحية تصلك إلى باب بيتك</p>
      </div>

      {step === 1 && (
        <div className="grid md:grid-cols-2 gap-8">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white rounded-3xl p-8 shadow-lg border-2 border-transparent hover:border-uh-green transition relative overflow-hidden group flex flex-col">
              {plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-uh-gold text-uh-dark px-4 py-1 rounded-bl-xl text-sm font-bold shadow-sm">الأكثر طلباً</div>
              )}
              <h3 className="text-2xl font-bold mb-4">{plan.title}</h3>
              <div className="text-4xl font-brand text-uh-greenDark mb-6">{plan.price} <span className="text-lg text-gray-400">د.أ</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-600">
                        <Check className="text-uh-green" size={18} />
                        {f}
                    </li>
                ))}
              </ul>
              <button 
                onClick={() => handleSelectPlan(plan.id)}
                className="w-full bg-uh-dark text-white py-3 rounded-xl font-bold hover:bg-black transition"
              >
                اختيار الباقة
              </button>
            </div>
          ))}
        </div>
      )}

      {step === 2 && selectedPlan && (
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Truck className="text-uh-gold" />
                تفاصيل الاشتراك: <span className="text-uh-green">{selectedPlan.title}</span>
            </h3>
            
            <form onSubmit={handleDetailsSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin size={16}/> عنوان التوصيل
                    </label>
                    <input 
                        required 
                        value={subData.address}
                        onChange={e => setSubData({...subData, address: e.target.value})}
                        className="w-full border rounded-lg p-3 bg-gray-50" 
                        placeholder="المدينة، الحي، الشارع..." 
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Clock size={16}/> وقت التوصيل المفضل
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <div 
                            onClick={() => setSubData({...subData, deliverySlot: DeliverySlot.MORNING})}
                            className={`p-4 border rounded-xl cursor-pointer text-center transition ${subData.deliverySlot === DeliverySlot.MORNING ? 'border-uh-green bg-green-50' : 'hover:bg-gray-50'}`}
                        >
                            <span className="block font-bold">صباحي</span>
                            <span className="text-xs text-gray-500">10:00 - 12:00</span>
                        </div>
                        <div 
                            onClick={() => setSubData({...subData, deliverySlot: DeliverySlot.EVENING})}
                            className={`p-4 border rounded-xl cursor-pointer text-center transition ${subData.deliverySlot === DeliverySlot.EVENING ? 'border-uh-green bg-green-50' : 'hover:bg-gray-50'}`}
                        >
                            <span className="block font-bold">مسائي</span>
                            <span className="text-xs text-gray-500">15:00 - 17:00</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف للتواصل</label>
                    <input 
                         required
                         type="tel"
                         value={subData.phone}
                         onChange={e => setSubData({...subData, phone: e.target.value})}
                         className="w-full border rounded-lg p-3 bg-gray-50" 
                         placeholder="079xxxxxxx"
                    />
                </div>

                {/* Promo Code Section */}
                <div className="bg-uh-cream/50 p-4 rounded-xl border border-uh-cream">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Tag size={16}/> لديك كوبون خصم؟
                    </label>
                    <div className="flex gap-2">
                        <input 
                            value={promoCode}
                            onChange={e => setPromoCode(e.target.value)}
                            disabled={!!appliedPromo}
                            className="flex-1 border rounded-lg p-2 uppercase font-mono text-sm"
                            placeholder="CODE"
                        />
                        {appliedPromo ? (
                            <button type="button" onClick={() => { setAppliedPromo(null); setDiscount(0); setPromoCode(''); setPromoMessage(''); }} className="text-red-500 text-sm font-bold px-2">إلغاء</button>
                        ) : (
                            <button type="button" onClick={handleApplyPromo} className="bg-uh-dark text-white px-4 rounded-lg text-sm">تطبيق</button>
                        )}
                    </div>
                    {promoMessage && <p className={`text-xs mt-2 ${appliedPromo ? 'text-green-600' : 'text-red-500'}`}>{promoMessage}</p>}
                </div>

                {/* Pricing Summary */}
                <div className="border-t pt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>سعر الباقة</span>
                        <span>{selectedPlan.price} د.أ</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600 mb-1 font-bold">
                            <span>خصم الكوبون</span>
                            <span>- {discount.toFixed(2)} د.أ</span>
                        </div>
                    )}
                    <div className="flex justify-between text-xl font-bold text-uh-dark mt-2">
                        <span>الإجمالي</span>
                        <span>{(Math.max(0, selectedPlan.price - discount)).toFixed(2)} د.أ</span>
                    </div>
                </div>

                <div className="pt-4 flex gap-4">
                    <button type="button" onClick={() => setStep(1)} className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl">رجوع</button>
                    <button type="submit" disabled={loading} className="flex-1 bg-uh-green text-white font-bold py-3 rounded-xl hover:bg-uh-greenDark shadow-lg disabled:opacity-50">
                        {loading ? 'جاري المعالجة...' : 'تأكيد الاشتراك'}
                    </button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
};
