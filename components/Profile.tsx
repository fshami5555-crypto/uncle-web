import React from 'react';
import { UserProfile, Meal } from '../types';
import { Calendar, User, ChefHat, ShoppingCart, Lock } from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
  onMealClick: (mealId: string) => void;
  onAddToCart: (meal: Meal) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onMealClick, onAddToCart }) => {
  if (!user.hasProfile || !user.savedPlan) {
    return (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
            <Lock className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">لا يوجد ملف نشط حالياً.</p>
        </div>
    );
  }

  const plan = user.savedPlan;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-uh-dark text-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between shadow-xl">
        <div className="flex items-center gap-6">
          <div className="bg-uh-green p-4 rounded-full">
            <User size={40} className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-brand mb-1">أهلاً، {user.name}</h2>
            <div className="flex gap-4 text-sm text-gray-300">
                <span>{user.goal}</span> | 
                <span>{user.weight} كغ</span> | 
                <span>{user.height} سم</span>
            </div>
          </div>
        </div>
        <div className="mt-6 md:mt-0 bg-white/10 px-6 py-3 rounded-xl backdrop-blur-sm">
            <p className="text-xs text-uh-gold uppercase mb-1">حالة الاشتراك</p>
            <p className="font-bold">غير مشترك</p>
        </div>
      </div>

      {/* Saved AI Plan Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-uh-dark flex items-center gap-2">
                <Calendar className="text-uh-green" />
                جدولك الغذائي للأسبوع
            </h3>
        </div>

        <div className="space-y-4">
            {plan.map((day, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-uh-gold transition">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h4 className="font-bold text-lg text-uh-greenDark">{day.day}</h4>
                        <div className="text-sm text-gray-500">
                            مجموع السعرات: {day.breakfast.macros.calories + day.lunch.macros.calories + day.dinner.macros.calories}
                        </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                        {/* Meals */}
                        {[
                            { label: 'فطور', meal: day.breakfast },
                            { label: 'غداء', meal: day.lunch },
                            { label: 'عشاء', meal: day.dinner }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-3 items-start bg-uh-cream/30 p-3 rounded-lg hover:bg-uh-cream transition">
                                <img src={item.meal.image} alt="" className="w-16 h-16 rounded-md object-cover cursor-pointer" onClick={() => onMealClick(item.meal.id)} />
                                <div className="flex-1">
                                    <span className="text-xs font-bold text-uh-gold uppercase block">{item.label}</span>
                                    <h5 className="font-bold text-sm text-uh-dark mb-1 cursor-pointer hover:text-uh-green" onClick={() => onMealClick(item.meal.id)}>{item.meal.name}</h5>
                                    <div className="flex gap-2">
                                        <button onClick={() => onMealClick(item.meal.id)} className="text-xs flex items-center gap-1 text-gray-500 hover:text-uh-green">
                                            <ChefHat size={12} /> الوصفة
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onAddToCart(item.meal); }}
                                            className="text-xs flex items-center gap-1 text-uh-dark hover:text-uh-gold"
                                        >
                                            <ShoppingCart size={12} /> طلب
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
