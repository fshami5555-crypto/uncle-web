import React, { useEffect, useState } from 'react';
import { PageView, SiteContent } from '../types';
import { dataService } from '../services/dataService';
import { ArrowLeft, CheckCircle, Smartphone, Star } from 'lucide-react';

interface HomeProps {
  onStart: () => void;
}

export const Home: React.FC<HomeProps> = ({ onStart }) => {
  const [content, setContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    const fetch = async () => {
        setContent(await dataService.getContent());
    };
    fetch();
  }, []);

  // Use defaults if loading or not found
  const heroTitle = content?.heroTitle || "نمط حياة خفيف وصحي للجميع";
  const heroSubtitle = content?.heroSubtitle || "انكل هيلثي هو وجهتك الأولى للوجبات الصحية الفاخرة. نجمع بين الذكاء الاصطناعي والمكونات الطبيعية 100% لنقدم لك تجربة غذائية لا تُنسى.";
  const heroImage = content?.heroImage || "https://i.ibb.co/6J8BHK9s/28.jpg";
  const missionTitle = content?.missionTitle || "مهمتنا";
  const missionText = content?.missionText || "توفير وجبات صحية فاخرة مصنوعة من مكونات طبيعية 100%. نحن نجعل الحياة الصحية بسيطة، لذيذة، ومتاحة للجميع. ليس مجرد طعام، بل أسلوب حياة.";
  
  // Dynamic Features List
  const featuresList = content?.featuresList || [
    'مكونات طبيعية 100%',
    'استشارات مدعومة بالذكاء الاصطناعي',
    'نظام اشتراك مرن',
    'توصيل دقيق في الموعد'
  ];

  // App Banner Dynamic Content
  const appTitle1 = content?.appBannerTitle1 || "صحتك صارت";
  const appHighlight = content?.appBannerHighlight || "أسهل وأقرب";
  const appText = content?.appBannerText || "حمل التطبيق الآن واستمتع بتجربة طلب أسرع، تتبع لخطتك الغذائية، وعروض حصرية. وجباتك الصحية بلمسة زر.";
  const appImage = content?.appBannerImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80";

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 animate-fade-in">
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
            className="rounded-3xl shadow-2xl rotate-3 border-4 border-white hover:rotate-0 transition duration-500"
          />
        </div>
      </div>

      {/* App Download Banner */}
      <div className="bg-uh-dark rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12 group border-4 border-uh-cream">
         {/* Decorative Background Elements */}
         <div className="absolute top-0 right-0 w-80 h-80 bg-uh-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-uh-gold/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
         
         {/* Text Side */}
         <div className="relative z-10 flex-1 text-center md:text-right space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 text-uh-gold px-4 py-1.5 rounded-full text-sm font-bold border border-white/10 backdrop-blur-sm">
                <Star size={14} className="fill-uh-gold" />
                <span>جديد! تطبيق انكل هيلثي</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-brand text-white leading-tight">
               {appTitle1}<br/>
               <span className="text-uh-green relative inline-block">
                 {appHighlight}
                 <svg className="absolute w-full h-3 -bottom-1 left-0 text-uh-gold opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                 </svg>
               </span>
            </h2>
            
            <p className="text-gray-300 text-lg max-w-lg ml-auto leading-relaxed">
               {appText}
            </p>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
                {content?.linkAndroid && (
                    <a href={content.linkAndroid} target="_blank" rel="noreferrer" className="transform transition hover:-translate-y-1 hover:shadow-lg hover:brightness-110">
                        <img src="https://i.ibb.co/hJnCvx8F/play.png" alt="Google Play" className="h-14 w-auto" />
                    </a>
                )}
                {content?.linkIOS && (
                    <a href={content.linkIOS} target="_blank" rel="noreferrer" className="transform transition hover:-translate-y-1 hover:shadow-lg hover:brightness-110">
                        <img src="https://i.ibb.co/0RTdQBk3/play-1.png" alt="App Store" className="h-14 w-auto" />
                    </a>
                )}
                {(!content?.linkAndroid && !content?.linkIOS) && (
                     <p className="text-sm text-gray-500 italic">الروابط قادمة قريباً...</p>
                )}
            </div>
         </div>

         {/* Visual Side (Mockup) */}
         <div className="relative z-10 flex-1 flex justify-center md:justify-end">
            <div className="relative w-64 h-[400px] bg-white rounded-[2.5rem] border-8 border-gray-800 shadow-2xl overflow-hidden transform rotate-[-6deg] group-hover:rotate-0 transition duration-700 ease-out">
                {/* Screen Content Mockup */}
                <img 
                    src={appImage} 
                    alt="App Screen" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-uh-gold rounded-full flex items-center justify-center font-bold text-uh-dark">UH</div>
                        <div>
                            <p className="text-white text-xs font-bold">تم تجهيز طلبك</p>
                            <p className="text-gray-300 text-[10px]">يصلك خلال 25 دقيقة</p>
                        </div>
                    </div>
                    <button className="w-full bg-uh-green text-white text-xs font-bold py-2 rounded-lg">تتبع الطلب</button>
                </div>
            </div>
            
            {/* Floating Badges */}
            <div className="absolute top-10 -right-4 bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl animate-bounce delay-700 hidden md:flex items-center gap-2">
                <span className="bg-green-100 p-1 rounded-full"><CheckCircle size={16} className="text-green-600"/></span>
                <span className="text-xs font-bold text-gray-700">خطط ذكية</span>
            </div>
            <div className="absolute bottom-20 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl animate-bounce hidden md:flex items-center gap-2">
                 <span className="bg-orange-100 p-1 rounded-full"><Smartphone size={16} className="text-orange-600"/></span>
                <span className="text-xs font-bold text-gray-700">سهولة الاستخدام</span>
            </div>
         </div>
      </div>

      {/* Features / About */}
      <div className="grid md:grid-cols-2 gap-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="space-y-4">
          <h2 className="text-3xl font-brand text-uh-greenDark">{missionTitle}</h2>
          <p className="text-gray-600 leading-loose">
            {missionText}
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-brand text-uh-greenDark">لماذا نحن؟</h2>
          <ul className="space-y-3">
            {featuresList.map((item, i) => (
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