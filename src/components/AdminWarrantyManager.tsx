import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Warranty } from '../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  LogOut, 
  RefreshCw, 
  X, 
  Check, 
  Shield, 
  Calendar, 
  Tag, 
  Hash, 
  Sparkles,
  BarChart3,
  Layers,
  Heart,
  Users,
  Building,
  FileSpreadsheet,
  AlertTriangle,
  Flame,
  Wrench,
  Download,
  Filter,
  CheckCircle,
  Clock,
  CheckCircle2,
  Cpu,
  BadgeAlert
} from 'lucide-react';

interface AdminWarrantyManagerProps {
  onLogout: () => void;
}

// Preset product names and their standard warranty durations (Years)
const PRODUCT_WARRANTY_DURATION: Record<string, number> = {
  "Răng sứ Zirconia Cercon HT Multi-layered Cao Cấp": 10,
  "Răng sứ cao cấp Lava Plus Thụy Sĩ": 15,
  "Phục hình Thẩm mỹ Implant Titan-Multi-Unit": 7,
  "Thiết kế CAD/CAM số hóa": 10,
  "Răng sứ Titan mỹ thuật Nhật Bản": 5,
  "Hàm giả tháo lắp Biosoft dẻo": 3
};

// Common dental shades for quick-selecting
const POPULAR_DENTAL_SHADES = [
  { code: 'A1', name: 'Tone sáng tự nhiên' },
  { code: 'A2', name: 'Tone tự nhiên ấm' },
  { code: 'A3', name: 'Tone tự nhiên đậm' },
  { code: 'B1', name: 'Tone trắng trong' },
  { code: 'OM1', name: 'Bleach trắng sứ siêu bóng' },
  { code: 'OM2', name: 'Bleach trắng sáng sang trọng' },
  { code: 'OM3', name: 'Bleach trắng nhẹ thanh lịch' }
];

// Helper functions to swap date formats between YYYY-MM-DD (inputs) and DD/MM/YYYY (view & DB)
const toInputDate = (displayStr: string): string => {
  if (!displayStr) return '';
  if (displayStr.includes('-')) return displayStr; // already YYYY-MM-DD
  const parts = displayStr.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return displayStr;
};

const toDisplayDate = (inputStr: string): string => {
  if (!inputStr) return '';
  if (inputStr.includes('/')) return inputStr; // already DD/MM/YYYY
  const parts = inputStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  }
  return inputStr;
};

