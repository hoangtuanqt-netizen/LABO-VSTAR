import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Sparkles, 
  Cpu, 
  Layers, 
  Heart, 
  Award, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Menu, 
  X, 
  Send, 
  Upload, 
  Shield, 
  FileText, 
  HelpCircle, 
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { WarrantyRecord, ServiceItem, FAQItem, FeedbackForm } from './types';

// Firebase imports
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import WarrantyCheck from './components/WarrantyCheck';
import AdminLogin from './components/AdminLogin';
import AdminWarrantyManager from './components/AdminWarrantyManager';
import HeroBanner from './components/HeroBanner';
import VStarLogo from './components/VStarLogo';

// Concrete warranty database as specified
const WARRANTY_DATABASE: WarrantyRecord[] = [
  {
    id: "w1",
    warrantyCode: "VSTAR2026",
    birthYear: 1990,
    customerName: "NGUYỄN VĂN HÙNG",
    productName: "Răng sứ Zirconia Cercon HT Multi-layered Cao Cấp",
    quantity: 14,
    colorCode: "A1 (Tone Sáng Tự Nhiên, Đa Tầng Màu)",
    installDate: "15/02/2026",
    duration: "10 Năm (Đến 15/02/2036)",
    isActive: true,
    clinicName: "Nha Khoa Quốc Tế Diamond Sài Gòn",
    notes: "Ưu tiên phục hình toàn hàm thẩm mỹ cao, độ thấu quang chuẩn phục hình nha chu lý tưởng."
  },
  {
    id: "w2",
    warrantyCode: "VSTAR7779",
    birthYear: 1985,
    customerName: "TRẦN THỊ MAI",
    productName: "Răng sứ cao cấp Lava Plus Thụy Sĩ",
    quantity: 6,
    colorCode: "OM2 (Trắng Tuyết Sang Trọng)",
    installDate: "10/05/2026",
    duration: "15 Năm (Đến 10/05/2041)",
    isActive: true,
    clinicName: "Nha Khoa Smile Sài Gòn",
    notes: "Mão răng Zirconia Lava Plus chính hãng Thụy Sĩ, đắp sứ thẩm mỹ nhóm răng cửa."
  },
  {
    id: "w3",
    warrantyCode: "VSTAR5555",
    birthYear: 1978,
    customerName: "LÊ HOÀNG NAM",
    productName: "Phục hình Implant Titan Multi-Unit",
    quantity: 2,
    colorCode: "A2 (Tone Trung Tính Chân Thật)",
    installDate: "20/01/2025",
    duration: "7 Năm (Đến 20/01/2032)",
    isActive: true,
    clinicName: "Nha Khoa VSTAR Linh Đông",
    notes: "Chân răng Abutment thiết kế CAD/CAM liền khối chắc chắn, tải lực ăn nhai tối ưu."
  },
  {
    id: "w4",
    warrantyCode: "VSTAR8888",
    birthYear: 1980,
    customerName: "PHẠM MINH TUẤN",
    productName: "Răng sứ Titan Mỹ thuật bền bỉ",
    quantity: 4,
    colorCode: "A3 (Tone Cổ Điển)",
    installDate: "12/12/2020",
    duration: "5 Năm (Hết hạn ngày 12/12/2025)",
    isActive: false,
    clinicName: "Nha Khoa Sài Gòn Cao Cấp",
    notes: "Phục hình hàm trong đã hết hạn bảo hành. Hỗ trợ 20% chi phí chuyển sang bọc sứ Zirconia thế hệ mới."
  }
];

