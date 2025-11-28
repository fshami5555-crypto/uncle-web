import React from 'react';
import { ArrowRight, ShieldCheck, RefreshCcw, CreditCard } from 'lucide-react';

interface StaticPageProps {
  title: string;
  content: string;
  type: 'PRIVACY' | 'RETURN' | 'PAYMENT';
  onBack: () => void;
}

export const StaticPage: React.FC<StaticPageProps> = ({ title, content, type, onBack }) => {
  const getIcon = () => {
    switch (type) {
      case 'PRIVACY': return <ShieldCheck size={48} className="text-uh-green" />;
      case 'RETURN': return <RefreshCcw size={48} className="text-uh-gold" />;
      case 'PAYMENT': return <CreditCard size={48} className="text-uh-dark" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-uh-dark mb-8 transition"
      >
        <ArrowRight size={20} />
        <span>عودة للرئيسية</span>
      </button>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="bg-uh-cream p-8 flex flex-col items-center justify-center text-center border-b border-gray-100">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                {getIcon()}
            </div>
            <h1 className="text-3xl font-bold text-uh-dark font-brand">{title}</h1>
        </div>
        
        <div className="p-8 md:p-12">
            <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                {content}
            </div>
        </div>
      </div>
    </div>
  );
};
