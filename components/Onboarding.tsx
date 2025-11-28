import React, { useState } from 'react';
import { UserProfile, DailyPlan } from '../types';
import { INITIAL_USER_PROFILE } from '../constants';
import { MessageSquare, FileText, Send, User, ChevronLeft, Lock } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { generateWeeklyPlan } from '../services/geminiService';
import { authService } from '../services/authService';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [mode, setMode] = useState<'SELECT' | 'AI' | 'FORM' | 'PASSWORD'>('SELECT');
  const [formData, setFormData] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // AI Chat State
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: 'أهلاً بك في Uncle Healthy! أنا مساعدك الذكي للتغذية. سأطرح عليك بعض الأسئلة لبناء نظامك الغذائي المثالي. ما هو اسمك؟' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMode('PASSWORD'); // Move to password step
  };

  // AI Handlers
  const handleAISend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction: `
            You are a friendly nutritionist AI for "Uncle Healthy". 
            Your goal is to collect these fields: Name, Age, Gender, Height (cm), Weight (kg), Goal (Lose/Gain/Muscle), Allergies, Phone.
            
            Current conversation history is implied.
            If the user has provided ALL fields, respond with a JSON object ONLY in this format:
            { "COMPLETE": true, "data": { "name": "...", "age": "...", "gender": "...", "height": "...", "weight": "...", "goal": "...", "allergies": "...", "phone": "..." } }
            
            If information is missing, ask for the missing piece politely in Arabic.
            Do not output JSON unless complete.
            `
        }
      });
      
      const historyText = messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n');
      const prompt = `${historyText}\nUser: ${userMsg}\nAI:`;

      const result = await chat.sendMessage({ message: prompt });
      const text = result.text || '';
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
            const json = JSON.parse(jsonMatch[0]);
            if (json.COMPLETE && json.data) {
                setLoading(false);
                setFormData({ ...formData, ...json.data });
                setMode('PASSWORD'); // Move to password step
                return;
            }
        } catch (e) {
            // ignore
        }
      }

      setMessages(prev => [...prev, { role: 'model', text: text.replace(/\{[\s\S]*\}/, '') }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'حدث خطأ، يرجى المحاولة مرة أخرى.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        alert("كلمات المرور غير متطابقة");
        return;
    }
    if (password.length < 6) {
        alert("كلمة المرور يجب أن تكون 6 خانات على الأقل");
        return;
    }

    setIsGenerating(true);
    try {
        // 1. Generate Plan One Time
        const plan = await generateWeeklyPlan(formData);
        
        // 2. Prepare Complete User Object
        const finalProfile: UserProfile = {
            ...formData,
            id: formData.phone,
            password: password,
            hasProfile: true,
            savedPlan: plan
        };

        // 3. Persist to Mock DB
        authService.register(finalProfile);

        // 4. Complete
        onComplete(finalProfile);
    } catch (error) {
        console.error("Registration failed", error);
        alert("حدث خطأ أثناء إنشاء الحساب");
    } finally {
        setIsGenerating(false);
    }
  };

  if (mode === 'SELECT') {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-8 animate-fade-in">
        <h2 className="text-3xl font-brand text-uh-dark">كيف تفضل البدء؟</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <button 
            onClick={() => setMode('AI')}
            className="p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition border-2 border-transparent hover:border-uh-green group"
          >
            <MessageSquare size={48} className="mx-auto mb-4 text-uh-gold group-hover:scale-110 transition" />
            <h3 className="text-xl font-bold mb-2">التحدث مع الذكاء الاصطناعي</h3>
            <p className="text-gray-500 text-sm">محادثة تفاعلية لتحديد احتياجاتك بدقة</p>
          </button>

          <button 
            onClick={() => setMode('FORM')}
            className="p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition border-2 border-transparent hover:border-uh-green group"
          >
            <FileText size={48} className="mx-auto mb-4 text-uh-green group-hover:scale-110 transition" />
            <h3 className="text-xl font-bold mb-2">تعبئة استبيان</h3>
            <p className="text-gray-500 text-sm">نموذج سريع ومباشر لإدخال بياناتك</p>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'AI') {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-[600px]">
        <div className="bg-uh-dark p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
             <span className="font-bold">المساعد الذكي</span>
          </div>
          <button onClick={() => setMode('SELECT')} className="text-sm text-gray-300 hover:text-white">إلغاء</button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-uh-green text-white rounded-tr-none' : 'bg-white border text-gray-800 rounded-tl-none shadow-sm'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-center text-gray-400 text-sm">جاري الكتابة...</div>}
        </div>

        <div className="p-4 bg-white border-t flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAISend()}
            placeholder="اكتب إجابتك هنا..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-uh-green"
          />
          <button 
            onClick={handleAISend}
            disabled={loading}
            className="bg-uh-gold text-uh-dark p-3 rounded-full hover:bg-yellow-500 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'PASSWORD') {
      return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-uh-dark mb-4">حماية حسابك</h2>
            <p className="text-gray-500 mb-6">يرجى تعيين كلمة مرور لتمكينك من الدخول لملفك الصحي لاحقاً.</p>
            
            <form onSubmit={handleFinalRegistration} className="space-y-4">
                <div className="text-right">
                    <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                    <div className="relative">
                        <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded-lg p-3 pr-10" />
                        <Lock className="absolute right-3 top-3.5 text-gray-400" size={18} />
                    </div>
                </div>
                <div className="text-right">
                    <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور</label>
                    <div className="relative">
                        <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full border rounded-lg p-3 pr-10" />
                        <Lock className="absolute right-3 top-3.5 text-gray-400" size={18} />
                    </div>
                </div>
                
                <button type="submit" disabled={isGenerating} className="w-full bg-uh-green text-white font-bold py-4 rounded-lg hover:bg-uh-greenDark transition shadow-md mt-4 flex justify-center items-center gap-2">
                    {isGenerating ? 'جاري إعداد خطتك...' : 'إنشاء الحساب وبدء الرحلة'}
                    {isGenerating && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                </button>
            </form>
        </div>
      )
  }

  // Form Mode
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setMode('SELECT')} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft />
        </button>
        <h2 className="text-2xl font-bold text-uh-dark">إنشاء ملف صحي</h2>
      </div>
      
      <form onSubmit={handleFormSubmit} className="grid md:grid-cols-2 gap-6">
        <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
            <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-uh-green outline-none" placeholder="مثال: أحمد محمد" />
        </div>
        
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العمر</label>
            <input required name="age" type="number" value={formData.age} onChange={handleInputChange} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-uh-green outline-none" />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
            <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-uh-green outline-none">
                <option value="">اختر...</option>
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
            </select>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الطول (سم)</label>
            <input required name="height" type="number" value={formData.height} onChange={handleInputChange} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-uh-green outline-none" />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوزن (كغ)</label>
            <input required name="weight" type="number" value={formData.weight} onChange={handleInputChange} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-uh-green outline-none" />
        </div>

        <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">الهدف الصحي</label>
            <select name="goal" value={formData.goal} onChange={handleInputChange} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-uh-green outline-none">
                <option value="">اختر...</option>
                <option value="تخفيف وزن">تخفيف الوزن</option>
                <option value="زيادة وزن">زيادة الوزن</option>
                <option value="بناء عضلات">بناء كتلة عضلية</option>
                <option value="حياة صحية">المحافظة على نمط حياة صحي</option>
            </select>
        </div>

        <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">هل لديك حساسية من أطعمة معينة؟</label>
            <input name="allergies" value={formData.allergies} onChange={handleInputChange} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-uh-green outline-none" placeholder="مثال: مكسرات، غلوتين... (اتركه فارغاً إذا لا يوجد)" />
        </div>

        <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
            <input required name="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-uh-green outline-none" placeholder="079xxxxxxx" />
        </div>

        <div className="col-span-2 pt-4">
            <button type="submit" className="w-full bg-uh-green text-white font-bold py-4 rounded-lg hover:bg-uh-greenDark transition shadow-md">
                التالي: إعداد كلمة المرور
            </button>
        </div>
      </form>
    </div>
  );
};
