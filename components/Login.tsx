import React, { useState } from 'react';
import { authService } from '../services/authService';
import { UserProfile } from '../types';
import { Lock, Phone, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
  onGoToSignup: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onGoToSignup }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        const user = await authService.login(identifier, password);
        if (user) {
          onLogin(user);
        } else {
          setError('رقم الهاتف أو كلمة المرور غير صحيحة');
        }
    } catch (e) {
        setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl text-center">
        <h2 className="text-2xl font-bold text-uh-dark mb-2">تسجيل الدخول</h2>
        <p className="text-gray-500 mb-8">أهلاً بك مجدداً في Uncle Healthy</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
            <div className="relative">
              <input 
                type="text" 
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-4 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-uh-green outline-none"
                placeholder="079xxxxxxx"
              />
              <Phone className="absolute right-3 top-3.5 text-gray-400" size={20} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <div className="relative">
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-uh-green outline-none"
                placeholder="••••••••"
              />
              <Lock className="absolute right-3 top-3.5 text-gray-400" size={20} />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-uh-green text-white font-bold py-3 rounded-xl hover:bg-uh-greenDark transition shadow-md mt-4 disabled:opacity-50"
          >
            {loading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>

        <div className="mt-6 border-t pt-6">
          <p className="text-gray-600 text-sm mb-3">ليس لديك حساب؟</p>
          <button 
            onClick={onGoToSignup}
            className="w-full border-2 border-uh-dark text-uh-dark font-bold py-3 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            إنشاء ملف صحي جديد
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};