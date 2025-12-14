
import React, { useState, useRef } from 'react';
import { Upload, Link, Loader, Image as ImageIcon, X } from 'lucide-react';
import { uploadToImgBB } from '../services/imageService';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ value, onChange, label = "الصورة", placeholder = "رابط الصورة (URL)" }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      try {
        const url = await uploadToImgBB(file);
        onChange(url);
      } catch (error) {
        alert('حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى.');
      } finally {
        setUploading(false);
        // Reset input so same file can be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-700">{label}</label>
      
      <div className="flex gap-2 items-start">
        <div className="flex-1 space-y-2">
            {/* URL Input */}
            <div className="relative">
                <input 
                    type="text" 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)} 
                    placeholder={placeholder}
                    className="w-full border p-3 pl-10 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-uh-green outline-none transition"
                    disabled={uploading}
                />
                <Link className="absolute left-3 top-3.5 text-gray-400" size={16} />
            </div>

            {/* Upload Button */}
            <div className="flex gap-2">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />
                <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 bg-uh-dark text-white px-4 py-2 rounded-lg text-sm hover:bg-black transition shadow-sm disabled:opacity-50"
                >
                    {uploading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
                    <span>{uploading ? 'جاري الرفع...' : 'رفع صورة من الجهاز'}</span>
                </button>
                
                {value && (
                    <button 
                        type="button"
                        onClick={() => onChange('')}
                        className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm transition"
                    >
                        حذف
                    </button>
                )}
            </div>
        </div>

        {/* Preview */}
        <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 relative">
            {value ? (
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
            ) : (
                <ImageIcon className="text-gray-300" size={32} />
            )}
            {uploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader className="text-uh-green animate-spin" size={24} />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
