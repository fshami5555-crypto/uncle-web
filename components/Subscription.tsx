import React, { useState } from 'react';
import { Subscription as SubscriptionModel, SubscriptionDuration, DeliverySlot } from '../types';
import { dataService } from '../services/dataService';
import { Check, Clock, MapPin, Truck } from 'lucide-react';

export const Subscription: React.FC = () => {
  const [step, setStep] = useState(1);
  const [subData, setSubData] = useState<Partial<SubscriptionModel>>({
    duration: SubscriptionDuration.WEEKLY,
    deliverySlot: DeliverySlot.MORNING,
    address: '',
    phone: ''
  });

  const plans = [
    { id: SubscriptionDuration.WEEKLY, title: 'أسبوعي', price: 50, features: ['وجبات لمدة 6 أيام', 'توصيل مجاني', 'إمكانية تغيير الوجبات'] },
    { id: SubscriptionDuration.MONTHLY, title: 'شهري', price: 180, features: ['وجبات لمدة 24 يوم', 'توصيل مجاني', 'استشارة مجانية', 'خصم 10%'] },
  ];

  const handleSelectPlan = (id: SubscriptionDuration) => {
    setSubData(prev => ({ ...prev, duration: id }));
    setStep(2);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save Subscription
    if(subData.address && subData.phone && subData.duration && subData.deliverySlot) {
        dataService.saveSubscription({
            duration: subData.duration,
            deliverySlot: subData.deliverySlot,
            address: subData.address,
            phone: subData.phone,
            date: new Date().toISOString()
        });
    }

    alert('تم استلام طلب الاشتراك بنجاح! سيتواصل معك فريقنا قريباً.');
    setStep(1); // Reset for demo
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-brand text-uh-dark">اختر باقتك</h2>
        <p className="text-gray-500">وجبات صحية تصلك إلى باب بيتك</p>
      </div>

      {step === 1 && (
        <div className="grid md:grid-cols-2 gap-8">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white rounded-3xl p-8 shadow-lg border-2 border-transparent hover:border-uh-green transition relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-uh-gold text-uh-dark px-4 py-1 rounded-bl-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition">الأكثر طلباً</div>
              <h3 className="text-2xl font-bold mb-4">{plan.title}</h3>
              <div className="text-4xl font-brand text-uh-greenDark mb-6">{plan.price} <span className="text-lg text-gray-400">د.أ</span></div>
              <ul className="space-y-4 mb-8">
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

      {step === 2 && (
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Truck className="text-uh-gold" />
                تفاصيل التوصيل
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

                <div className="pt-4 flex gap-4">
                    <button type="button" onClick={() => setStep(1)} className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl">رجوع</button>
                    <button type="submit" className="flex-1 bg-uh-green text-white font-bold py-3 rounded-xl hover:bg-uh-greenDark shadow-lg">تأكيد الاشتراك</button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
};
