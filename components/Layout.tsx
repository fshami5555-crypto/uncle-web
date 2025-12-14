
import React, { useEffect, useState } from 'react';
import { PageView, SiteContent } from '../types';
import { Menu, User, ShoppingBag, Calendar, Home, LogIn, LogOut, Facebook, Instagram, Twitter, Heart, Smartphone } from 'lucide-react';
import { dataService } from '../services/dataService';

interface LayoutProps {
  children: React.ReactNode;
  setView: (view: PageView) => void;
  currentView: PageView;
  isLoggedIn: boolean;
  onLogout: () => void;
  cartItemCount: number;
}

export const Layout: React.FC<LayoutProps> = ({ children, setView, currentView, isLoggedIn, onLogout, cartItemCount }) => {
  const [content, setContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    const fetch = async () => {
        setContent(await dataService.getContent());
    };
    fetch();
  }, []);

  const navItemClass = (view: PageView) => 
    `flex flex-col items-center gap-1 cursor-pointer transition-colors ${currentView === view ? 'text-uh-green font-bold' : 'text-uh-dark hover:text-uh-gold'}`;

  // Helper to render App Buttons
  const renderAppButtons = (isFooter = false) => {
      const imgClass = "h-12 w-auto object-contain transition hover:scale-105 cursor-pointer";
      return (
        <div className={`flex items-center gap-3 ${isFooter ? 'justify-center md:justify-start' : 'hidden lg:flex'}`}>
            {content?.linkAndroid && (
                <a href={content.linkAndroid} target="_blank" rel="noreferrer">
                    <img src="https://i.ibb.co/hJnCvx8F/play.png" alt="Get it on Google Play" className={imgClass} />
                </a>
            )}
            {content?.linkIOS && (
                <a href={content.linkIOS} target="_blank" rel="noreferrer">
                    <img src="https://i.ibb.co/0RTdQBk3/play-1.png" alt="Download on the App Store" className={imgClass} />
                </a>
            )}
        </div>
      );
  };

  return (
    <div className="min-h-screen flex flex-col bg-uh-cream">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('HOME')}>
            <img src="https://i.ibb.co/nqmV5jzX/23.png" alt="Uncle Healthy Logo" className="h-10 w-auto" />
            <span className="font-brand text-2xl text-uh-dark hidden md:block">Uncle Healthy</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => setView('HOME')} className={navItemClass('HOME')}>الرئيسية</button>
            <button onClick={() => setView('STORE')} className={navItemClass('STORE')}>المتجر</button>
            <button onClick={() => setView('SUBSCRIPTION')} className={navItemClass('SUBSCRIPTION')}>الاشتراكات</button>
            <button onClick={() => setView('PROFILE')} className={navItemClass('PROFILE')}>ملفي الصحي</button>
          </nav>

          <div className="flex items-center gap-4">
             {renderAppButtons()}
             <button onClick={() => setView('CART')} className="relative p-2 text-uh-dark hover:text-uh-green transition">
                <ShoppingBag size={24} />
                {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 bg-uh-gold text-uh-dark text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{cartItemCount}</span>
                )}
             </button>
             {isLoggedIn ? (
                 <button onClick={onLogout} className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-2 rounded-lg transition">
                    <LogOut size={18} /> <span className="hidden md:inline">خروج</span>
                 </button>
             ) : (
                 <button onClick={() => setView('LOGIN')} className="flex items-center gap-2 text-sm font-bold text-white bg-uh-green hover:bg-uh-greenDark px-4 py-2 rounded-lg transition shadow-sm">
                    <LogIn size={18} /> <span>دخول</span>
                 </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6 pb-24 md:pb-6 w-full relative">
        {children}
      </main>

      {/* Footer - HIDDEN ON MOBILE (hidden md:block) */}
      <footer className="hidden md:block bg-uh-dark text-white pt-8 pb-6 mt-8 w-full">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6 border-b border-white/10 pb-6 text-center md:text-right">
             <div>
                <img src="https://i.ibb.co/nqmV5jzX/23.png" alt="Logo" className="h-14 mb-3 opacity-90 bg-white rounded p-1 inline-block" />
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">انكل هيلثي، رفيقك في رحلة الحياة الصحية.</p>
                <div className="flex justify-center md:justify-start gap-4 mt-4">
                    {content?.socialFacebook && <a href={content.socialFacebook} target="_blank" rel="noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-uh-gold transition"><Facebook size={18} /></a>}
                    {content?.socialInstagram && <a href={content.socialInstagram} target="_blank" rel="noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-uh-gold transition"><Instagram size={18} /></a>}
                </div>
             </div>
             <div>
                <h3 className="font-bold text-lg mb-3 text-uh-gold">روابط سريعة</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                    <li><button onClick={() => setView('STORE')} className="hover:text-white transition">المتجر</button></li>
                    <li><button onClick={() => setView('SUBSCRIPTION')} className="hover:text-white transition">الاشتراكات</button></li>
                    <li><button onClick={() => setView('PROFILE')} className="hover:text-white transition">حسابي</button></li>
                </ul>
             </div>
             <div>
                <h3 className="font-bold text-lg mb-3 text-uh-gold">معلومات هامة</h3>
                <ul className="space-y-2 text-gray-300 text-sm mb-4">
                    <li><button onClick={() => setView('PRIVACY_POLICY')} className="hover:text-white transition">سياسة الاستخدام والخصوصية</button></li>
                    <li><button onClick={() => setView('RETURN_POLICY')} className="hover:text-white transition">سياسة الإرجاع</button></li>
                </ul>
                <div className="pt-3 border-t border-white/10">
                     <p className="text-xs text-gray-400 mb-2">حمل التطبيق الآن</p>
                     {renderAppButtons(true)}
                </div>
             </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
             <p>جميع الحقوق محفوظة © Uncle Healthy 2025</p>
             <div className="flex items-center gap-1 mt-2 md:mt-0 opacity-80 hover:opacity-100 transition">
                <span>تم التصميم بحب</span>
                <Heart size={10} className="text-red-500 fill-red-500 animate-pulse" />
             </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex justify-between px-6 py-3 z-50 text-xs border-t border-gray-100">
         <div onClick={() => setView('HOME')} className={navItemClass('HOME')}>
            <Home size={20} />
            <span>الرئيسية</span>
         </div>
         <div onClick={() => setView('STORE')} className={navItemClass('STORE')}>
            <ShoppingBag size={20} />
            <span>المتجر</span>
         </div>
         <div onClick={() => setView('SUBSCRIPTION')} className={navItemClass('SUBSCRIPTION')}>
            <Calendar size={20} />
            <span>الاشتراكات</span>
         </div>
         <div onClick={() => setView('CART')} className={`relative ${navItemClass('CART')}`}>
            <ShoppingBag size={20} />
            {cartItemCount > 0 && <span className="absolute -top-1 right-3 bg-uh-gold w-2 h-2 rounded-full"></span>}
            <span>السلة</span>
         </div>
         <div onClick={() => setView('PROFILE')} className={navItemClass('PROFILE')}>
            <User size={20} />
            <span>ملفي</span>
         </div>
      </div>
    </div>
  );
};
