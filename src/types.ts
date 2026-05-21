export interface Warranty {
  id?: string;
  warrantyCode: string;
  birthYear: number;
  customerName: string;
  phone: string;
  product: string;
  quantity: number;
  shade: string;
  installDate: string;
  warrantyEndDate: string;
  clinicName: string;
  note: string;
  status: 'Còn bảo hành' | 'Hết bảo hành';
  createdAt?: any;
  updatedAt?: any;
}

export interface WarrantyRecord {
  id: string;
  warrantyCode: string;
  birthYear: number;
  customerName: string;
  productName: string;
  quantity: number;
  colorCode: string;
  installDate: string;
  duration: string;
  isActive: boolean;
  clinicName: string;
  notes?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  imageSrc: string;
  features: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FeedbackForm {
  doctorName: string;
  clinicName: string;
  phoneNumber: string;
  serviceType: string;
  notes: string;
}