export default function AdminWarrantyManager({ onLogout }: AdminWarrantyManagerProps) {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tất cả' | 'Còn bảo hành' | 'Hết bảo hành'>('Tất cả');
  const [productFilter, setProductFilter] = useState<string>('Tất cả');
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'warranties' | 'cadcam'>('dashboard');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    warrantyCode: '',
    birthYear: 1990,
    customerName: '',
    phone: '',
    product: 'Răng sứ Zirconia Cercon HT Multi-layered Cao Cấp',
    quantity: 1,
    shade: 'A1',
    installDate: '', // in component represented as YYYY-MM-DD for fluid UI selection
    warrantyEndDate: '', // in component represented as YYYY-MM-DD
    clinicName: '',
    note: '',
    status: 'Còn bảo hành' as 'Còn bảo hành' | 'Hết bảo hành'
  });

  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const path = 'warranties';

  // Fetch warranties
  useEffect(() => {
    async function fetchWarranties() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const q = query(collection(db, path), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const list: Warranty[] = [];
        querySnapshot.forEach((doc) => {
          list.push({
            id: doc.id,
            ...doc.data()
          } as Warranty);
        });
        setWarranties(list);
      } catch (error: any) {
        console.error('Fetch Warranties Error:', error);
        setErrorMsg('Không thể truy xuất dữ liệu từ Cloud Firestore. Vui lòng kiểm tra Security Rules (firestore.rules) hoặc tài khoản phân quyền.');
      } finally {
        setLoading(false);
      }
    }
    fetchWarranties();
  }, [refreshKey]);

  // Sync / Auto-calculate Warranty End Date when product or installDate changes
  useEffect(() => {
    if (formData.installDate) {
      const years = PRODUCT_WARRANTY_DURATION[formData.product] || 10;
      const date = new Date(formData.installDate);
      if (!isNaN(date.getTime())) {
        date.setFullYear(date.getFullYear() + years);
        const calculatedEnd = date.toISOString().split('T')[0];
        setFormData(prev => ({
          ...prev,
          warrantyEndDate: calculatedEnd
        }));
      }
    }
  }, [formData.product, formData.installDate]);

  // Handle Log out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  // Generate random dental warranty Code
  const handleGenerateCode = () => {
    const num = Math.floor(10000 + Math.random() * 90000); // 5 digit random
    setFormData(prev => ({
      ...prev,
      warrantyCode: `VSTAR${num}`
    }));
  };

  // Open form for Creating new electronics warranty
  const handleOpenCreateForm = () => {
    setEditingId(null);
    const today = new Date().toISOString().split('T')[0];
    
    setFormData({
      warrantyCode: '',
      birthYear: 1990,
      customerName: '',
      phone: '',
      product: 'Răng sứ Zirconia Cercon HT Multi-layered Cao Cấp',
      quantity: 1,
      shade: 'A1',
      installDate: today,
      warrantyEndDate: '', // will be auto-calculated inside useEffect
      clinicName: '',
      note: '',
      status: 'Còn bảo hành'
    });
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsFormOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'birthYear' || name === 'quantity' ? parseInt(value, 10) || 0 : value
    }));
  };

  // Pre-fill fields for editing
  const handleOpenEditForm = (item: Warranty) => {
    setEditingId(item.id || null);
    setFormData({
      warrantyCode: item.warrantyCode,
      birthYear: item.birthYear,
      customerName: item.customerName,
      phone: item.phone,
      product: item.product,
      quantity: item.quantity,
      shade: item.shade,
      installDate: toInputDate(item.installDate),
      warrantyEndDate: toInputDate(item.warrantyEndDate),
      clinicName: item.clinicName,
      note: item.note || '',
      status: item.status
    });
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsFormOpen(true);
  };

  // Save changes (Create OR Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.warrantyCode.trim() || !formData.customerName.trim() || !formData.phone.trim() || !formData.clinicName.trim()) {
      setErrorMsg('Vui lòng hoàn thành đầy các trường có dấu sao đỏ (*).');
      return;
    }

    setFormSubmitting(true);
    setErrorMsg(null);

    // Prepare payload by mapping input YYYY-MM-DD strings back to professional display formats (DD/MM/YYYY)
    const payload = {
      ...formData,
      warrantyCode: formData.warrantyCode.trim().toUpperCase(),
      customerName: formData.customerName.trim().toUpperCase(),
      phone: formData.phone.trim(),
      clinicName: formData.clinicName.trim(),
      shade: formData.shade.toUpperCase(),
      installDate: toDisplayDate(formData.installDate),
      warrantyEndDate: toDisplayDate(formData.warrantyEndDate),
      updatedAt: serverTimestamp()
    };

    try {
      if (editingId) {
        // Update document
        const docRef = doc(db, path, editingId);
        await updateDoc(docRef, payload);
        setSuccessMsg(`Cập nhật hồ sơ bảo hành "${payload.warrantyCode}" thành công!`);
      } else {
        // Create document
        const newPayload = {
          ...payload,
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, path), newPayload);
        setSuccessMsg(`Đã tạo mới thẻ bảo hành điện tử "${payload.warrantyCode}" cho bệnh nhân ${payload.customerName}!`);
      }
      setIsFormOpen(false);
      setRefreshKey(prev => prev + 1);

      // Auto clear success message after 4s
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (error: any) {
      console.error('Save Document Error:', error);
      try {
        handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, `${path}/${editingId || ''}`);
      } catch (nestedErr: any) {
        setErrorMsg(`Lỗi phân quyền Firebase. Hãy chắc chắn Firestore Rules cho phép thao tác: ${nestedErr.message}`);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete document
  const handleDeleteDocument = async () => {
    if (!deleteConfirmId) return;

    setDeleteLoading(true);
    setErrorMsg(null);
    try {
      const docRef = doc(db, path, deleteConfirmId);
      await deleteDoc(docRef);
      setDeleteConfirmId(null);
      setRefreshKey(prev => prev + 1);
      setSuccessMsg('Đã xóa vĩnh viễn thẻ bảo hành khỏi hệ thống.');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (error: any) {
      console.error('Delete Document Error:', error);
      try {
        handleFirestoreError(error, OperationType.DELETE, `${path}/${deleteConfirmId}`);
      } catch (nestedErr: any) {
        setErrorMsg(`Không thể xóa tài liệu. Kiểm tra quyền hạn Firestore: ${nestedErr.message}`);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Export warranties DB to JSON
  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(warranties, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `VSTAR_Warranties_Database_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  // Local filtered lists based on search, status, and product filters
  const filteredWarranties = warranties.filter(item => {
    const sLower = searchTerm.toLowerCase();
    const matchText = (
      (item.customerName || '').toLowerCase().includes(sLower) ||
      (item.warrantyCode || '').toLowerCase().includes(sLower) ||
      (item.clinicName || '').toLowerCase().includes(sLower) ||
      (item.phone || '').includes(sLower) ||
      (item.product || '').toLowerCase().includes(sLower)
    );

    const matchStatus = statusFilter === 'Tất cả' || item.status === statusFilter;
    const matchProduct = productFilter === 'Tất cả' || item.product === productFilter;

    return matchText && matchStatus && matchProduct;
  });

  // Calculate high-fidelity Dental ERP Statistics
  const totalWarranties = warranties.length;
  const activeWarrantiesCount = warranties.filter(w => w.status === 'Còn bảo hành').length;
  const expiredWarrantiesCount = warranties.filter(w => w.status === 'Hết bảo hành').length;
  
  // Summing up total tooth units made
  const totalRestorationUnits = warranties.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Finding unique affiliate clinics
  const uniqueClinicsCount = Array.from(new Set(warranties.map(w => w.clinicName).filter(Boolean))).length;

  // Calculating shade statistics
  const shadeDistribution: Record<string, number> = {};
  warranties.forEach(item => {
    const cleanShade = (item.shade || 'Chưa định').trim().toUpperCase();
    shadeDistribution[cleanShade] = (shadeDistribution[cleanShade] || 0) + (item.quantity || 1);
  });

  return (
    <div className="bg-[#f8fafc] rounded-2xl border border-slate-100 flex flex-col min-h-[70vh] text-slate-800 antialiased font-sans">
      
      {/* INTERNAL TOP PANEL: DENTAL LAB BRANDING */}
      <div className="bg-gradient-to-r from-[#07162c] via-[#0d274c] to-[#143666] text-white p-6 rounded-t-2xl shadow-md border-b-2 border-brand-gold/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-gold/20 to-white/10 text-brand-gold border border-brand-gold/30 flex items-center justify-center relative shadow-inner shrink-0">
            <Cpu className="w-6 h-6 text-brand-gold" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-brand-gold/20 text-brand-gold font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded border border-brand-gold/30">
                Lâm Sàng VStar ERP v2.4
              </span>
              <span className="text-[9px] bg-slate-500/30 text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-500/10 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> Live Synchronized
              </span>
            </div>
            <h2 className="font-display font-black text-lg sm:text-xl text-white mt-1.5 tracking-wide uppercase flex items-center gap-2">
              Bảng điều hành kỹ thuật sản xuất & bảo hành
            </h2>
          </div>
        </div>

        {/* QUICK ADMIN PANEL STATS HEADER */}
        <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            disabled={loading}
            className="p-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center"
            title="Tải lại từ Clould Firestore"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportJSON}
            disabled={loading || warranties.length === 0}
            className="p-2.5 bg-white/5 border border-white/10 text-brand-gold rounded-xl hover:text-white hover:bg-brand-gold hover:border-brand-gold/50 transition-all cursor-pointer flex items-center justify-center"
            title="Xuất dữ liệu dự phòng (JSON)"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenCreateForm}
            className="px-4 py-2.5 bg-brand-gold hover:bg-white hover:text-[#0b213b] text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all outline-none"
          >
            <Plus className="w-4 h-4 text-slate-950 font-black" />
            <span>Thêm đơn bảo hành</span>
          </button>

          <button
            onClick={handleSignOut}
            className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl hover:bg-rose-650 hover:text-white transition-all cursor-pointer flex items-center justify-center"
            title="Đăng xuất khỏi Cổng Quản Trị"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB NAVIGATION BAR */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'dashboard' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>TẤM TỔNG QUAN LABO (OVERVIEW)</span>
        </button>

        <button
          onClick={() => setActiveTab('warranties')}
          className={`px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'warranties' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>QUẢN LÝ DANH SÁCH BẢO HÀNH ({filteredWarranties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cadcam')}
          className={`px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'cadcam' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>GIÁM SÁT CAD/CAM MILLING</span>
        </button>
      </div>

      {/* TOAST SUCCESS / ERROR ALERTS */}
      {successMsg && (
        <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-800 font-bold animate-fade-in-up">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mx-6 mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-800 font-bold animate-fade-in-up">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div>
            <p>Đã xảy ra lỗi nghiêm trọng:</p>
            <p className="font-normal text-slate-600 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* RENDER ACTIVE TAB */}
      <div className="p-6 flex-1 flex flex-col">
        
        {/* ======================= TAB 1: OVERVIEW DASHBOARD ======================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in text-xs">
            
            {/* KPI ROW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tổng số ca bảo hành</p>
                  <p className="text-xl font-black text-[#0b213b] font-mono mt-0.5">{totalWarranties}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Thẻ đang hoạt động</p>
                  <p className="text-xl font-black text-emerald-700 font-mono mt-0.5">{activeWarrantiesCount}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Đơn vị răng (Units)</p>
                  <p className="text-xl font-black text-slate-900 font-mono mt-0.5">{totalRestorationUnits}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nha khoa liên kết</p>
                  <p className="text-xl font-black text-[#0b213b] font-mono mt-0.5">{uniqueClinicsCount}</p>
                </div>
              </div>
            </div>

            {/* CHARTS AND DATA GRAPHICS GROUP */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Product Share Analytics */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-brand-gold" />
                    Tỉ trọng sản lượng phôi sứ
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Phân bổ dữ liệu sản xuất thực tế trên tổng số đơn vị phục hình.</p>
                </div>

                <div className="my-6 space-y-3.5">
                  {Object.keys(PRODUCT_WARRANTY_DURATION).map((pName, index) => {
                    const count = warranties.filter(w => w.product === pName).reduce((sum, item) => sum + (item.quantity || 1), 0);
                    const percentage = totalRestorationUnits > 0 ? (count / totalRestorationUnits) * 100 : 0;
                    
                    const barColors = [
                      'bg-indigo-600',
                      'bg-brand-gold',
                      'bg-teal-600',
                      'bg-emerald-600',
                      'bg-amber-600',
                      'bg-rose-600'
                    ];

                    return (
                      <div key={pName} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-700 truncate max-w-[190px]" title={pName}>{pName}</span>
                          <span className="text-slate-900 font-mono">{count} Units ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`${barColors[index % barColors.length]} h-full rounded-full transition-all`} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-[10px] text-slate-500 font-semibold leading-relaxed">
                  💡 <strong>Kinh nghiệm sản xuất:</strong> Dòng răng <span className="text-indigo-600">Zirconia Cercon HT Cao cấp</span> và phôi <span className="text-amber-700">Lava Plus</span> chính hãng đang chiếm tỉ lệ tiêu thụ cao nhất tại các hệ thống phòng nha sài gòn.
                </div>
              </div>

              {/* Tooth shade preference list chart */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    Thống kê sắc độ răng (Dental Shade Index)
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Xu hướng lựa chọn bảng màu sứ lâm sàng từ các bác sĩ điều trị.</p>
                </div>

                <div className="my-5 grid grid-cols-2 gap-3">
                  {Object.keys(shadeDistribution).length === 0 ? (
                    <div className="col-span-2 py-10 text-center text-slate-400">
                      Chưa ghi nhận mã màu răng. Hãy thêm các hồ sơ bảo hành.
                    </div>
                  ) : (
                    Object.entries(shadeDistribution).map(([shadeCode, quantity]) => {
                      return (
                        <div key={shadeCode} className="bg-slate-50 border border-slate-150 rounded-xl p-2.5 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-full bg-yellow-50 border border-yellow-200 shadow-inner flex items-center justify-center font-bold font-mono text-[10px] text-slate-700">
                              🦷
                            </span>
                            <div>
                              <p className="font-mono font-bold text-slate-800 text-[11px]">{shadeCode}</p>
                              <p className="text-[8px] text-slate-400 uppercase font-semibold">Màu răng</p>
                            </div>
                          </div>
                          <span className="bg-slate-200/60 font-mono font-black text-[10px] text-slate-700 px-2 py-0.5 rounded">
                            {quantity} Răng
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="bg-[#fbbf24]/5 border border-[#fbbf24]/20 p-2.5 rounded-xl text-[10px] text-amber-900 font-semibold leading-relaxed">
                  🌟 Bảng màu thẩm mỹ cao <strong className="text-brand-blue uppercase">OM2</strong> và cực sáng <strong className="text-brand-blue uppercase">OM1</strong> đang là dòng sườn được các labo toàn sứ khuyên chọn để nâng tone thẩm mỹ tự nhiên.
                </div>
              </div>

              {/* Lab Operations Action Logger */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-brand-blue animate-pulse" />
                  Nhật ký kỹ thuật lâm sàng
                </h3>
                <p className="text-[10px] text-slate-405 mb-4">Các hoạt động đăng ký & xuất xưởng thẻ phục hình mới nhất.</p>

                <div className="space-y-3.5 flex-1 pr-1 overflow-y-auto max-h-[220px]">
                  {warranties.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 font-semibold">Chưa có nhật ký hoạt động nào được tạo lập.</div>
                  ) : (
                    warranties.slice(0, 5).map((item, idx) => {
                      return (
                        <div key={item.id || idx} className="flex gap-2.5 items-start">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 bg-brand-gold`} />
                          <div className="border-l border-slate-100 pl-2.5 space-y-0.5">
                            <p className="font-bold text-slate-800 text-[10.5px]">
                              Đăng ký thành công mã bảo hành <span className="font-mono text-brand-blue">{item.warrantyCode}</span>
                            </p>
                            <p className="text-[9px] text-slate-400 font-medium">Bệnh nhân: <span className="uppercase text-slate-600 font-bold">{item.customerName}</span> ({item.phone})</p>
                            <p className="text-[9px] text-slate-500 font-medium">Labo thực hiện: {item.clinicName} | Sản phẩm: {item.product}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* DENTAL LAB STANDARDS COMPLIANCE BANNER */}
            <div className="bg-[#0b213b] text-white p-4 rounded-xl border border-indigo-950 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-brand-gold shrink-0 animate-bounce-slow" />
                <div>
                  <h4 className="font-black text-xs text-white uppercase tracking-wider">Hệ thống tuân thủ tiêu chuẩn phôi sứ chính hãng</h4>
                  <p className="text-[10px] text-slate-350 font-medium mt-0.5">Mọi hồ sơ bảo hành kỹ thuật số được liên kết trực tiếp với nhà phân phối phôi thương hiệu quốc tế Lava, Cercon Multi, và Titan Japan.</p>
                </div>
              </div>
              <div className="flex gap-2 font-mono text-[9px] font-bold text-brand-gold shrink-0 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-indigo-950">
                <span>FDA APPROVED</span> • <span>CAD/CAM GUARANTEE</span>
              </div>
            </div>

          </div>
        )}

        {/* ======================= TAB 2: WARRANTIES MANAGER SHEET ======================= */}
        {activeTab === 'warranties' && (
          <div className="flex-1 flex flex-col space-y-4 animate-fade-in text-xs">
            
            {/* SERACH & FILTERS BAR */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3.5">
              <div className="flex flex-col md:flex-row gap-3">
                
                {/* Search Text */}
                <div className="relative flex-1">
                  <input 
                    type="text"
                    placeholder="Tìm theo Mã bảo hành, Tên bệnh nhân, Nha khoa thực hiện hoặc Số điện thoại..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold rounded-xl font-bold transition-all"
                  />
                  <div className="absolute left-3.5 top-3.5 text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="w-full md:w-48">
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-brand-gold transition-colors appearance-none"
                    >
                      <option value="Tất cả">Trạng thái: Tất cả</option>
                      <option value="Còn bảo hành">Còn bảo hành</option>
                      <option value="Hết bảo hành">Hết bảo hành</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                      <Filter className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Product Filter */}
                <div className="w-full md:w-64">
                  <div className="relative">
                    <select
                      value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-brand-gold transition-colors appearance-none"
                    >
                      <option value="Tất cả">Dòng răng sứ: Tất cả</option>
                      {Object.keys(PRODUCT_WARRANTY_DURATION).map(prd => (
                        <option key={prd} value={prd}>{prd}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                      <Filter className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* TABULAR LIST BODY */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col justify-between">
              
              {loading ? (
                <div className="py-24 text-center text-slate-400 flex-1 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-blue rounded-full animate-spin mb-4"></div>
                  <p className="font-bold text-slate-600">Đang đồng bộ hóa kho dữ liệu từ Cloud Firestore...</p>
                  <p className="text-[10px] text-slate-450 mt-1">Quá trình này diễn ra hoàn toàn bảo mật.</p>
                </div>
              ) : filteredWarranties.length === 0 ? (
                <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-xl m-6 border border-dashed border-slate-200 flex-1 flex flex-col items-center justify-center">
                  <BadgeAlert className="w-12 h-12 text-slate-350 mb-3" />
                  <p className="font-black text-slate-700 text-sm">Không tìm thấy mã số bảo hành nào khớp!</p>
                  <p className="text-[10px] text-slate-400 max-w-sm mt-1 mx-auto leading-relaxed">
                    Hãy bấm nút <strong className="text-brand-blue">"Thêm đơn bảo hành"</strong> ở góc trên bên phải để khởi tạo thẻ bảo hành điện tử chính hãng VSTAR cho phòng nha liên kết.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full border-collapse text-left text-[11px] whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase tracking-wider text-[10px]">
                        <th className="px-5 py-4">Mã số bảo hành</th>
                        <th className="px-5 py-4">Bệnh nhân / Khách hàng</th>
                        <th className="px-5 py-4">Loại hình sản phẩm</th>
                        <th className="px-5 py-4">Nha khoa thực hiện</th>
                        <th className="px-5 py-4">Sản xuất & Bàn giao</th>
                        <th className="px-5 py-4">Hạn bảo hành</th>
                        <th className="px-5 py-4 text-center">Trạng thái</th>
                        <th className="px-5 py-4 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 divide-y-slate-200/50">
                      {filteredWarranties.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          
                          {/* Code segment */}
                          <td className="px-5 py-4 font-mono font-bold text-slate-800 text-xs tracking-wider">
                            <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200 text-brand-blue uppercase">
                              {item.warrantyCode}
                            </span>
                          </td>

                          {/* Patient segment */}
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-black text-slate-900 uppercase text-xs tracking-wide">{item.customerName}</p>
                              <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">Sinh: <strong className="text-slate-600">{item.birthYear}</strong> | ĐT: <strong className="text-slate-600">{item.phone}</strong></p>
                            </div>
                          </td>

                          {/* Lab restoratins */}
                          <td className="px-5 py-4 max-w-[200px] truncate">
                            <div>
                              <p className="font-bold text-slate-750" title={item.product}>{item.product}</p>
                              <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-2">
                                <span className="bg-brand-gold/10 text-brand-gold font-bold px-1.5 py-0.5 rounded border border-brand-gold/20">
                                  {item.quantity} r (đơn vị)
                                </span>
                                {item.shade && (
                                  <span className="bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-100 uppercase">
                                    Shade: {item.shade}
                                  </span>
                                )}
                              </p>
                            </div>
                          </td>

                          {/* Affiliate dentist */}
                          <td className="px-5 py-4 max-w-[150px] truncate">
                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span title={item.clinicName}>{item.clinicName}</span>
                            </div>
                          </td>

                          {/* Built date */}
                          <td className="px-5 py-4 font-mono text-slate-500 font-semibold">{item.installDate}</td>

                          {/* Warranty Duration until */}
                          <td className="px-5 py-4 font-mono">
                            <div className="text-[#d97706] font-bold text-xs flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#d97706]" />
                              <span>{item.warrantyEndDate}</span>
                            </div>
                          </td>

                          {/* Badge Status */}
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider ${
                              item.status === 'Còn bảo hành' 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}>
                              {item.status}
                            </span>
                          </td>

                          {/* CRUD Buttons */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditForm(item)}
                                className="p-2 text-slate-500 hover:text-brand-blue hover:bg-slate-100 rounded-lg transition-all"
                                title="Chỉnh sửa hồ sơ"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(item.id || null)}
                                className="p-2 text-slate-500 hover:text-rose-650 hover:bg-rose-100 rounded-lg transition-all"
                                title="Xóa thẻ bảo hành"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table footer info counts */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 font-bold gap-2">
                <span>Hiển thị {filteredWarranties.length} / {totalWarranties} phiếu bảo hành thỏa mãn bộ lọc</span>
                <span className="text-slate-400 font-semibold">Chạm vào nút Chỉnh sửa / Xóa để thực thi sửa đổi trực tiếp trên Cloud</span>
              </div>

            </div>

          </div>
        )}

        {/* ======================= TAB 3: CAD/CAM REAL-TIME DENTAL MACHINERY ======================= */}
        {activeTab === 'cadcam' && (
          <div className="space-y-6 animate-fade-in text-xs flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4.5 h-4.5 text-brand-gold" />
                Hệ thống giám sát chế tác CNC Dental Milling (CAD/CAM Room)
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Camera điều độ phân xưởng mài phôi sườn trực tuyến, đồng bộ hóa mã Serial và chỉ định lâm sàng.
              </p>
            </div>

            {/* CNC Milling Monitor Card Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
              
              {/* CNC Machine 1 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] bg-indigo-50 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded border border-indigo-100">Milling Center #A1</span>
                    <h4 className="font-bold text-slate-900 mt-1.5 font-mono text-sm">CORITEC 350i PRO</h4>
                    <p className="text-[9px] text-slate-400">Hệ thống phay 5 trục ướt/khô đỉnh cao</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Mài phôi Zirconia
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 font-semibold text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vật liệu mài:</span>
                    <span className="text-slate-800 font-mono">Cercon HT Multi-layered</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mã ca mài:</span>
                    <span className="text-indigo-600 font-mono font-bold">VSTAR-CERCON-779</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nhiệt độ phôi sườn:</span>
                    <span className="text-slate-800 font-mono">31.4 °C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tốc độ trục phay:</span>
                    <span className="text-slate-800 font-mono">60,000 RPM</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold text-slate-500">
                    <span>Tiến trình hoàn thiện</span>
                    <span>84%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full animate-pulse" style={{ width: '84%' }}></div>
                  </div>
                </div>
              </div>

              {/* CNC Machine 2 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] bg-slate-105 text-amber-800 font-mono font-bold px-2 py-0.5 rounded border border-amber-100">Glass-Ceramic Milling #B2</span>
                    <h4 className="font-bold text-slate-900 mt-1.5 font-mono text-sm">AMANN GIRRBACH II</h4>
                    <p className="text-[9px] text-slate-400">Phay siêu tốc răng toàn sứ thuỷ tinh</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-amber-900 border border-yellow-200 rounded text-[9px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span> Mài ướt Emax
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 font-semibold text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vật liệu mài:</span>
                    <span className="text-slate-800 font-mono">Sứ thủy tinh lithium disilicate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mã ca mài:</span>
                    <span className="text-[#0b213b] font-mono font-bold">VSTAR-EMAX-202</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nhiệt độ phôi sườn:</span>
                    <span className="text-slate-800 font-mono">28.9 °C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tốc độ trục phay:</span>
                    <span className="text-slate-800 font-mono">45,000 RPM</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold text-slate-500">
                    <span>Tiến trình hoàn thiện</span>
                    <span>39%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '39%' }}></div>
                  </div>
                </div>
              </div>

              {/* CNC Machine 3 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] bg-slate-100 text-slate-600 font-mono font-bold px-2 py-0.5 rounded border border-slate-200">Sintering Furnace #S1</span>
                    <h4 className="font-bold text-slate-900 mt-1.5 font-mono text-sm">VITA ZYRLCOM S1</h4>
                    <p className="text-[9px] text-slate-400">Lò nung thiêu kết Zirconia cao tần</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[9px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-rose-550 rounded-full animate-pulse"></span> Nung kết sứ (1500°C)
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 font-semibold text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nhiệt độ nung hiện tại:</span>
                    <span className="text-rose-600 font-mono font-bold">1482 °C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mã mẻ nung:</span>
                    <span className="text-slate-800 font-mono">BATCH-ZIRC-091</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thời gian giữ nhiệt:</span>
                    <span className="text-slate-800 font-mono">2h 40m / 4h 00m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Trạng thái khí quyển:</span>
                    <span className="text-emerald-600 font-mono">Bão hoà khí oxy sạch</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold text-slate-500">
                    <span>Chu kỳ nung kết</span>
                    <span>68%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-rose-550 h-full rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Simulated Live CAD/CAM Telemetry Logs */}
            <div className="bg-slate-900 text-slate-300 font-mono text-[10px] p-4 rounded-xl border border-slate-800 space-y-1 leading-relaxed">
              <p className="text-emerald-400 font-bold">VSTAR-ERP-ENGINE: CONNECTED TO CAD/CAM MILLING CENTER VIA LAN IP [192.168.1.140]...</p>
              <p className="text-slate-500">[{new Date().toISOString()}] - [INFO] Initiating 3D STL file verification for milling run VSTAR-CERCON-779...</p>
              <p className="text-slate-500">[{new Date().toISOString()}] - [INFO] File verified. Symmetrical path calculations applied via HyperDent CAM software.</p>
              <p className="text-brand-gold">[{new Date().toISOString()}] - [WARNING] Diamond milling burr #2 has 89h of service remaining. Replacement suggested soon.</p>
              <p className="text-slate-500">[{new Date().toISOString()}] - [INFO] Sintering furnace VITA S1 has reached stable temperature curve (1482°C / Rate 10°C/min).</p>
            </div>
          </div>
        )}

      </div>

      {/* ======================= ADD / EDIT DETAILED SLIDE-OVER OR MODAL DRAWER ======================= */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
            
            {/* Form Header */}
            <div className="p-5 border-b border-slate-150 bg-slate-50 flex justify-between items-center">
              <div>
                <span className="text-[9px] bg-slate-950 text-[#fadb14] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                  {editingId ? 'ĐANG CẬP NHẬT' : 'KHỞI TẠO CA LÂM SÀNG'}
                </span>
                <h3 className="font-display font-black text-[#0b213b] text-base uppercase tracking-tight mt-2 flex items-center gap-1.5">
                  <Shield className="w-5 h-5 text-brand-gold" />
                  {editingId ? 'Sửa thông tin phiếu bảo hành' : 'Bổ sung thẻ bảo hành điện tử chính hãng'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-250 text-slate-400 hover:text-slate-700 flex items-center justify-center focus:outline-none transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body Inside */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs text-slate-700">
              
              {/* Form Warnings */}
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[10.5px] text-indigo-950 flex items-start gap-2.5 leading-relaxed font-semibold">
                <Check className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
                <p>Mã bảo hành điện tử VSTAR liên kết phục hình thẩm mỹ của phòng răng, là căn cứ số hóa duy nhất để kiểm tra chất lượng phôi và hạn bảo hành.</p>
              </div>

              {/* Grid 1: Name and BirthYear */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="formCustomerName" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Tên bệnh nhân (*):
                  </label>
                  <input 
                    id="formCustomerName"
                    type="text"
                    name="customerName"
                    required
                    placeholder="VÍ DỤ: NGUYỄN VĂN AN"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold focus:outline-none rounded-xl font-bold uppercase tracking-wide text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="formBirthYear" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Năm sinh bệnh nhân (*):
                  </label>
                  <input 
                    id="formBirthYear"
                    type="number"
                    name="birthYear"
                    required
                    min={1920}
                    max={new Date().getFullYear()}
                    value={formData.birthYear}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold focus:outline-none rounded-xl font-mono font-bold text-xs"
                  />
                </div>
              </div>

              {/* Grid 2: Phone and Clinic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="formPhone" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Số điện thoại liên hệ (*):
                  </label>
                  <input 
                    id="formPhone"
                    type="text"
                    name="phone"
                    required
                    placeholder="Ví dụ: 0914282777"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold focus:outline-none rounded-xl font-bold tracking-wide text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="formClinicName" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Nha khoa thực hiện (*):
                  </label>
                  <input 
                    id="formClinicName"
                    type="text"
                    name="clinicName"
                    required
                    placeholder="Ví dụ: Nha Khoa Smile Linh Đông"
                    value={formData.clinicName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold focus:outline-none rounded-xl font-bold text-xs"
                  />
                </div>
              </div>

              {/* Row 3: Product Select */}
              <div>
                <label htmlFor="formProduct" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Dòng sườn sứ / Phục hình (*):
                </label>
                <select 
                  id="formProduct"
                  name="product"
                  value={formData.product}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold focus:outline-none rounded-xl font-black text-xs text-slate-800"
                >
                  {Object.keys(PRODUCT_WARRANTY_DURATION).map(optName => (
                    <option key={optName}>{optName}</option>
                  ))}
                </select>
                <p className="text-[9px] text-slate-400 font-bold mt-1.5">
                  ℹ️ Sản phẩm này đi kèm chế độ bảo hành hãng: <span className="text-[#b45309] font-black">{PRODUCT_WARRANTY_DURATION[formData.product]} năm</span>. Hạn bảo hành sẽ tự động cộng dồn từ ngày lắp phục hình.
                </p>
              </div>

              {/* Grid 4: Quantity and Custom Color Shade Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="formQuantity" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Số lượng phục hình (Đơn vị răng):
                  </label>
                  <input 
                    id="formQuantity"
                    type="number"
                    name="quantity"
                    required
                    min={1}
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold focus:outline-none rounded-xl font-bold text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="formShade" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Mã màu răng (Shade):
                  </label>
                  <input 
                    id="formShade"
                    type="text"
                    name="shade"
                    placeholder="Ví dụ: A1, OM2"
                    value={formData.shade}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold focus:outline-none rounded-xl font-bold text-xs uppercase"
                  />
                </div>
              </div>

              {/* PREMIUM DESIGN ITEM: SHADE SUGGESTIONS BUTTON CLOUD */}
              <div>
                <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase mb-1.5">Chọn nhanh mã màu chuẩn:</p>
                <div className="flex flex-wrap gap-1">
                  {POPULAR_DENTAL_SHADES.map(ps => (
                    <button
                      key={ps.code}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, shade: ps.code }))}
                      className={`px-2 py-1 rounded text-[10.5px] font-bold border transition-all cursor-pointer ${
                        formData.shade.toUpperCase() === ps.code 
                          ? 'bg-indigo-650 text-white border-indigo-650 shadow-sm' 
                          : 'bg-slate-50 text-slate-750 border-slate-200 hover:bg-slate-100'
                      }`}
                      title={ps.name}
                    >
                      <span>{ps.code}</span>
                      <span className="text-[8px] font-normal text-slate-400 ml-1">
                        {formData.shade.toUpperCase() === ps.code ? '✓' : ''}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid 5: Install Date & End Date Datepicker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="formInstallDate" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Ngày lắp sườn sứ (*):
                  </label>
                  <input 
                    id="formInstallDate"
                    type="date"
                    name="installDate"
                    required
                    value={formData.installDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold focus:outline-none rounded-xl font-bold text-xs font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="formWarrantyEndDate" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Hạn bảo hành tự động (*):
                  </label>
                  <input 
                    id="formWarrantyEndDate"
                    type="date"
                    name="warrantyEndDate"
                    required
                    value={formData.warrantyEndDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold focus:outline-none rounded-xl font-bold text-xs font-mono bg-yellow-50/20 text-[#b45309]"
                  />
                </div>
              </div>

              {/* Grid 6: Status & Code generator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="formWarrantyCode" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Mã bảo hành điện tử (*):
                  </label>
                  <div className="flex gap-1.5">
                    <input 
                      id="formWarrantyCode"
                      type="text"
                      name="warrantyCode"
                      required
                      placeholder="Mã số bảo hành (Serial)"
                      value={formData.warrantyCode}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold focus:outline-none rounded-xl font-mono font-black text-brand-blue tracking-wider text-xs uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="px-3 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-800 rounded-xl transition-all font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
                      <span>Tạo mã</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="formStatus" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Trạng thái kích hoạt:
                  </label>
                  <select 
                    id="formStatus"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold focus:outline-none rounded-xl font-bold text-xs text-slate-800"
                  >
                    <option value="Còn bảo hành">Còn bảo hành</option>
                    <option value="Hết bảo hành">Hết bảo hành</option>
                  </select>
                </div>
              </div>

              {/* Note input */}
              <div>
                <label htmlFor="formNote" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Ghi chú lâm sàng (Vật liệu, chỉ định, khớp cắn):
                </label>
                <textarea 
                  id="formNote"
                  name="note"
                  rows={2}
                  placeholder="Ví dụ: Răng hàm trong, mão răng sứ thẩm mỹ đắp lớp dày chuẩn phôi Ceramill..."
                  value={formData.note}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-gold focus:outline-none rounded-xl font-semibold text-xs resize-none"
                />
              </div>

              {/* Error box inside */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-[10.5px] text-rose-800 font-bold rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-150 flex items-center justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#0d274c] to-[#07162c] text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 min-w-[110px]"
                >
                  {formSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-brand-gold font-bold" />
                      <span>{editingId ? 'Cập nhật' : 'Đóng hồ sơ'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================= DELETE CONFIRMATION MINI OVERLAY ======================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-sm w-full text-center animate-scale-up text-xs">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-inner">
              <AlertTriangle className="w-6 h-6 text-rose-600 animate-pulse" />
            </div>
            
            <h4 className="font-display font-black text-slate-900 tracking-tight text-sm sm:text-base uppercase">Xác nhận xóa hồ sơ?</h4>
            <p className="text-slate-500 mt-2 font-medium leading-relaxed max-w-xs mx-auto">
              Thao tác này sẽ gỡ bỏ thẻ bảo hành điện tử chính hãng này vĩnh viễn khỏi Cloud Firestore. Bạn chắc chắn muốn tiếp tục chứ?
            </p>

            <div className="mt-6 flex justify-center gap-2.5 font-bold w-full">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleteLoading}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteDocument}
                disabled={deleteLoading}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Xoá vĩnh viễn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
