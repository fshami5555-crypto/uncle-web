import React, { useEffect, useState } from 'react';
import { Meal } from '../types';
import { dataService } from '../services/dataService';
import { Plus, Flame, Info, Eye } from 'lucide-react';

interface StoreProps {
  onMealClick: (mealId: string) => void;
  onAddToCart: (meal: Meal) => void;
}

export const Store: React.FC<StoreProps> = ({ onMealClick, onAddToCart }) => {
  const [meals, setMeals] = useState<Meal[]>([]);

  useEffect(() => {
      setMeals(dataService.getMeals());
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-brand text-uh-dark">قائمة الوجبات</h2>
        <p className="text-gray-500 mt-2">وجبات محضرة بعناية لتناسب احتياجاتك</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meals.map((meal: Meal) => (
          <div key={meal.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden border border-gray-100 flex flex-col group">
            <div className="relative h-48 cursor-pointer" onClick={() => onMealClick(meal.id)}>
              <img src={meal.image} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-lg text-xs font-bold text-uh-greenDark shadow-sm">
                {meal.macros.calories} سعرة
              </div>
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <span className="bg-white text-uh-dark px-4 py-2 rounded-full font-bold flex items-center gap-2 text-sm shadow-lg">
                    <Eye size={16} /> التفاصيل والوصفة
                  </span>
              </div>
            </div>
            
            <div className="p-5 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2 cursor-pointer" onClick={() => onMealClick(meal.id)}>
                <h3 className="font-bold text-lg text-uh-dark hover:text-uh-green transition">{meal.name}</h3>
                <span className="text-uh-green font-bold text-lg">{meal.price} د.أ</span>
              </div>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{meal.description}</p>
              
              <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs bg-uh-cream rounded-lg p-2">
                 <div>
                    <span className="block text-uh-greenDark font-bold">بروتين</span>
                    <span>{meal.macros.protein}g</span>
                 </div>
                 <div>
                    <span className="block text-uh-greenDark font-bold">كارب</span>
                    <span>{meal.macros.carbs}g</span>
                 </div>
                 <div>
                    <span className="block text-uh-greenDark font-bold">دهون</span>
                    <span>{meal.macros.fats}g</span>
                 </div>
              </div>

              <div className="mt-auto flex gap-2">
                 <button 
                    onClick={() => onAddToCart(meal)}
                    className="flex-1 bg-uh-dark text-white py-2 rounded-lg hover:bg-black transition flex items-center justify-center gap-2 shadow-sm"
                 >
                    <Plus size={16} />
                    <span>أضف للسلة</span>
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
