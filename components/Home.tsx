import React, { useEffect, useState } from 'react';
import { PageView, SiteContent } from '../types';
import { dataService } from '../services/dataService';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface HomeProps {
  onStart: () => void;
}

export const Home: React.FC<HomeProps> = ({ onStart }) => {
  const [content, setContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    setContent(dataService.getContent());
  }, []);

  // Use defaults if loading or not found (though dataService provides defaults)
  const heroTitle = content?.heroTitle || "نمط حياة خفيف وصحي للجميع";
  const heroSubtitle = content?.heroSubtitle || "انكل هيلثي هو وجهتك الأولى للوجبات الصحية الفاخرة. نجمع بين الذكاء الاصطناعي والمكونات الطبيعية 100% لنقدم لك تجربة غذائية لا تُنسى.";
  const heroImage = content?.heroImage || "https://i.ibb.co/6J8BHK9s/28.jpg";
  const missionTitle = content?.missionTitle || "مهمتنا";
  const missionText = content?.missionText || "توفير وجبات صحية فاخرة مصنوعة من مكونات طبيعية 100%. نحن نجعل الحياة الصحية بسيطة، لذيذة، ومتاحة للجميع. ليس مجرد طعام، بل أسلوب حياة.";

  // Split hero title to highlight the second word if needed, simplified here
  const titleParts = heroTitle.split(' ');
  const titleStart = titleParts.slice(0, 2).join(' ');
  const titleEnd = titleParts.slice(2).join(' ');

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-6 text-center md:text-right">
          <h1 className="text-4xl md:text-6xl font-bold text-uh-dark leading-tight font-brand">
             {heroTitle}
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed max-w-xl ml-auto">
            {heroSubtitle}
          </p>
          <button 
            onClick={onStart}
            className="bg-uh-gold hover:bg-yellow-500 text-uh-dark font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 flex items-center gap-2 mx-auto md:mx-0"
          >
            <span>ابدأ رحلتك الصحية</span>
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="flex-1">
          <img 
            src={heroImage} 
            alt="Healthy Bowl" 
            className="rounded-3xl shadow-2xl rotate-3 border-4 border-white"
          />
        </div>
      </div>

      {/* Features / About */}
      <div className="grid md:grid-cols-2 gap-12 bg-white p-8 rounded-2xl shadow-sm">
        <div className="space-y-4">
          <h2 className="text-3xl font-brand text-uh-greenDark">{missionTitle}</h2>
          <p className="text-gray-600 leading-loose">
            {missionText}
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-brand text-uh-greenDark">لماذا نحن؟</h2>
          <ul className="space-y-3">
            {[
              'مكونات طبيعية 100%',
              'استشارات مدعومة بالذكاء الاصطناعي',
              'نظام اشتراك مرن',
              'توصيل دقيق في الموعد'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-700">
                <CheckCircle className="text-uh-green" size={20} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};