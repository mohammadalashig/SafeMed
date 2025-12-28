// Internationalization (i18n) translations

export type Language = 'en' | 'tr' | 'ar'

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.history': 'History',
    'nav.schedule': 'Schedule',
    'nav.settings': 'Settings',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.scanBarcode': 'Scan Barcode',
    'dashboard.manualEntry': 'Manual Entry',
    'dashboard.yourMedications': 'Your Medications',
    'dashboard.noMedications': 'No medications added yet. Scan a barcode to get started!',
    
    // Settings
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance',
    'settings.theme': 'Theme',
    'settings.fontSize': 'Font Size',
    'settings.highContrast': 'High Contrast',
    'settings.reduceMotion': 'Reduce Motion',
    'settings.language': 'Language',
    'settings.timezone': 'Timezone',
    'settings.notifications': 'Notifications',
    'settings.scanner': 'Scanner',
    'settings.privacy': 'Privacy',
    'settings.accountSecurity': 'Account Security',
    'settings.changePassword': 'Change Password',
    'settings.currentPassword': 'Current Password',
    'settings.newPassword': 'New Password',
    'settings.confirmPassword': 'Confirm New Password',
    'settings.forgotPassword': 'Forgot your password? Reset it here',
    
    // Medication
    'medication.scanSuccess': 'Barcode scanned successfully!',
    'medication.found': 'Medication found!',
    'medication.notFound': 'Medication not found',
    'medication.addToHistory': 'Add to History',
    'medication.dosage': 'Dosage',
    'medication.frequency': 'Frequency',
    'medication.started': 'Started',
    'medication.activeIngredients': 'Active Ingredients',
    
    // Days of week
    'day.sun': 'Sun',
    'day.mon': 'Mon',
    'day.tue': 'Tue',
    'day.wed': 'Wed',
    'day.thu': 'Thu',
    'day.fri': 'Fri',
    'day.sat': 'Sat',
    
    // Months
    'month.jan': 'January',
    'month.feb': 'February',
    'month.mar': 'March',
    'month.apr': 'April',
    'month.may': 'May',
    'month.jun': 'June',
    'month.jul': 'July',
    'month.aug': 'August',
    'month.sep': 'September',
    'month.oct': 'October',
    'month.nov': 'November',
    'month.dec': 'December',
  },
  tr: {
    // Common
    'common.save': 'Kaydet',
    'common.cancel': 'İptal',
    'common.delete': 'Sil',
    'common.edit': 'Düzenle',
    'common.close': 'Kapat',
    'common.loading': 'Yükleniyor...',
    'common.error': 'Hata',
    'common.success': 'Başarılı',
    
    // Navigation
    'nav.dashboard': 'Kontrol Paneli',
    'nav.history': 'Geçmiş',
    'nav.schedule': 'Program',
    'nav.settings': 'Ayarlar',
    
    // Dashboard
    'dashboard.welcome': 'Tekrar hoş geldiniz',
    'dashboard.scanBarcode': 'Barkod Tara',
    'dashboard.manualEntry': 'Manuel Giriş',
    'dashboard.yourMedications': 'İlaçlarınız',
    'dashboard.noMedications': 'Henüz ilaç eklenmedi. Başlamak için bir barkod tarayın!',
    
    // Settings
    'settings.title': 'Ayarlar',
    'settings.appearance': 'Görünüm',
    'settings.theme': 'Tema',
    'settings.fontSize': 'Yazı Boyutu',
    'settings.highContrast': 'Yüksek Kontrast',
    'settings.reduceMotion': 'Hareketi Azalt',
    'settings.language': 'Dil',
    'settings.timezone': 'Saat Dilimi',
    'settings.notifications': 'Bildirimler',
    'settings.scanner': 'Tarayıcı',
    'settings.privacy': 'Gizlilik',
    'settings.accountSecurity': 'Hesap Güvenliği',
    'settings.changePassword': 'Şifre Değiştir',
    'settings.currentPassword': 'Mevcut Şifre',
    'settings.newPassword': 'Yeni Şifre',
    'settings.confirmPassword': 'Yeni Şifreyi Onayla',
    'settings.forgotPassword': 'Şifrenizi mi unuttunuz? Buradan sıfırlayın',
    
    // Medication
    'medication.scanSuccess': 'Barkod başarıyla tarandı!',
    'medication.found': 'İlaç bulundu!',
    'medication.notFound': 'İlaç bulunamadı',
    'medication.addToHistory': 'Geçmişe Ekle',
    'medication.dosage': 'Dozaj',
    'medication.frequency': 'Sıklık',
    'medication.started': 'Başlangıç',
    'medication.activeIngredients': 'Etken Maddeler',
    
    // Days of week
    'day.sun': 'Paz',
    'day.mon': 'Pzt',
    'day.tue': 'Sal',
    'day.wed': 'Çar',
    'day.thu': 'Per',
    'day.fri': 'Cum',
    'day.sat': 'Cmt',
    
    // Months
    'month.jan': 'Ocak',
    'month.feb': 'Şubat',
    'month.mar': 'Mart',
    'month.apr': 'Nisan',
    'month.may': 'Mayıs',
    'month.jun': 'Haziran',
    'month.jul': 'Temmuz',
    'month.aug': 'Ağustos',
    'month.sep': 'Eylül',
    'month.oct': 'Ekim',
    'month.nov': 'Kasım',
    'month.dec': 'Aralık',
  },
  ar: {
    // Common
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.close': 'إغلاق',
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.history': 'السجل',
    'nav.schedule': 'الجدول',
    'nav.settings': 'الإعدادات',
    
    // Dashboard
    'dashboard.welcome': 'مرحباً بعودتك',
    'dashboard.scanBarcode': 'مسح الباركود',
    'dashboard.manualEntry': 'إدخال يدوي',
    'dashboard.yourMedications': 'أدويتك',
    'dashboard.noMedications': 'لم تتم إضافة أي أدوية بعد. امسح باركود للبدء!',
    
    // Settings
    'settings.title': 'الإعدادات',
    'settings.appearance': 'المظهر',
    'settings.theme': 'المظهر',
    'settings.fontSize': 'حجم الخط',
    'settings.highContrast': 'تباين عالي',
    'settings.reduceMotion': 'تقليل الحركة',
    'settings.language': 'اللغة',
    'settings.timezone': 'المنطقة الزمنية',
    'settings.notifications': 'الإشعارات',
    'settings.scanner': 'الماسح',
    'settings.privacy': 'الخصوصية',
    'settings.accountSecurity': 'أمان الحساب',
    'settings.changePassword': 'تغيير كلمة المرور',
    'settings.currentPassword': 'كلمة المرور الحالية',
    'settings.newPassword': 'كلمة المرور الجديدة',
    'settings.confirmPassword': 'تأكيد كلمة المرور الجديدة',
    'settings.forgotPassword': 'نسيت كلمة المرور؟ أعد تعيينها هنا',
    
    // Medication
    'medication.scanSuccess': 'تم مسح الباركود بنجاح!',
    'medication.found': 'تم العثور على الدواء!',
    'medication.notFound': 'لم يتم العثور على الدواء',
    'medication.addToHistory': 'إضافة إلى السجل',
    'medication.dosage': 'الجرعة',
    'medication.frequency': 'التكرار',
    'medication.started': 'بدأ',
    'medication.activeIngredients': 'المكونات النشطة',
    
    // Days of week
    'day.sun': 'أحد',
    'day.mon': 'اثنين',
    'day.tue': 'ثلاثاء',
    'day.wed': 'أربعاء',
    'day.thu': 'خميس',
    'day.fri': 'جمعة',
    'day.sat': 'سبت',
    
    // Months
    'month.jan': 'يناير',
    'month.feb': 'فبراير',
    'month.mar': 'مارس',
    'month.apr': 'أبريل',
    'month.may': 'مايو',
    'month.jun': 'يونيو',
    'month.jul': 'يوليو',
    'month.aug': 'أغسطس',
    'month.sep': 'سبتمبر',
    'month.oct': 'أكتوبر',
    'month.nov': 'نوفمبر',
    'month.dec': 'ديسمبر',
  },
}

export function t(key: string, language: Language = 'en'): string {
  return translations[language]?.[key] || translations.en[key] || key
}

