const QuranConfig = {
  version: "3.1.0",
  siteName: "قرآن كريم",
  siteDescription: "تلاوات قرآنية متنوعة مع التفسير والترجمة",
  totalAyahs: 6236,
  surahsSource: "https://api.alquran.cloud/v1/surah",
  reciters: {
    minshawi: {
      id: "minshawi", name: "محمد صديق المنشاوي", style: "مرتل",
      sources: [
        (s,a) => `https://everyayah.com/data/Minshawy_Murattal_128kbps/${String(s).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`,
        (s,a) => `https://everyayah.com/data/Minshawy_Murattal_64kbps/${String(s).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`,
        (s,a) => `https://everyayah.com/data/Minshawy_Murattal_32kbps/${String(s).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`,
      ],
    },
    abdul_basit: {
      id: "abdul_basit", name: "عبد الباسط عبد الصمد", style: "مرتل",
      sources: [
        (s,a) => `https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/${String(s).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`,
        (s,a) => `https://everyayah.com/data/Abdul_Basit_Murattal_64kbps/${String(s).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`,
      ],
    },
    muaiqly: {
      id: "muaiqly", name: "ماهر المعيقلي", style: "مرتل",
      sources: [
        (s,a) => `https://everyayah.com/data/MaherAlMuaiqly128kbps/${String(s).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`,
      ],
    },
    dossari: {
      id: "dossari", name: "ياسر الدوسري", style: "مرتل",
      sources: [
        (s,a) => `https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/${String(s).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`,
      ],
    },
    alafasy: {
      id: "alafasy", name: "مشاري العفاسي", style: "مرتل",
      sources: [
        (s,a) => `https://everyayah.com/data/Alafasy_128kbps/${String(s).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`,
        (s,a) => `https://everyayah.com/data/Alafasy_64kbps/${String(s).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`,
      ],
    },
    albanna: {
      id: "albanna", name: "محمود علي البنا", style: "مرتل",
      sources: [
        (s,a) => `https://everyayah.com/data/mahmoud_ali_al_banna_128kbps/${String(s).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`,
      ],
    },
    husary: {
      id: "husary", name: "محمود خليل الحصري", style: "مرتل",
      sources: [
        (s,a) => `https://everyayah.com/data/Husary_128kbps_Mujawwad/${String(s).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`,
        (s,a) => `https://everyayah.com/data/Husary_64kbps_Mujawwad/${String(s).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`,
      ],
    },
    sudais: {
      id: "sudais", name: "عبدالرحمن السديس", style: "مرتل",
      sources: [
        (s,a) => `https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/${String(s).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`,
      ],
    },
  },
  apis: {
    ayah: (n) => `https://api.alquran.cloud/v1/ayah/${n}`,
    ayahBySurah: (s,a) => `https://api.alquran.cloud/v1/ayah/${s}:${a}`,
    surahs: () => `https://api.alquran.cloud/v1/surah`,
    surah: (n) => `https://api.alquran.cloud/v1/surah/${n}`,
    translation: (a,t='en.asad') => `https://api.alquran.cloud/v1/ayah/${a}/${t}`,
    tafseer: (a,t='ar.muyassar') => `https://api.alquran.cloud/v1/ayah/${a}/${t}`,
    tajweed: (a) => `https://api.alquran.cloud/v1/ayah/${a}/quran-tajweed`,
  },
  messages: {
    loading:"جاري تحميل الآية...", error:"حدث خطأ في تحميل البيانات",
    selectSurah:"يرجى اختيار سورة أولاً", ayahOutOfRange:"رقم الآية خارج نطاق السورة",
    invalidAyah:"رقم الآية غير صحيح",
  },

  // ─── أحكام التجويد وألوانها ─────────────────────────────────────────────
  tajweedRules: [
    { id: 'ghunnah',    name: 'الغنة',          color: '#FF7E1E', desc: 'صوت أنفي يخرج من الخيشوم' },
    { id: 'idghaam',    name: 'إدغام',           color: '#169200', desc: 'إدخال حرف في حرف مع الغنة' },
    { id: 'idghaam_no_ghunnah', name: 'إدغام بدون غنة', color: '#026112', desc: 'إدخال حرف في حرف بدون غنة' },
    { id: 'iqlab',      name: 'إقلاب',           color: '#26BFFD', desc: 'قلب النون الساكنة ميماً' },
    { id: 'ikhfa',      name: 'إخفاء',           color: '#81B622', desc: 'إخفاء النون الساكنة أو التنوين' },
    { id: 'ikhfa_shafawi', name: 'إخفاء شفوي',  color: '#D2691E', desc: 'إخفاء الميم الساكنة' },
    { id: 'idghaam_shafawi', name: 'إدغام شفوي', color: '#A0522D', desc: 'إدغام الميم الساكنة' },
    { id: 'qalqalah',   name: 'قلقلة',           color: '#DD0008', desc: 'اضطراب عند النطق بالحرف ساكناً' },
    { id: 'madd_normal','name': 'مد طبيعي',      color: '#337FFF', desc: 'مد بمقدار حركتين' },
    { id: 'madd_munfasil','name': 'مد منفصل',    color: '#4B0082', desc: 'مد بمقدار 4 أو 5 حركات' },
    { id: 'madd_muttasil','name': 'مد متصل',     color: '#990099', desc: 'مد بمقدار 4 أو 5 حركات' },
    { id: 'madd_lazim', name: 'مد لازم',         color: '#8B0000', desc: 'مد بمقدار 6 حركات' },
    { id: 'madd_lin',   name: 'مد لين',          color: '#006400', desc: 'مد حرفَي اللين' },
    { id: 'hamzat_wasl',name: 'همزة وصل',        color: '#AAAAAA', desc: 'همزة تُنطق وصلاً وتسقط' },
    { id: 'lam_shamsiyya', name: 'لام شمسية',    color: '#AAAAAA', desc: 'اللام المدغمة في الحرف التالي' },
    { id: 'silent',     name: 'حرف صامت',        color: '#AAAAAA', desc: 'حرف لا يُنطق' },
    { id: 'tafkheem',   name: 'تفخيم',           color: '#FF4500', desc: 'تغليظ الحرف' },
    { id: 'idhar',      name: 'إظهار',           color: '#00CED1', desc: 'إظهار النون الساكنة' },
    { id: 'idhar_shafawi', name: 'إظهار شفوي',   color: '#20B2AA', desc: 'إظهار الميم الساكنة' },
  ],
};
window.QuranConfig = QuranConfig;
