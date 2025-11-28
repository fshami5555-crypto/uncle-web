import React, { useState } from 'react';
import { CartItem, UserProfile } from '../types';
import { dataService } from '../services/dataService';
import { Trash2, Plus, Minus, MapPin, Phone, CheckCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

interface CartProps {
  items: CartItem[];
  user: UserProfile;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onBackToStore: () => void;
}

export const Cart: React.FC<CartProps> = ({ items, user, onUpdateQuantity, onRemoveItem, onClearCart, onBackToStore }) => {
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user.phone || '');
  const [isOrdered, setIsOrdered] = useState(false);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create Order Object
    const newOrder = {
        id: `ORD-${Date.now()}`,
        user: user,
        items: items,
        total: total,
        address: address,
        phone: phone,
        date: new Date().toISOString(),
        status: 'pending' as const
    };

    // Save using data service
    dataService.saveOrder(newOrder);

    setIsOrdered(true);
    setTimeout(() => {
        onClearCart();
    }, 5000); 
  };

  if (isOrdered) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6 animate-fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="text-uh-green w-12 h-12" />
        </div>
        <h2 className="text-3xl font-brand text-uh-dark">تم استلام طلبك!</h2>
        <p className="text-gray-500">شكراً لك {user.name}، سيصلك طلبك قريباً إلى العنوان المحدد.</p>
        <button onClick={onBackToStore} className="mt-8 bg-uh-dark text-white px-8 py-3 rounded-xl hover:bg-black transition">
            العودة للمتجر
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
        <ShoppingBag className="w-24 h-24 text-gray-200 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-400">سلتك فارغة</h2>
        <button onClick={onBackToStore} className="bg-uh-gold text-uh-dark px-8 py-3 rounded-xl hover:bg-yellow-500 transition font-bold">
            تصفح الوجبات
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 animate-fade-in">
      {/* Cart Items */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-uh-dark mb-4 flex items-center gap-2">
            <ShoppingBag size={24}/> سلة المشتريات
        </h2>
        {items.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                <div className="flex-1">
                    <h3 className="font-bold text-uh-dark">{item.name}</h3>
                    <div className="text-uh-green font-bold">{item.price} د.أ</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                        <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded shadow-sm disabled:opacity-50"><Minus size={14}/></button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded shadow-sm"><Plus size={14}/></button>
                    </div>
                    <button onClick={() => onRemoveItem(item.id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        ))}
        <div className="bg-uh-cream p-4 rounded-xl flex justify-between items-center font-bold text-uh-dark text-lg">
            <span>المجموع الكلي:</span>
            <span>{total.toFixed(2)} د.أ</span>
        </div>
      </div>

      {/* Checkout Form */}
      <div className="bg-white p-6 rounded-2xl shadow-lg h-fit">
        <h2 className="text-xl font-bold text-uh-dark mb-6">إتمام الطلب</h2>
        <form onSubmit={handleCheckout} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                <input disabled value={user.name || 'زائر'} className="w-full bg-gray-100 border rounded-lg p-3 text-gray-500" />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <div className="relative">
                    <input 
                        required 
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full border rounded-lg p-3 pr-10 focus:ring-2 focus:ring-uh-green outline-none" 
                        placeholder="079xxxxxxx"
                    />
                    <Phone className="absolute right-3 top-3.5 text-gray-400" size={18} />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان التوصيل</label>
                <div className="relative">
                    <textarea 
                        required 
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className="w-full border rounded-lg p-3 pr-10 focus:ring-2 focus:ring-uh-green outline-none min-h-[100px]" 
                        placeholder="المدينة، الحي، الشارع، رقم البناية..."
                    />
                    <MapPin className="absolute right-3 top-3.5 text-gray-400" size={18} />
                </div>
            </div>

            <button type="submit" className="w-full bg-uh-dark text-white font-bold py-4 rounded-xl hover:bg-black transition shadow-md mt-4 flex justify-center items-center gap-2">
                تأكيد الطلب
            </button>
        </form>
      </div>
    </div>
  );
};