export default function App() {
  // Mobile navigation state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Sticky header state on scroll
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  
  // Admin dashboard states
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  
  // Submit case modal state ("Gửi ca ngay")
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'form' | 'success'>('form');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, size: string}[]>([]);
  const [formInputs, setFormInputs] = useState<FeedbackForm>({
    doctorName: '',
    clinicName: '',
    phoneNumber: '',
    serviceType: 'Zirconia Cao Cấp',
    notes: ''
  });

  // FAQs active state (ID list to support multi-toggle or single)
  const [openFAQ, setOpenFAQ] = useState<string | null>("faq-1");

  // Highlight active menu on scroll
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    // Auth observer
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdminLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Header sticky
      if (window.scrollY > 40) {
        setIsHeaderSticky(true);
      } else {
        setIsHeaderSticky(false);
      }

      // Sync active section in navigation
      const sections = ['home', 'giou-thieu', 'san-pham', 'quy-trinh', 'bao-hanh', 'faq', 'lien-he'];
      const scrollPos = window.scrollY + 120;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  // Submit case modal handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesArr = Array.from(e.dataTransfer.files).map((f: File) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`
      }));
      setUploadedFiles(prev => [...prev, ...filesArr]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const filesArr = Array.from(e.target.files).map((f: File) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`
      }));
      setUploadedFiles(prev => [...prev, ...filesArr]);
    }
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate simple required
    if (!formInputs.doctorName || !formInputs.clinicName || !formInputs.phoneNumber) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }
    setModalStep('success');
  };

  const closeSubmitModal = () => {
    setIsSubmitModalOpen(false);
    // Timeout to reset states after animation slide out
    setTimeout(() => {
      setModalStep('form');
      setUploadedFiles([]);
      setFormInputs({
        doctorName: '',
        clinicName: '',
        phoneNumber: '',
        serviceType: 'Zirconia Cao Cấp',
        notes: ''
      });
    }, 300);
  };

  // Services catalog with elegant structures
  const services: ServiceItem[] = [
    {
      id: "srv1",
      title: "Răng sứ Zirconia cao cấp",
      description: "Chế tác hoàn toàn từ phôi sứ Zirconia chính hãng đa lớp màu, uốn dẻo cao và thấu quang sinh học tuyệt hảo. Răng sứ giữ được vẻ đẹp óng ả, bền màu vĩnh cửu không bao giờ đen viền lợi.",
      iconName: "Sparkles",
      imageSrc: "/src/assets/images/zirconia_crown_1779366286911.png",
      features: ["Khả năng nén uốn cao >1200 MPa", "Thành phần 100% Zirconia bảo vệ nướu tối ưu", "Đơn vị chế tác CAD/CAM khép kín", "Thẻ bảo hành chính hãng tra cứu trực tuyến"]
    },
    {
      id: "srv2",
      title: "Phục hình Thẩm mỹ Implant",
      description: "Được thiết kế tỉ mỉ từng chi tiết từ thanh liên kết thanh bar tới Custom Abutment độc bản trên các hệ thống vít tối tân toàn cầu như Nobel Biocare, Straumann, Dentium.",
      iconName: "Layers",
      imageSrc: "/src/assets/images/labo_hero_banner_1779366267799.png",
      features: ["Custom Abutment đúng biên dạng nướu nâng niu mô mềm", "Đúc & tiện CNC liên kết dầm nâng cao chịu xé", "Đồng bộ góc cắm xiên tối ưu phân bổ lực", "Sản phẩm đi kèm chứng chỉ mác vật liệu"]
    },
    {
      id: "srv3",
      title: "Thiết kế CAD/CAM số hóa nha khoa",
      description: "Hệ thống số hóa hỗ trợ nhận file scan trực tiếp từ phòng khám thông qua tài khoản Trios, Itero, Medit. Thiết kế 3D nhanh chóng, mô phỏng sinh cơ học nhai tối ưu.",
      iconName: "Cpu",
      imageSrc: "/src/assets/images/cadcam_design_1779366308374.png",
      features: ["Thiết kế 3D bằng phần mềm Exocad bản quyền", "Nha sĩ duyệt file trước khi chế tác", "Chính xác tuyệt đối mức dung sai <20 microns", "Hỗ trợ thiết kế máng hướng dẫn phẫu thuật cấy ghép"]
    },
    {
      id: "srv4",
      title: "Răng sứ kim loại tinh tuyển",
      description: "Sự dung hòa hoàn hảo giữa sườn kết cấu niken-crom hoặc Titanium bền bỉ phối đắp bột sứ Noritake cao cấp Nhật Bản, vừa tiết kiệm chi phí lại có độ bền nhai dẻo dai.",
      iconName: "Award",
      imageSrc: "/src/assets/images/zirconia_crown_1779366286911.png",
      features: [" Titanium lành tính hạn chế oxi hóa", "Lớp đắp men răng phân tầng tinh xảo", "Phù hợp tái cấu trúc răng hàm chịu ăn nhai mạnh", "Kiểm soát bám cặn bề mặt tối đa"]
    },
    {
      id: "srv5",
      title: "Hàm giả tháo lắp thẩm mỹ & linh hoạt",
      description: "Sử dụng vật liệu nhựa nền dẻo Biosoft cao cấp kháng co ngót kết hợp răng giả composite/ sứ có định vị tốt. Thiết kế thông minh tối giản thể tích và cực kỳ êm ái.",
      iconName: "Heart",
      imageSrc: "/src/assets/images/cadcam_design_1779366308374.png",
      features: ["Nhựa dẻo sinh học mỏng nhẹ không kích ứng", "Màu nướu hồng nhu động tự nhiên", "Phân bổ lực tì đồng đều chống tiêu xương", "Dễ tháo lắp, thắt chặt khít giữ vững ổn định"]
    }
  ];

  // Helper function to map icons safely
  const renderServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-brand-gold" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-brand-gold" />;
      case 'Layers':
        return <Layers className="w-6 h-6 text-brand-gold" />;
      case 'Award':
        return <Award className="w-6 h-6 text-brand-gold" />;
      case 'Heart':
        return <Heart className="w-6 h-6 text-brand-gold" />;
      default:
        return <Award className="w-6 h-6 text-brand-gold" />;
    }
  };

  // Timeline structures
  const steps = [
    {
      no: "01",
      title: "Tiếp nhận thông tin mẫu",
      desc: "VSTAR nhận dấu thạch cao vật lý truyền thống từ shipper hoặc tiếp nhận file scan kỹ thuật số 3D trực tuyến (Trios, Itero, Medit) cực kỳ nhanh chóng."
    },
    {
      no: "02",
      title: "Thiết kế CAD 3D",
      desc: "Kỹ thuật viên phòng CAD sử dụng Exocad để dựng trục, tạo hình tối ưu viền cổ răng và thiết kế khớp cắn cá nhân hóa hoàn mỹ theo đúng yêu cầu bệnh án."
    },
    {
      no: "03",
      title: "Chế tác CAM tự động",
      desc: "Máy phay CNC CAD/CAM Thụy Sĩ/Đức tiến hành tiện phôi sứ thạch anh, Zirconia hoặc titanium khối với độ chính xác cơ học hoàn hảo từng Micromet."
    },
    {
      no: "04",
      title: "Stain & Glaze nghệ thuật",
      desc: "Khen thưởng bàn tay đắp sứ lành nghề, vẽ màu mô tả những đường nứt mờ, thấu quang rìa cắn răng thật rồi nướng bóng ở nhiệt độ chuyên dụng."
    },
    {
      no: "05",
      title: "Kiểm định chất lượng (QC)",
      desc: "Phục hình được đặt lại trên mẫu thạch cao chuẩn, kiểm tra gờ rãnh khớp cắn, kẽ tiếp xúc và sườn chịu lực kép qua kính hiển vi y khoa nghiêm ngặt."
    },
    {
      no: "06",
      title: "Đóng gói & Bàn giao",
      desc: "Phục hình hoàn tất được sát khuẩn tuyệt trùng, đóng hộp lót nhung sang trọng kèm thẻ bảo hành chống giả, giao hỏa tốc tận nha sĩ đúng hẹn."
    }
  ];

  // FAQs
  const faqItems: FAQItem[] = [
    {
      id: "faq-1",
      question: "Mã tra cứu bảo hành của LABO VSTAR nằm ở vị trí nào và lấy ra sao?",
      answer: "Mã số định danh bảo hành của LABO VSTAR được in chìm rõ ràng trên dải từ của Thẻ Bảo Hành VSTAR VIP chính hãng giao kèm với răng sứ của bạn, hoặc được in trực tiếp ngay dòng 'Mã Warranty' trên Phiếu giao nhận Labo bàn giao cho Nha khoa lâm sàng."
    },
    {
      id: "faq-2",
      question: "Để tra cứu thông tin phục hình chính xác cần chuẩn bị những thông tin gì?",
      answer: "Để bảo mật thông tin riêng tư, quý khách chỉ cần nhập chính xác 2 thông tin gồm: Mã số bảo hành in trên thẻ (ví dụ mẫu test: VSTAR2026) và đúng Năm sinh của chủ nhân phục hình răng sứ (ví dụ mẫu test: 1990)."
    },
    {
      id: "faq-3",
      question: "Chính sách và điều kiện bảo hành phục hình răng sứ tại LABO VSTAR là gì?",
      answer: "LABO VSTAR bảo hành các lỗi liên quan đến kỹ thuật chế tác như: nứt, vỡ sườn sứ tự nhiên khi ăn nhai bình thường, hở viền cổ răng do lỗi CAD/CAM hay bong tróc lớp men sứ. Phục hình sẽ không được bảo hành trong trường hợp nứt vỡ do tai nạn ngoại lực mạnh, cạy vật cứng phi thực phẩm, nha sĩ chỉnh mài phạm sườn hoặc các bệnh lý nha chu nghiêm trọng phá hủy chân răng gốc."
    },
    {
      id: "faq-4",
      question: "Nếu không tra cứu được mã hoặc sai lệch thông tin thì tôi phải thế nào?",
      answer: "Rất có thể dữ liệu mới cập nhật đang được đồng bộ hoặc mã nhập chưa chính xác. Vui lòng kiểm tra lại chính xác chữ hoa ký tự, hoặc nhấc máy gọi Hotline/Zalo phản hồi trực tiếp: 0342610789, đội ngũ chăm sóc khách hàng của LABO VSTAR sẽ hỗ trợ sửa đổi và xác thực tức khắc cho bạn."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans tracking-tight selection:bg-brand-gold selection:text-white relative">
      
      {/* BACKGROUND GRAPHIC ACCENTS */}
      <div className="absolute top-[10%] left-[-10%] w-[45%] h-[600px] bg-sky-100/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-[40%] right-[-10%] w-[40%] h-[700px] bg-yellow-50/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* 1. CINEMATIC INTEGRATED HEADER (TOP BAR + NAVIGATION BAR OVERLAYED ON HERO IMAGE) */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isHeaderSticky 
          ? 'bg-[#051120]/95 backdrop-blur-md border-b border-white/10 shadow-xl py-2 sm:py-2.5 text-white' 
          : 'bg-transparent border-b border-white/5 py-4 text-white'
      }`}>
        {/* Dynamic Transition-collapsible Top Info Bar inside Header */}
        <div className={`transition-all duration-300 ${
          isHeaderSticky 
            ? 'max-h-0 opacity-0 overflow-hidden pb-0 mb-0 pointer-events-none' 
            : 'max-h-16 opacity-100 pb-3 mb-3 border-b border-white/5 px-4 sm:px-6 lg:px-8'
        }`}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
            
            {/* Left: Cert Standard */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold tracking-wide text-white/90">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>LABO CHẾ TÁC KỸ THUẬT SỐ ĐẠT CHUẨN ISO 13485:2016</span>
              </span>
            </div>

            {/* Center: Brand Center Header */}
            <div className="hidden lg:block">
              <span className="text-[11px] font-bold tracking-[0.2em] text-brand-gold">
                MED-TECH VSTAR LAB
              </span>
            </div>

            {/* Right: Contact details */}
            <div className="flex items-center gap-4 text-[10px] sm:text-xs text-white/80 font-medium">
              <span className="hover:text-brand-gold transition-colors flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-brand-gold" />
                <span>Hotline: 0342610789</span>
              </span>
              <span className="hidden md:flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                <span>Địa chỉ: 157/1 Hưng Phú, P. Hưng Phú, Q.8, TP.HCM</span>
              </span>
            </div>

          </div>
        </div>

        {/* 2. CORE NAVBAR ELEMENT */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo VStar */}
          <a href="#home" id="nav-logo" className="flex items-center gap-2 group">
            <VStarLogo size="md" light={true} logoStyle={{ width: '50px', height: '50px' }} />
          </a>

          {/* Nav menu links for elegant scrolling */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { name: "Trang chủ", href: "#home", id: "home" },
              { name: "Giới thiệu", href: "#giou-thieu", id: "giou-thieu" },
              { name: "Dịch vụ", href: "#san-pham", id: "san-pham" },
              { name: "Quy trình", href: "#quy-trinh", id: "quy-trinh" },
              { name: "Bảo hành", href: "#bao-hanh", id: "bao-hanh" },
              { name: "Hỏi đáp", href: "#faq", id: "faq" },
              { name: "Liên hệ", href: "#lien-he", id: "lien-he" }
            ].map((link) => (
              <a 
                key={link.id}
                href={link.href} 
                className={`text-[14px] font-semibold tracking-wide transition-all duration-300 relative py-1 group ${
                  activeSection === link.id 
                    ? 'text-brand-gold font-bold' 
                    : 'text-white/85 hover:text-white'
                }`}
              >
                <span>{link.name}</span>
                {/* Custom glowing underlines */}
                <span className={`absolute bottom-0 left-0 w-0 h-[2px] bg-brand-gold transition-all duration-300 group-hover:w-full ${
                  activeSection === link.id ? 'w-full' : ''
                }`}></span>
              </a>
            ))}
          </nav>

          {/* Quick submission CTA Button */}
          <div className="hidden sm:flex items-center gap-3">
            <button 
              id="header-cta"
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-5 py-2.5 bg-brand-gold hover:bg-white text-[#0A2540] font-bold text-xs tracking-wider uppercase rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg active:scale-95 group cursor-pointer border border-brand-gold/20"
            >
              <span>Gửi ca lâm sàng</span>
              <ArrowUpRight className="w-4 h-4 text-[#0A2540] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Hamburger trigger */}
          <button 
            id="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 pointer-events-none" />}
          </button>

        </div>
      </header>

      {/* 3. PREMIUM DARK MOBILE SIDEBAR NAVIGATION DRAWER */}
      <div className={`fixed inset-0 z-50 lg:hidden pointer-events-none transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}>
        {/* Dark Glass Backdrop overlay */}
        <div 
          className={`absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Slide-out Panel */}
        <div className={`absolute top-0 right-0 bottom-0 w-[360px] max-w-[85vw] bg-[#051120] border-l border-white/10 shadow-2xl flex flex-col justify-between p-6 transition-transform duration-300 h-full pointer-events-auto ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div>
            {/* Header top row */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <VStarLogo size="md" light={true} />
              
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-white/5 text-white/75 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close menu drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List links */}
            <nav className="flex flex-col gap-2 py-8">
              {[
                { name: "Trang chủ", href: "#home" },
                { name: "Giới thiệu VSTAR", href: "#giou-thieu" },
                { name: "Dịch vụ nổi bật", href: "#san-pham" },
                { name: "Quy trình chế tác", href: "#quy-trinh" },
                { name: "Hệ thống bảo hành", href: "#bao-hanh" },
                { name: "Hỏi đáp & hỗ trợ", href: "#faq" },
                { name: "Liên hệ ngay", href: "#lien-he" }
              ].map((item, idx) => (
                <a 
                  key={idx}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-md font-semibold text-white/85 hover:bg-white/5 hover:text-brand-gold transition-all group"
                >
                  <span>{item.name}</span>
                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-brand-gold group-hover:translate-x-1 transition-all" />
                </a>
              ))}
            </nav>
          </div>

          {/* Bottom actions inside drawer */}
          <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSubmitModalOpen(true);
              }}
              className="w-full py-3.5 bg-brand-gold hover:bg-white text-[#0A2540] font-bold rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>GỞI CA LÂM SÀNG NGAY</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <div className="text-center text-xs text-slate-400 mt-2">
              Hotline hỗ trợ kỹ thuật: <span className="font-bold text-white">0342.610.789</span>
            </div>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <HeroBanner 
        onSubmitCaseClick={() => setIsSubmitModalOpen(true)}
        onSearchWarrantyClick={() => {
          const element = document.getElementById('bao-hanh');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
      />

      {/* 4. STATIONARY FLOATING BUTTONS (Zalo, Telefon, Facebook on the right-hand corner of the viewport) */}
      <div className="fixed right-4 bottom-24 z-40 flex flex-col gap-3.5 leading-none">
        
        {/* Zalo Button */}
        <a 
          href="https://zalo.me/0342610789" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#0089d0] border border-white/15 text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
          title="Chat Zalo"
        >
          {/* Gold Pulse ring */}
          <span className="absolute -inset-0.5 rounded-full bg-brand-gold/30 animate-pulse pointer-events-none"></span>
          
          <span className="font-display font-black text-[9px] tracking-wider text-white">ZALO</span>
          
          {/* Tooltip on hover */}
          <span className="absolute right-14 bg-[#0A2540] text-brand-gold text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 pointer-events-none transition-all duration-300 whitespace-nowrap">
            Chat Zalo: 0342610789
          </span>
        </a>

        {/* Telephone Call Button */}
        <a 
          href="tel:0342610789" 
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-brand-gold border border-brand-gold/30 text-[#0A2540] shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
          title="Gọi hotline"
        >
          <Phone className="w-5 h-5 text-[#0A2540] animate-pulse" />
          
          {/* Tooltip on hover */}
          <span className="absolute right-14 bg-[#0A2540] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 pointer-events-none transition-all duration-300 whitespace-nowrap">
            Gọi Hotline: 0342.610.789
          </span>
        </a>

        {/* Facebook Link Button */}
        <a 
          href="https://facebook.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#1877f2] border border-white/10 text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
          title="Facebook Fanpage"
        >
          <span className="font-display font-black text-lg -mt-0.5">f</span>

          {/* Tooltip on hover */}
          <span className="absolute right-14 bg-[#0A2540] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 pointer-events-none transition-all duration-300 whitespace-nowrap">
            Liên hệ Facebook
          </span>
        </a>

      </div>

      {/* INTRODUCTION SECTION / ABOUT */}
      <section id="giou-thieu" className="py-16 lg:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            
            {/* Image display */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-100 bg-slate-50">
                <img 
                  src="/src/assets/images/cadcam_design_1779366308374.png" 
                  alt="3D Clinical Crown Exocad Designing VSTAR" 
                  className="w-full h-full object-cover aspect-[4/3]"
                  id="intro-img-workstation"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                  <p className="text-xs font-bold text-brand-blue flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                    Bản Quyền Exocad Đức
                  </p>
                </div>
              </div>
              
              {/* Back card decoration */}
              <div className="absolute -bottom-5 -right-5 -z-10 w-full h-full border-2 border-brand-gold/30 rounded-2xl translate-x-3 translate-y-3 pointer-events-none"></div>
            </div>

            {/* About Texts */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">Hành trình kiến tạo</span>
              <h2 className="text-2.5xl sm:text-3xl lg:text-4xl font-display font-black text-brand-blue mt-2 mb-6">
                Kiến tạo phục hình chuẩn xác cho từng ca lâm sàng
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Tại <span className="font-semibold text-brand-blue">LABO VSTAR</span>, chúng tôi thấu hiểu mỗi chiếc phục hình răng sứ không đơn thuần chỉ là kết quả cơ học, mà là từng ánh kim, múi rãnh, nụ cười và sức khỏe dài lâu của bệnh nhân.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="w-6 h-6 flex-shrink-0 rounded bg-indigo-50 flex items-center justify-center mt-1">
                    <Check className="w-4 h-4 text-brand-blue" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Cơ cấu số hóa hiện đại hóa</h4>
                    <p className="text-xs text-slate-500">Chuyển giao và tích hợp trực tiếp 100% công nghệ CAD/CAM y khoa tối tân.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="w-6 h-6 flex-shrink-0 rounded bg-indigo-50 flex items-center justify-center mt-1">
                    <Check className="w-4 h-4 text-brand-blue" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Vật liệu sinh học đạt kiểm chứng</h4>
                    <p className="text-xs text-slate-500">Toàn bộ phôi sườn có tem chống giả, nguồn gốc rõ ràng từ Đức, Nhật, Thụy Sĩ.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="w-6 h-6 flex-shrink-0 rounded bg-indigo-50 flex items-center justify-center mt-1">
                    <Check className="w-4 h-4 text-brand-blue" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Nâng tầm đối tác phòng khám</h4>
                    <p className="text-xs text-slate-500">Đồng hành bàn giao siêu tốc, bảo trì tận tâm và hỗ trợ chuyên môn cặn kẽ.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-700">Dr. H</div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-400 flex items-center justify-center text-[10px] font-bold text-white">V*</div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-500 flex items-center justify-center text-[10px] font-bold text-white">20+</div>
                </div>
                <div className="text-xs">
                  <span className="font-bold text-brand-blue block">Hơn 200+ Nha khoa hợp tác</span>
                  <span className="text-slate-400">Trên toàn địa bàn TP.HCM và các tỉnh lân cận</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* SECTION NĂNG LỰC / CHỈ SỐ */}
      <section className="py-16 bg-gradient-to-b from-white to-slate-50 border-t border-b border-indigo-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">Tiêu chuẩn quốc tế</span>
            <h2 className="text-2.5xl sm:text-3xl font-display font-black text-brand-blue mt-1">
              Cam kết giá trị vàng từ LABO VSTAR
            </h2>
            <div className="w-12 h-1 bg-brand-gold mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-brand-gold/30 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-brand-blue mb-2">Đúng Hẹn Tuyệt Đối</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Chúng tôi thấu hiểu việc trễ hẹn mài lắp răng cực kỳ nguy hiểm cho uy tín Bác sĩ. Quy trình quản trị đơn hàng VSTAR đảm bảo 100% đúng tiến độ thỏa thuận.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-brand-gold/30 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-brand-blue mb-2">Vật Liệu Chính Hãng</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Chỉ sử dụng phôi sứ chính ngạch có mã bảo mật ID rõ ràng. Không dùng hàng trôi nổi kém chất lượng, bảo vệ sức khỏe sinh học tối đa của bệnh nhân.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-brand-gold/30 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-brand-blue mb-2">Chuẩn Xác Kỹ Thuật</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ứng dụng máy phay CAD/CAM, lấy mẫu 3D số hóa loại bỏ các sai số cơ học so với đổ hố mài răng truyền thống. Đảm bảo khớp gờ chuẩn xác, khít nướu.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-brand-gold/30 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-brand-blue mb-2">Hỗ Trợ Nha Khoa Nhanh</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kỹ thuật viên trưởng trực tuyến hỗ trợ liên lạc trực tiếp cùng bác sĩ xử lý file scan phức tạp, tư vấn loại sứ phù hợp cho từng dạng khiếm khuyết xương.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION SẢN PHẨM / DỊCH VỤ DẠNG CARD SANG TRỌNG */}
      <section id="san-pham" className="py-16 lg:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">Danh mục phục hình</span>
            <h2 className="text-2.5xl sm:text-3xl lg:text-4xl font-display font-black text-brand-blue mt-1">
              Phục hình chất lượng cao tại LABO VSTAR
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-3">
              Những dòng răng sứ, hàm giả tháo lắp và phục hình số hóa được gia công tỉ mỉ với tay nghề khéo léo của các nghệ nhân nha khoa.
            </p>
            <div className="w-12 h-1 bg-brand-gold mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((srv, index) => (
              <div 
                key={srv.id} 
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl p-5 hover:border-slate-200 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  
                  {/* Card Visual Header Image */}
                  <div className="w-full h-48 bg-slate-100 rounded-xl overflow-hidden relative mb-5">
                    <img 
                      src={srv.imageSrc} 
                      alt={srv.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-85"></div>
                    <div className="absolute top-3 left-3 w-10 h-10 rounded-lg bg-white/95 backdrop-blur-sm flex items-center justify-center shadow">
                      {renderServiceIcon(srv.iconName)}
                    </div>
                    
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold font-bold">Chế tác số hóa</span>
                      <h4 className="font-display font-bold text-sm line-clamp-1">{srv.title}</h4>
                    </div>
                  </div>

                  {/* Desc */}
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    {srv.description}
                  </p>

                  {/* Bullet features */}
                  <ul className="space-y-2 mb-6">
                    {srv.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] text-slate-600">
                        <span className="w-4 h-4 rounded-full bg-indigo-50 flex items-center justify-center text-brand-blue flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-brand-blue" />
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-brand-gold font-bold uppercase tracking-wider">Hỗ trợ hỏa tốc</span>
                  <button 
                    onClick={() => {
                      setFormInputs(prev => ({
                        ...prev,
                        serviceType: srv.title
                      }));
                      setIsSubmitModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-brand-blue hover:text-brand-gold transition-colors cursor-pointer"
                  >
                    <span>Yêu cầu báo giá</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* QUI TRÌNH LÀM VIỆC TIMELINE */}
      <section id="quy-trinh" className="py-16 lg:py-24 bg-slate-900 text-white relative overflow-hidden">
        
        {/* Glow vector pattern background */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-blue/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-brand-gold/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-widest block">Quy trình công phu</span>
            <h2 className="text-2.5xl sm:text-3xl lg:text-4xl font-display font-black text-white mt-2">
              Quy Trình Chế Tác Labo Thẩm Mỹ Số 1vst
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Quy trình khép kín tối ưu qua 6 bước kiểm tra nghiêm túc trước khi chuyển tới tận phòng khám của bác sĩ.
            </p>
            <div className="w-12 h-1 bg-brand-gold mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
            
            {/* Steps Rendering */}
            {steps.map((st, index) => (
              <div 
                key={index}
                className="bg-slate-800/60 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl relative hover:border-brand-gold/40 transition-all duration-300 hover:bg-slate-800 group"
              >
                <div className="absolute top-4 right-4 text-4xl font-display font-black text-slate-700/60 group-hover:text-brand-gold/20 transition-colors">
                  {st.no}
                </div>
                
                <div className="w-10 h-10 rounded-lg bg-brand-blue border border-slate-700 flex items-center justify-center font-display font-bold text-brand-gold mb-5">
                  {st.no}
                </div>

                <h3 className="font-display font-bold text-lg text-white mb-2 group-hover:text-brand-gold transition-colors">
                  {st.title}
                </h3>
                
                <p className="text-xs text-slate-350 leading-relaxed md:h-16">
                  {st.desc}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Trực phòng: KTV Trưởng</span>
                  <span className="flex items-center gap-1 font-mono text-emerald-400">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                    Hỏa tốc
                  </span>
                </div>
              </div>
            ))}

          </div>

          <div className="mt-12 text-center">
            <p className="text-xs text-slate-400 max-w-lg mx-auto mb-6">
              VSTAR trang bị phòng máy phay Roland DWX, máy in 3D sinh học tối tân cùng với lò nung kết Zirconia thế hệ mới nhất cho ra sườn khít sáp tuyệt đối.
            </p>
            <button 
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-6 py-3 bg-brand-gold text-slate-950 font-bold text-sm rounded-lg hover:bg-yellow-500 transition-colors cursor-pointer shadow-md inline-flex items-center gap-2"
            >
              <span>Xem trực quan xưởng chế tác</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* SECTION TRA CỨU BẢO HÀNH */}
      <section id="bao-hanh" className="py-16 lg:py-24 bg-gradient-to-b from-slate-50 to-white relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">Hệ thống bảo hành điện tử chính hãng</span>
            <h2 className="text-2.5xl sm:text-3xl font-display font-black text-brand-blue mt-1">
              Tra cứu thông tin bảo hành
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Nhập chính xác <span className="font-semibold text-brand-blue">Mã bảo hành điện tử</span> và <span className="font-semibold text-brand-blue">Năm sinh khách hàng</span> để kiểm tra chi tiết thông tin sườn phôi sứ chính hãng LABO VSTAR.
            </p>
            <div className="w-12 h-1 bg-brand-gold mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Core Firestore search component */}
          <WarrantyCheck />

        </div>
      </section>

      {/* SECTION FAQs ACCORDION */}
      <section id="faq" className="py-16 lg:py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-wider block">Giải đáp hỗ trợ</span>
            <h2 className="text-2.5xl sm:text-3xl font-display font-black text-brand-blue mt-1">
              Câu hỏi thường gặp về VSTAR
            </h2>
            <div className="w-12 h-1 bg-brand-gold mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="space-y-4">
            {faqItems.map((item) => {
              const isOpen = openFAQ === item.id;
              return (
                <div 
                  key={item.id} 
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-brand-gold shadow-md bg-slate-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                >
                  <button
                    onClick={() => setOpenFAQ(isOpen ? null : item.id)}
                    className="w-full flex justify-between items-center px-6 py-5 text-left focus:outline-none"
                  >
                    <span className="font-display font-bold text-sm sm:text-base text-brand-blue pr-4">
                      {item.question}
                    </span>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isOpen ? 'bg-brand-blue text-white rotate-180' : 'bg-slate-100 text-slate-500'}`}>
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  <div 
                    className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[300px] border-t border-slate-100' : 'max-h-0'}`}
                  >
                    <p className="px-6 py-5 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white/50">
                      {item.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION LIÊN HỆ */}
      <section id="lien-he" className="py-16 lg:py-24 bg-gradient-to-tr from-[#0F2E59] to-brand-blue text-white relative">
        <div className="absolute inset-0 bg-slate-950/20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            
            {/* Contact Information */}
            <div>
              <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">Liên hệ hợp tác</span>
              <h2 className="text-2.5xl sm:text-3xl lg:text-4xl font-display font-black text-white mt-2 mb-6">
                Kiến tạo nụ cười hoàn mỹ cùng LABO VSTAR
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mb-8 leading-relaxed">
                Chúng tôi liên tục cập nhật công nghệ và mở rộng hệ thống phòng Lab hiện đại phục vụ các y bác sĩ trên cả nước. Vui lòng liên hệ với VSTAR để nhận báo giá sỉ, mẫu hàm hoàn thiện và các chính sách ưu đãi phân khúc VIP.
              </p>

              {/* Contact item bullets */}
              <div className="space-y-6">
                
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-brand-gold flex-shrink-0 mt-0.5 border border-white/5">
                    <Phone className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-yellow-300 uppercase tracking-widest">Đường dây nóng (Zalo):</h4>
                    <p className="text-base sm:text-lg font-bold font-mono text-white mt-1">0342.610.789</p>
                    <p className="text-[11px] text-slate-400">(Nhấp gọi điện hoặc kết bạn miễn phí nhận mẫu chỉ định)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-brand-gold flex-shrink-0 mt-0.5 border border-white/5">
                    <MapPin className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-yellow-300 uppercase tracking-widest">Địa chỉ Trung tâm Labo:</h4>
                    <p className="text-sm text-slate-100 mt-1 leading-relaxed">
                      157/1 Hưng Phú, Phường Hưng Phú, Quận 8, Thành phố Hồ Chí Minh
                    </p>
                    <p className="text-[11px] text-slate-450">(Vị trí thuận tiện kết nối, nhận ca nội thành nhanh chóng)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-brand-gold flex-shrink-0 mt-0.5 border border-white/5">
                    <Clock className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-yellow-300 uppercase tracking-widest">Thời gian làm việc:</h4>
                    <p className="text-sm text-slate-200 mt-1">Thứ 2 - Chủ Nhật: 08:00 AM - 19:30 PM (Trực ca lâm sàng 24/7)</p>
                  </div>
                </div>

              </div>

            </div>

            {/* Quick Consultation Form Box Card */}
            <div className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10">
              <h3 className="font-display font-black text-xl text-brand-blue mb-2">Đăng Ký Khảo Sát & Nhận Mẫu Sứ</h3>
              <p className="text-xs text-slate-400 mb-6">LABO VSTAR gửi tặng bộ phôi sứ răng mẫu thử miễn phí cho phòng khám đăng ký hợp tác lần đầu.</p>
              
              <form onSubmit={(e) => { e.preventDefault(); alert("Cám ơn thông tin của Bác sĩ! LABO VSTAR sẽ gọi điện tư vấn và tặng quà ngay lập tức."); }} className="space-y-4">
                <div>
                  <label htmlFor="formDoctorName" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Tên Bác sĩ/Chủ phòng khám:</label>
                  <input 
                    id="formDoctorName"
                    type="text" 
                    placeholder="Ví dụ: Bác sĩ Nguyễn Hoàng Lâm"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold rounded-xl text-xs sm:text-sm font-semibold focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="formClinicName" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Tên Nha Khoa:</label>
                  <input 
                    id="formClinicName"
                    type="text" 
                    placeholder="Ví dụ: Nha Khoa Thẩm Mỹ Sài Gòn"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold rounded-xl text-xs sm:text-sm font-semibold focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="formPhoneNumber" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Số điện thoại / Zalo liên hệ:</label>
                  <input 
                    id="formPhoneNumber"
                    type="tel" 
                    placeholder="Ví dụ: 0342610789"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold rounded-xl text-xs sm:text-sm font-semibold focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="formRestorationSelect" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Đặc biệt quan tâm sản phẩm nào:</label>
                  <select 
                    id="formRestorationSelect"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold rounded-xl text-xs sm:text-sm font-semibold focus:outline-none transition-colors"
                  >
                    <option>Sứ Zirconia đa lớp</option>
                    <option>Sườn Titan và sườn hợp kim</option>
                    <option>Hàm dẻo tháo lắp thẩm mỹ</option>
                    <option>Implant cá nhân hóa CAD/CAM</option>
                    <option>Thiết kế hướng dẫn máng phẫu thuật</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="formMessageNotes" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Ghi chú yêu cầu lâm sàng hoặc mẫu thử:</label>
                  <textarea 
                    id="formMessageNotes"
                    rows={3}
                    placeholder="Nhập ghi chú yêu cầu gửi gắm riêng tới phòng kỹ thuật VSTAR..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold rounded-xl text-xs sm:text-sm font-semibold focus:outline-none transition-colors resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-brand-blue hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-98 text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-brand-gold" />
                  <span>Đăng ký nhận thông tin liên kết</span>
                </button>
              </form>

            </div>

          </div>

        </div>
      </section>

      {/* FOOTER SECTION */}
      <footer className="bg-[#040f1a] text-white pt-16 pb-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
            
            {/* Column 1 Logo brand and slogan */}
            <div className="lg:col-span-4">
              <a href="#home" className="flex items-center gap-2.5 mb-5 w-fit">
                <VStarLogo size="md" light={true} />
              </a>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed max-w-sm">
                LABO VSTAR – Kiến tạo nụ cười, vững bền theo thời gian. Tự hào đồng hành cung cấp giải pháp phục hình cao cấp, thẩm mỹ tối tân cho phòng khám và bệnh viện đa quốc gia.
              </p>
              
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-medium">Bảo mật thông tin:</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 py-0.5 px-2 rounded border border-slate-700 font-mono">SSL Secure</span>
              </div>
            </div>

            {/* Column 2 Quick links */}
            <div className="lg:col-span-3">
              <h4 className="font-display font-bold text-sm uppercase tracking-wider text-brand-gold mb-5">Liên kết nhanh</h4>
              <ul className="space-y-3 text-xs text-slate-350">
                <li><a href="#home" className="hover:text-brand-gold transition-colors block">Trang chủ</a></li>
                <li><a href="#giou-thieu" className="hover:text-brand-gold transition-colors block">Giới thiệu sản xuất</a></li>
                <li><a href="#san-pham" className="hover:text-brand-gold transition-colors block">Danh mục phục hình răng sứ</a></li>
                <li><a href="#quy-trinh" className="hover:text-brand-gold transition-colors block">Quy trình công nghệ CAD/CAM</a></li>
                <li><a href="#bao-hanh" className="hover:text-brand-gold transition-colors block">Tra cứu bảo hành trực tuyến</a></li>
                <li><a href="#faq" className="hover:text-brand-gold transition-colors block">Câu hỏi thường gặp</a></li>
              </ul>
            </div>

            {/* Column 3 Business hours & info */}
            <div className="lg:col-span-5">
              <h4 className="font-display font-bold text-sm uppercase tracking-wider text-brand-gold mb-5">Thông tin liên hệ chi tiết</h4>
              <p className="text-xs text-slate-350 mb-3 leading-relaxed">
                <span className="font-semibold text-white">Địa chỉ:</span> 157/1 Hưng Phú, Phường Hưng Phú, Quận 8, Thành phố Hồ Chí Minh, Việt Nam
              </p>
              <p className="text-xs text-slate-350 mb-3">
                <span className="font-semibold text-white">Hotline/Zalo hỗ trợ Bác sĩ:</span> 0342.610.789
              </p>
              <p className="text-xs text-slate-350">
                <span className="font-semibold text-white">Lĩnh vực hoạt động:</span> Thiết kế số hóa CAD/CAM răng sứ Zirconia thẩm mỹ cao, nướng nung răng kim loại Titan, máng phẫu thuật, phục hình tháo lắp dẻo y khoa.
              </p>
            </div>

          </div>

          {/* Copyright signature */}
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
            <p>© 2026 LABO VSTAR. Toàn bộ bản quyền được bảo hộ pháp lý. Thương hiệu được cố vấn lâm sàng bởi Nha khoa uy tín.</p>
            <div className="flex items-center gap-4">
              <a href="#home" className="hover:underline">Chính sách bảo mật</a>
              <a href="#home" className="hover:underline">Điều khoản sử dụng</a>
              <button 
                onClick={() => setIsAdminOpen(true)} 
                className="hover:underline text-brand-gold font-bold uppercase tracking-wider text-[10px] cursor-pointer"
              >
                Cổng quản trị viên
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* MODAL DIALOGUE: GỬI CA LÂM SÀNG NGAY */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
          
          {/* Backdrop overlay */}
          <div 
            onClick={closeSubmitModal}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Modal Container */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full relative z-10 overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center border-b border-slate-800">
              <div>
                <span className="text-[10px] text-brand-gold font-bold uppercase tracking-widest font-mono">Phiếu tiếp nhận</span>
                <h3 className="font-display font-black text-lg text-white">Gửi Ca Lâm Sàng Trực Tuyến</h3>
              </div>
              <button 
                onClick={closeSubmitModal}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="overflow-y-auto p-6 flex-1">
              {modalStep === 'form' ? (
                <form onSubmit={handleCaseSubmit} className="space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="modalDoctorName" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Tên bác sĩ chỉ định (*):</label>
                      <input 
                        id="modalDoctorName"
                        type="text" 
                        name="doctorName"
                        value={formInputs.doctorName}
                        onChange={handleFormInputChange}
                        required
                        placeholder="Bác sĩ nhận phục hình"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="modalClinicName" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Tên phòng khám nha khoa (*):</label>
                      <input 
                        id="modalClinicName"
                        type="text" 
                        name="clinicName"
                        value={formInputs.clinicName}
                        onChange={handleFormInputChange}
                        required
                        placeholder="Ví dụ: Nha Khoa Sài Gòn"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="modalPhoneNumber" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Số điện thoại liên hệ (*):</label>
                      <input 
                        id="modalPhoneNumber"
                        type="tel" 
                        name="phoneNumber"
                        value={formInputs.phoneNumber}
                        onChange={handleFormInputChange}
                        required
                        placeholder="Số gọi hoặc gửi kết quả Zalo"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="modalServiceType" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Dòng sườn/Loại chỉ định:</label>
                      <select 
                        id="modalServiceType"
                        name="serviceType"
                        value={formInputs.serviceType}
                        onChange={handleFormInputChange}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                      >
                        <option>Zirconia Cao Cấp</option>
                        <option>Phục hình Thẩm mỹ Implant</option>
                        <option>Thiết kế CAD/CAM số hóa</option>
                        <option>Răng sứ kim loại tinh tuyển</option>
                        <option>Hàm giả tháo lắp</option>
                      </select>
                    </div>
                  </div>

                  {/* Drag and Drop Scan file upload widget */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Tải file scan (STL/OBJ/PLY) hoặc hình ảnh chỉ định mẫu:</label>
                    
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${dragActive ? 'border-brand-gold bg-yellow-50/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'}`}
                    >
                      <input 
                        type="file" 
                        id="file-upload-input" 
                        multiple 
                        onChange={handleFileSelect}
                        className="hidden" 
                      />
                      <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mb-2">
                          <Upload className="w-5 h-5 text-brand-blue" />
                        </div>
                        <p className="text-xs font-bold text-slate-700">Kéo thả file scan 3D hoặc Click vào đây để duyệt</p>
                        <p className="text-[10px] text-slate-450 mt-1">Đính kèm ảnh chụp mẫu, phiếu chỉ định nha khoa hoặc file STL cắn khớp</p>
                      </label>
                    </div>

                    {/* Display uploaded files list if any */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 max-h-[110px] overflow-y-auto">
                        <p className="text-[10px] font-black text-brand-blue uppercase mb-1">Danh sách file đã đính kèm ({uploadedFiles.length}):</p>
                        <ul className="space-y-1">
                          {uploadedFiles.map((file, idx) => (
                            <li key={idx} className="flex justify-between items-center text-xs text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-150">
                              <span className="truncate max-w-[280px] font-semibold">{file.name}</span>
                              <span className="text-[10px] text-indigo-600 font-mono">{file.size}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="modalNotes" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Yêu cầu thiết kế chi tiết (Đường hoàn tất, nướu, màu răng):</label>
                    <textarea 
                      id="modalNotes"
                      name="notes"
                      value={formInputs.notes}
                      onChange={handleFormInputChange}
                      rows={3}
                      placeholder="Ví dụ: Răng nướu tự nhiên, đắp sứ thấu quang rìa cắn dòng OM2, khít sát tối đa."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:bg-white focus:border-brand-gold text-xs sm:text-sm font-semibold focus:outline-none transition-colors resize-none"
                    ></textarea>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit"
                      className="w-full py-3.5 bg-brand-blue hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4 text-brand-gold" />
                      <span>GỬI CA LÂM SÀNG NGAY</span>
                    </button>
                    <p className="text-center text-[10px] text-slate-450 mt-2.5">
                      Đội ngũ giao nhận & Thiết kế VSTAR sẽ liên hệ trực tiếp Bác sĩ để xác minh thông số chỉ trong vòng 15 phút.
                    </p>
                  </div>

                </form>
              ) : (
                <div className="text-center py-10 px-4 animate-scale-up">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8" />
                  </div>
                  
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Gửi thông tin thành công</span>
                  <h3 className="font-display font-black text-xl text-slate-900 mt-4 mb-2">
                    VSTAR ĐÃ TIẾP NHẬN YÊU CẦU CHẾ TÁC
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed mb-6">
                    Hệ thống đã mã hóa an toàn dữ liệu lâm sàng của Bác sĩ <span className="font-bold text-brand-blue">{formInputs.doctorName}</span> từ nha khoa <span className="font-bold text-brand-blue">{formInputs.clinicName}</span>. Kỹ thuật viên phụ trách dịch vụ <span className="font-semibold text-brand-gold">“{formInputs.serviceType}”</span> sẽ liên lạc trực tiếp qua số <span className="font-mono font-bold text-slate-800">{formInputs.phoneNumber}</span> ngay lúc này.
                  </p>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-xs mb-6 max-w-sm mx-auto">
                    <h4 className="font-bold text-brand-blue uppercase mb-2">Tóm tắt ca gửi nhận:</h4>
                    <p className="mb-1"><span className="text-slate-400">Thiết kế:</span> 3D Exocad Digital</p>
                    <p className="mb-1"><span className="text-slate-400">Tệp tin:</span> {uploadedFiles.length > 0 ? `${uploadedFiles.length} tệp tin STL/Ảnh` : 'Dấu thạch cao vật lý'}</p>
                    <p><span className="text-slate-400">Ưu tiên:</span> Chế tác siêu tốc bàn giao đúng tiến độ</p>
                  </div>

                  <button 
                    onClick={closeSubmitModal}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* MODAL DIALOGUE: CỔNG QUẢN TRỊ VIÊN */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsAdminOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Container */}
          <div className="bg-slate-50 rounded-3xl shadow-2xl border border-slate-100 max-w-7xl w-full relative z-10 overflow-hidden animate-scale-up max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="bg-[#0b213b] text-white p-5 flex justify-between items-center border-b border-indigo-950 flex-shrink-0">
              <div>
                <span className="text-[10px] text-brand-gold font-bold uppercase tracking-widest font-mono">Bảng điều hành</span>
                <h3 className="font-display font-black text-sm sm:text-base text-white tracking-wide mt-1">LABO VSTAR ADMIN CONSOLE</h3>
              </div>
              <button 
                onClick={() => setIsAdminOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white flex items-center justify-center focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {isAdminLoggedIn ? (
                <AdminWarrantyManager onLogout={() => setIsAdminLoggedIn(false)} />
              ) : (
                <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
