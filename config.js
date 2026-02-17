const QuranConfig = {
  version: "3.0.0",
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
  },
  messages: {
    loading:"جاري تحميل الآية...", error:"حدث خطأ في تحميل البيانات",
    selectSurah:"يرجى اختيار سورة أولاً", ayahOutOfRange:"رقم الآية خارج نطاق السورة",
    invalidAyah:"رقم الآية غير صحيح",
  },
};
window.QuranConfig = QuranConfig;
