import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  CheckCircle, 
  Shield, 
  Award,
  Cpu,
  ChevronDown,
  Layers,
  Heart
} from 'lucide-react';

interface HeroBannerProps {
  onSearchWarrantyClick?: () => void;
  onSubmitCaseClick?: () => void;
}

export default function HeroBanner({ onSearchWarrantyClick, onSubmitCaseClick }: HeroBannerProps) {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 120);
    return () => clearTimeout(timer);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop;
      window.scrollTo({
        top: id === 'home' ? 0 : offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section 
      id="home" 
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#040c16]"
    >
      {/* 1. CINEMATIC BACKGROUND IMAGE & HIGH-END GRADIENTS */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        {/* Modern CAD/CAM lab background image with subtle pan effect */}
        <img 
          src="/src/assets/images/labo_hero_banner_1779366267799.png" 
          alt="LABO VSTAR High-Tech Dental Production Center" 
          className="w-full h-full object-cover object-center transform scale-105 filter brightness-[0.45] saturate-[0.85]"
        />
        
        {/* Navy/Midnight linear overlays to guarantee pristine dark contrast for text readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#051120] via-[#051120]/95 to-[#0b213b]/30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#040c16]/100 via-[#040c16]/50 to-transparent"></div>
        
        {/* Subtle decorative gold-amber radial light flares */}
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-brand-gold/15 blur-[140px] mix-blend-screen"></div>
        <div className="absolute -bottom-10 left-[20%] w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[100px]"></div>
      </div>

      {/* 2. CORE CONTENT & BENTO-GRID HERO PANEL */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20 md:pt-44 md:pb-28 lg:pt-48 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: HERO TYPOGRAPHY & MULTI-ACTION CONTROLS */}
          <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
            
            {/* Elegant premium label */}
            <div 
              style={{ transitionDelay: '100ms' }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-gold/15 text-brand-gold border border-brand-gold/30 text-[10px] sm:text-xs font-bold tracking-[0.2em] rounded-full mx-auto lg:mx-0 w-fit uppercase mb-6 shadow-lg transition-all duration-700 ${
                animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-brand-gold" />
              <span>LABO VSTAR • CHUẨN MỰC PHỤC HÌNH ĐỨC</span>
            </div>

            {/* Giant Display Title */}
            <h1 
              style={{ transitionDelay: '250ms' }}
              className={`text-4xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-white leading-[1.1] mb-5 transition-all duration-750 ${
                animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              Không chỉ là <br className="hidden md:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-gold-light to-white">phục hình</span>
            </h1>

            {/* Secondary line */}
            <p 
              style={{ transitionDelay: '400ms' }}
              className={`text-xl sm:text-2xl md:text-3xl font-display font-medium text-brand-gold/95 tracking-wide mb-6 transition-all duration-750 ${
                animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              Mà là sự chính xác trong từng nụ cười
            </p>

            {/* Paragraph body description */}
            <p 
              style={{ transitionDelay: '550ms' }}
              className={`text-sm sm:text-base md:text-md text-slate-300 leading-relaxed mb-9 max-w-xl mx-auto lg:mx-0 font-normal transition-all duration-750 ${
                animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              VSTAR tự hào đồng hành cùng hàng trăm phòng khám nha khoa uy tín trong chế tác răng sứ Zirconia, phục hình Implant kỹ thuật số, răng sứ kim loại quý và hàm giả tháo lắp với tiêu chí bất di bất dịch: <span className="text-brand-gold font-bold">Chuẩn khớp khớp khít • Đẹp tự nhiên • Bàn giao đúng hẹn</span>.
            </p>

            {/* Structured action button cluster */}
            <div 
              style={{ transitionDelay: '700ms' }}
              className={`flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 transition-all duration-750 ${
                animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              
              {/* Button: XEM SẢN PHẨM DỊCH VỤ */}
              <button 
                onClick={() => scrollToSection('san-pham')}
                className="w-full sm:w-auto px-7 py-3.5 bg-brand-gold hover:bg-white text-[#0A2540] hover:text-brand-blue font-bold text-sm tracking-wider rounded-xl shadow-lg shadow-brand-gold/10 hover:shadow-white/20 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2.5 group cursor-pointer"
              >
                <span>DANH SÁCH DỊCH VỤ</span>
                <ArrowRight className="w-4 h-4 text-[#0A2540] group-hover:text-brand-blue group-hover:translate-x-1.5 transition-transform" />
              </button>

              {/* Button: TRA CỨU BẢO HÀNH */}
              <button 
                onClick={() => {
                  if (onSearchWarrantyClick) {
                    onSearchWarrantyClick();
                  } else {
                    scrollToSection('bao-hanh');
                  }
                }}
                className="w-full sm:w-auto px-7 py-3.5 bg-white/10 hover:bg-white text-white border-2 border-white/25 hover:border-white font-bold text-sm tracking-wider rounded-xl shadow-md backdrop-blur-sm transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2.5 group cursor-pointer"
              >
                <Search className="w-4 h-4 text-brand-gold group-hover:scale-110 transition-transform" />
                <span>TRA CỨU BẢO HÀNH ĐIỆN TỬ</span>
              </button>

            </div>

            {/* Quick metrics anchors */}
            <div 
              style={{ transitionDelay: '850ms' }}
              className={`grid grid-cols-3 gap-6 pt-10 mt-10 border-t border-white/10 max-w-md mx-auto lg:mx-0 text-center lg:text-left transition-all duration-750 ${
                animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <div>
                <p className="text-xl sm:text-2xl font-black text-brand-gold font-mono">100%</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Đúng hẹn bàn giao</p>
              </div>
              <div className="border-x border-white/10 px-2">
                <p className="text-xl sm:text-2xl font-black text-brand-gold font-mono">&lt;20μm</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Dung sai CAD/CAM</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-brand-gold font-mono">ISO</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Y Khoa 13485</p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: CORPORATE GLASSMOPRHISM WORKSTATION BADGES CARD */}
          <div 
            style={{ transitionDelay: '1000ms' }}
            className={`hidden lg:block lg:col-span-5 transition-all duration-[1200ms] ${
              animate ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-12 scale-[0.97]'
            }`}
          >
            <div className="relative p-7 rounded-2xl bg-[#061426]/70 backdrop-blur-xl border border-white/10 shadow-2xl space-y-6">
              
              {/* Radial decor point */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-2xl pointer-events-none"></div>

              {/* Status Header */}
              <div className="flex justify-between items-center bg-black/30 px-3.5 py-1.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase tracking-wider">VSTAR DIGITAL PRODUCTION</span>
                <span className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-mono font-bold uppercase">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> SYSTEM LIVE
                </span>
              </div>

              {/* Brand features matrix */}
              <div className="space-y-4">
                
                {/* Feature 1: Materials */}
                <div className="flex items-start gap-3.5 p-1">
                  <div className="w-9 h-9 rounded-xl bg-brand-gold/15 border border-brand-gold/25 flex items-center justify-center text-brand-gold shrink-0">
                    <Award className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-wide">Vật Liệu Nhập Khẩu Chính Hãng</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Nhập khẩu nguyên phôi sứ chính ngạch từ Lava Esthetic (Thụy Sĩ), Cercon HT (Đức), Katana (Nhật Bản).
                    </p>
                  </div>
                </div>

                {/* Feature 2: High Tech */}
                <div className="flex items-start gap-3.5 p-1">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
                    <Cpu className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-wide">Quy Trình Chế Tác CAD/CAM 3D</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Thiết kế trên phần mềm bản quyền Exocad Đức, vận hành phay sườn bằng robot Coritec 5 trục siêu chuẩn xác.
                    </p>
                  </div>
                </div>

                {/* Feature 3: Warranty */}
                <div className="flex items-start gap-3.5 p-1">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                    <Shield className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-wide">Tra Cứu Bảo Hành Điện Tử</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Quản lý thông minh bằng hệ thống bảo hành số, tra cứu nguồn gốc phôi sứ minh bạch từ 10 - 15 năm.
                    </p>
                  </div>
                </div>

                {/* Feature 4: ISO */}
                <div className="flex items-start gap-3.5 p-1">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-brand-gold shrink-0">
                    <Layers className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-wide">Chứng Chỉ Quốc Tế ISO 13485:2016</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Quy trình sản xuất trang thiết bị y tế đạt kiểm định an toàn lâm sàng, đáp ứng tối đa tiêu chuẩn vô trùng.
                    </p>
                  </div>
                </div>

              </div>

              {/* Decorative phôi preview */}
              <div className="rounded-xl overflow-hidden bg-black/25 p-3.5 border border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#040c16] border border-white/10 flex items-center justify-center shrink-0">
                  <img 
                    src="/src/assets/images/zirconia_crown_1779366286911.png" 
                    alt="Dental crowns" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-white uppercase tracking-wider">Premium Lava Plus Crown</p>
                  <p className="text-[10px] text-brand-gold font-medium mt-0.5">Sự trong mờ tự nhiên tựa men răng thật</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Cinematic scroll down arrow anchor */}
      <div 
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity animate-bounce cursor-pointer group" 
        onClick={() => scrollToSection('giou-thieu')}
      >
        <span className="text-[9px] text-slate-400 font-mono font-bold tracking-[0.2em] uppercase group-hover:text-white transition-colors">CUỘN XUỐNG</span>
        <ChevronDown className="w-4.5 h-4.5 text-brand-gold group-hover:scale-110 transition-transform" />
      </div>

    </section>
  );
}
