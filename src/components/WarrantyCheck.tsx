import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Warranty } from '../types';
import { Search, FileText, User, Sparkles, Check, X, Shield, Clock, Award } from 'lucide-react';

interface WarrantyCheckProps {
  onDemoFillClick?: () => void;
}

export default function WarrantyCheck({ onDemoFillClick }: WarrantyCheckProps) {
  const [warrantyCode, setWarrantyCode] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found' | 'not_found'>('idle');
  const [foundRecord, setFoundRecord] = useState<Warranty | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warrantyCode.trim() || !birthYear.trim()) return;

    setSearchStatus('searching');
    const path = 'warranties';

    try {
      const codeClean = warrantyCode.trim().toUpperCase();
      const yearClean = parseInt(birthYear.trim(), 10);

      const q = query(
        collection(db, path),
        where('warrantyCode', '==', codeClean),
        where('birthYear', '==', yearClean)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Take the first matching document
        const docSnap = querySnapshot.docs[0];
        setFoundRecord({
          id: docSnap.id,
          ...docSnap.data()
        } as Warranty);
        setSearchStatus('found');
        
        // Scroll smoothly to results
        setTimeout(() => {
          document.getElementById('warranty-result-view')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      } else {
        setFoundRecord(null);
        setSearchStatus('not_found');
      }
    } catch (error) {
      setFoundRecord(null);
      setSearchStatus('idle');
      handleFirestoreError(error, OperationType.GET, path);
    }
  };

  const resetSearch = () => {
    setWarrantyCode('');
    setBirthYear('');
    setSearchStatus('idle');
    setFoundRecord(null);
  };

  const triggerFillDemo = () => {
    setWarrantyCode('VSTAR2026');
    setBirthYear('1990');
    if (onDemoFillClick) {
      onDemoFillClick();
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-indigo-50/50 p-6 sm:p-10 relative overflow-hidden">
      {/* Demo assist helper box */}
      <div className="mb-8 p-4 bg-yellow-50/70 border border-yellow-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-brand-gold animate-bounce-slow" />
            Kiểm tra tính năng bảo hành:
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Nhấp tự điền mã mẫu <span className="font-mono font-bold bg-white px-2 py-0.5 border border-amber-200/50 rounded text-slate-700">VSTAR2026</span> và năm sinh <span className="font-mono font-bold bg-white px-2 py-0.5 border border-amber-200/50 rounded text-slate-700">1990</span> để xem giao diện bảo hành cao cấp.
          </p>
        </div>
        <button 
          type="button"
          onClick={triggerFillDemo}
          className="bg-brand-blue text-white hover:bg-slate-800 text-xs font-semibold py-1.5 px-3.5 rounded-lg shadow-sm transition-all flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <span>Tự động điền nhanh</span>
          <Search className="w-3 h-3" />
        </button>
      </div>

      {/* WARRANTY CHECK FORM */}
      <form onSubmit={handleSearch} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Input Code */}
          <div>
            <label htmlFor="warrantyCodeInput" className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Mã sổ bảo hành (Serial):</label>
            <div className="relative">
              <input 
                id="warrantyCodeInput"
                type="text" 
                placeholder="Ví dụ: VSTAR2026"
                value={warrantyCode}
                onChange={(e) => setWarrantyCode(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold rounded-xl text-base font-semibold focus:outline-none transition-all placeholder:text-slate-400 tracking-wide text-brand-blue"
                required
              />
              <div className="absolute right-3.5 top-3.5 text-slate-300">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Input Birth year */}
          <div>
            <label htmlFor="birthYearInput" className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Năm sinh bệnh nhân:</label>
            <div className="relative">
              <input 
                id="birthYearInput"
                type="number" 
                placeholder="Ví dụ: 1990"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold rounded-xl text-base font-semibold focus:outline-none transition-all placeholder:text-slate-400 text-brand-blue"
                required
              />
              <div className="absolute right-3.5 top-3.5 text-slate-300">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button 
            type="submit"
            disabled={searchStatus === 'searching'}
            className="w-full sm:w-auto px-8 py-4 bg-brand-blue text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 focus:outline-none transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {searchStatus === 'searching' ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Đang tra cứu hệ thống...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5 text-brand-gold" />
                <span>Kiểm tra bảo hành</span>
              </>
            )}
          </button>

          {searchStatus !== 'idle' && (
            <button 
              type="button"
              onClick={resetSearch}
              className="w-full sm:w-auto px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm transition-all focus:outline-none cursor-pointer"
            >
              Xóa kết quả
            </button>
          )}
        </div>
      </form>

      {/* WARRANTY SEARCH RESULT WRAPPER */}
      {searchStatus === 'found' && foundRecord && (
        <div id="warranty-result-view" className="mt-8 pt-8 border-t border-slate-100 animate-fade-in-up">
          
          <div className="bg-gradient-to-tr from-[#0b213b] to-indigo-950 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border-2 border-brand-gold/30">
            {/* Decorative faint pattern */}
            <div className="absolute -bottom-10 -right-10 w-44 h-44 border-8 border-white/5 rounded-full pointer-events-none"></div>

            {/* Header VSTAR Premium Authentique */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 mb-6 gap-4">
              <div>
                <span className="text-[10px] bg-brand-gold text-slate-950 font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Thẻ bảo hành điện tử chính hãng
                </span>
                <h3 className="font-display font-black text-xl sm:text-2xl text-white mt-2.5">
                  LABO VSTAR PREMIUM
                </h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Trạng thái bảo hành</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-1 shadow-inner ${
                  foundRecord.status === 'Còn bảo hành' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${foundRecord.status === 'Còn bảo hành' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                  {foundRecord.status}
                </span>
              </div>
            </div>

            {/* Detailed Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs sm:text-sm">
              <div className="space-y-3.5">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400">Mã bảo hành (Serial):</span>
                  <span className="font-mono font-bold text-brand-gold text-[15px] uppercase tracking-wider">
                    {foundRecord.warrantyCode}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400">Tên bệnh nhân:</span>
                  <span className="font-bold text-white uppercase">{foundRecord.customerName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400">Năm sinh:</span>
                  <span className="font-semibold text-white font-mono">{foundRecord.birthYear}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400">Nha khoa thực hiện:</span>
                  <span className="font-semibold text-slate-100 text-right max-w-[180px] sm:max-w-xs truncate">
                    {foundRecord.clinicName}
                  </span>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400">Sản phẩm phục hình:</span>
                  <span className="font-bold text-brand-gold text-right max-w-[180px] sm:max-w-xs truncate">
                    {foundRecord.product}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400">Số lượng răng phục hình:</span>
                  <span className="font-bold text-white">{foundRecord.quantity} răng (đơn vị)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400">Màu răng (Shade):</span>
                  <span className="font-semibold text-slate-200">{foundRecord.shade}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400">Ngày lắp phục hình:</span>
                  <span className="font-semibold text-slate-200 font-mono">{foundRecord.installDate}</span>
                </div>
              </div>
            </div>

            {/* Big highlights dates */}
            <div className="mt-6 p-4 sm:p-5 bg-white/5 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center flex-shrink-0 border border-brand-gold/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Hạn bảo hành đến ngày</p>
                  <p className="font-mono font-black text-sm sm:text-base text-brand-gold mt-0.5">{foundRecord.warrantyEndDate}</p>
                </div>
              </div>
              <div className="text-xs text-slate-400 text-center sm:text-right max-w-sm">
                Nếu phát hiện sai khác trong thông tin, vui lòng liên hệ trực tiếp cho <span className="font-semibold text-white">LABO VSTAR</span> qua Zalo/Hotline: <span className="font-bold text-brand-gold font-mono">0342.610.789</span>.
              </div>
            </div>

            {/* Note block if exists */}
            {foundRecord.note && (
              <div className="mt-4 p-3.5 bg-black/25 rounded-xl text-xs text-slate-300 border border-white/5">
                <span className="font-bold text-brand-gold uppercase tracking-wider block text-[10px] mb-1">Ghi chú lâm sàng:</span>
                {foundRecord.note}
              </div>
            )}

            {/* Safety badge proof */}
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-[10px] sm:text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-bold uppercase"><Shield className="w-3.5 h-3.5 text-brand-gold" /> Chống giả ID số hóa</span>
              <span className="flex items-center gap-1.5 font-bold uppercase"><Award className="w-3.5 h-3.5 text-brand-gold" /> Phôi sứ chuẩn FDA</span>
              <span className="flex items-center gap-1.5 font-bold uppercase"><Check className="w-3.5 h-3.5 text-brand-gold" /> 100% Cắt CAD/CAM khép kín</span>
            </div>

          </div>
        </div>
      )}

      {/* NOT FOUND SCREEN STATE */}
      {searchStatus === 'not_found' && (
        <div className="mt-8 text-center py-10 px-4 bg-slate-50 rounded-2xl border border-slate-100 animate-slide-up">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <X className="w-7 h-7" />
          </div>
          <h4 className="font-display font-black text-base sm:text-lg text-slate-900 uppercase">Không tìm thấy mã bảo hành</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
            Mã tra cứu <span className="font-bold text-rose-600 font-mono">"{warrantyCode.toUpperCase()}"</span> kết hợp cùng năm sinh <span className="font-bold text-slate-850 font-mono">{birthYear}</span> chưa có trên hệ thống hoặc thông tin nhập khớp bị sai lệch. 
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
            <button 
              type="button"
              onClick={resetSearch}
              className="px-5 py-2.5 bg-brand-blue text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
            >
              Thử nhập lại mã khác
            </button>
            <a 
              href="https://zalo.me/0342610789"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Gặp Kỹ thuật viên hỗ trợ
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
