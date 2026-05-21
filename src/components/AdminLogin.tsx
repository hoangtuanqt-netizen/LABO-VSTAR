import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Shield, Eye, EyeOff, Sparkles, HelpCircle, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onLoginSuccess();
    } catch (err: any) {
      console.error('Admin Sign In Error:', err);
      let VietnameseMsg = 'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản và mật khẩu.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        VietnameseMsg = 'Sai tài khoản email hoặc mật khẩu quản trị viên.';
      } else if (err.code === 'auth/invalid-email') {
        VietnameseMsg = 'Định dạng email quản trị viên không chính xác.';
      } else if (err.code === 'auth/too-many-requests') {
        VietnameseMsg = 'Tài khoản tạm thời bị khóa do thử quá nhiều lần. Thử lại sau ít phút.';
      } else if (err.code === 'auth/operation-not-allowed') {
        VietnameseMsg = 'Đăng nhập Email/Mật khẩu chưa được bật trong cài đặt Firebase Console.';
      }
      setError(VietnameseMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mx-auto mb-4 relative">
          <Shield className="w-6 h-6 text-brand-blue" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-gold rounded-full animate-ping"></span>
        </div>
        <h3 className="font-display font-black text-xl text-slate-900 uppercase">Đăng nhập bảng quản trị</h3>
        <p className="text-xs text-slate-500 mt-1.5 font-semibold">Chỉ dành riêng cho nhân viên điều hành LABO VSTAR</p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 font-semibold">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="loginEmail" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email quản trị:</label>
          <input 
            id="loginEmail"
            type="email" 
            required
            placeholder="admin@vstarlabo.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold rounded-xl text-xs sm:text-sm font-semibold transition-colors"
          />
        </div>

        <div>
          <label htmlFor="loginPassword" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mật khẩu:</label>
          <div className="relative">
            <input 
              id="loginPassword"
              type={showPassword ? 'text' : 'password'} 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold rounded-xl text-xs sm:text-sm font-semibold transition-colors pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-blue hover:bg-slate-800 text-white font-bold text-xs sm:text-sm tracking-wide rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Đang đăng nhập...</span>
            </>
          ) : (
            <span>ĐĂNG NHẬP HỆ THỐNG</span>
          )}
        </button>
      </form>

      {/* Admin Quick Guide Instruction Panel */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full flex items-center justify-between text-slate-500 hover:text-brand-blue text-xs font-semibold focus:outline-none"
        >
          <span className="flex items-center gap-1.5"><HelpCircle className="w-4 h-4" /> Hướng dẫn cho quản trị viên mới</span>
          <span>{showInstructions ? 'Thu gọn -' : 'Xem thêm +'}</span>
        </button>

        {showInstructions && (
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-650 space-y-2.5 leading-relaxed">
            <p className="font-bold text-brand-blue flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-brand-gold" /> Các bước cấu hình & tạo tài khoản:</p>
            <ol className="list-decimal pl-4 space-y-1.5 font-medium">
              <li>Mở <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-brand-gold underline font-bold">Firebase Console</a>, chọn dự án của ứng dụng này.</li>
              <li>Đi tới phần <strong>Authentication</strong> &gt; <strong>Sign-in method</strong>.</li>
              <li>Bật nhà cung cấp <strong>Email/Password</strong> (đây là thiết lập bắt buộc).</li>
              <li>Chuyển tới tab <strong>Users</strong> và nhấn <strong>Add user</strong>. Tạo email và mật khẩu của bạn (ví dụ: <code className="bg-white px-1 border rounded text-rose-600 font-bold">admin@vstarlabo.vn</code>).</li>
              <li>Sử dụng email và mật khẩu vừa tạo để đăng nhập vào trang quản trị này.</li>
            </ol>
            <p className="text-[10px] text-slate-400 bg-white p-2 rounded border border-slate-150">
              * Dự án Firebase ID của bạn là: <strong className="font-mono text-slate-800">{auth.app.options.projectId}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
