import React from 'react';
import { Meal } from '../types';
import { ArrowRight, Flame, ChefHat, Info, ShoppingCart } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';

interface MealDetailProps {
  meal: Meal;
  onBack: () => void;
  onAddToCart: (meal: Meal) => void;
}

export const MealDetail: React.FC<MealDetailProps> = ({ meal, onBack, onAddToCart }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in">
      {/* Header Image */}
      <div className="relative h-64 md:h-80">
        <OptimizedImage 
            src={meal.image} 
            alt={meal.name} 
            width={800}
            className="w-full h-full"
            priority={true}
        />
        <button 
            onClick={onBack}
            className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white text-uh-dark shadow-md z-10"
        >
            <ArrowRight size={24} />
        </button>
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-6 md:p-8 z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{meal.name}</h2>
            <p className="text-gray-200 text-lg">{meal.description}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 p-6 md:p-8">
        
        {/* Left Col: Info & Ingredients */}
        <div className="md:col-span-2 space-y-8">
            {/* Macros */}
            <div className="grid grid-cols-4 gap-2 bg-uh-cream rounded-2xl p-4 text-center">
                <div>
                    <span className="block text-2xl font-bold text-uh-dark">{meal.macros.calories}</span>
                    <span className="text-xs text-gray-500 uppercase">سعرة</span>
                </div>
                <div>
                    <span className="block text-xl font-bold text-uh-greenDark">{meal.macros.protein}g</span>
                    <span className="text-xs text-gray-500 uppercase">بروتين</span>
                </div>
                <div>
                    <span className="block text-xl font-bold text-uh-greenDark">{meal.macros.carbs}g</span>
                    <span className="text-xs text-gray-500 uppercase">كارب</span>
                </div>
                <div>
                    <span className="block text-xl font-bold text-uh-greenDark">{meal.macros.fats}g</span>
                    <span className="text-xs text-gray-500 uppercase">دهون</span>
                </div>
            </div>

            {/* Ingredients */}
            <div>
                <h3 className="text-xl font-bold text-uh-dark mb-3 flex items-center gap-2">
                    <Info className="text-uh-green" /> المكونات
                </h3>
                <div className="flex flex-wrap gap-2">
                    {meal.ingredients.map((ing, idx) => (
                        <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">{ing}</span>
                    ))}
                </div>
            </div>

            {/* Recipe / Instructions */}
            <div>
                <h3 className="text-xl font-bold text-uh-dark mb-4 flex items-center gap-2">
                    <ChefHat className="text-uh-gold" /> طريقة التحضير (الوصفة)
                </h3>
                <ol className="space-y-4 relative border-r-2 border-uh-cream mr-2">
                    {meal.instructions.map((step, idx) => (
                        <li key={idx} className="pr-6 relative">
                            <span className="absolute -right-[9px] top-1 w-4 h-4 rounded-full bg-uh-green border-2 border-white ring-2 ring-uh-cream"></span>
                            <p className="text-gray-700 leading-relaxed">{step}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </div>

        {/* Right Col: Price & Action */}
        <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500">السعر</span>
                    <span className="text-3xl font-bold text-uh-green">{meal.price} د.أ</span>
                </div>
                <button 
                    onClick={() => onAddToCart(meal)}
                    className="w-full bg-uh-dark text-white py-4 rounded-xl font-bold hover:bg-black transition shadow-lg flex items-center justify-center gap-2"
                >
                    <ShoppingCart />
                    أضف للطلب
                </button>
            </div>
            
            <div className="bg-uh-gold/10 p-4 rounded-xl text-sm text-gray-700 leading-relaxed border border-uh-gold/20">
                <span className="font-bold block mb-1">نصيحة الشيف:</span>
                هذه الوجبة مثالية بعد التمرين لاحتوائها على بروتين عالي يساعد في الاستشفاء العضلي.
            </div>
        </div>
      </div>
    </div>
  );
};