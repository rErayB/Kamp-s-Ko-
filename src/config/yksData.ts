import { FieldType, ExamType, LanguageChoice } from '../types';

export interface SubjectConfig {
  key: string;
  name: string;
  maxQuestions: number;
  category: 'TYT' | 'AYT' | 'YDT';
  topics: string[];
}

export const TYT_SUBJECTS: SubjectConfig[] = [
  {
    key: 'tyt_turkce',
    name: 'Türkçe',
    maxQuestions: 40,
    category: 'TYT',
    topics: ['Sözcükte Anlam', 'Cümlede Anlam', 'Paragrafta Anlam', 'Ses Bilgisi', 'Yazım Kuralları', 'Noktalama İşaretleri', 'Sözcük Türleri', 'Cümlenin Ögeleri', 'Anlatım Bozuklukları']
  },
  {
    key: 'tyt_matematik',
    name: 'Temel Matematik',
    maxQuestions: 40,
    category: 'TYT',
    topics: ['Temel Kavramlar', 'Sayı Basamakları', 'Bölme-Bölünebilme', 'EBOB-EKOK', 'Rasyonel Sayılar', 'Basit Eşitsizlikler', 'Mutlak Değer', 'Üslü Sayılar', 'Köklü Sayılar', 'Çarpanlara Ayırma', 'Oran-Orantı', 'Problemler', 'Kümeler', 'Mantık', 'Fonksiyonlar', 'Permütasyon-Kombinasyon', 'Olasılık', 'Geometri (Doğruda ve Üçgende Açılar, Çokgenler, Çember, Katı Cisimler)']
  },
  {
    key: 'tyt_fizik',
    name: 'Fizik (Fen)',
    maxQuestions: 7,
    category: 'TYT',
    topics: ['Fizik Bilimine Giriş', 'Madde ve Özellikleri', 'Kuvvet ve Hareket', 'İş, Güç ve Enerji', 'Isı ve Sıcaklık', 'Elektrostatik', 'Elektrik ve Manyetizma', 'Basınç ve Kaldırma Kuvveti', 'Dalgalar', 'Optik']
  },
  {
    key: 'tyt_kimya',
    name: 'Kimya (Fen)',
    maxQuestions: 7,
    category: 'TYT',
    topics: ['Kimya Bilimi', 'Atom ve Periyodik Sistem', 'Kimyasal Türler Arası Etkileşimler', 'Maddenin Halleri', 'Doğa ve Kimya', 'Kimyanın Temel Kanunları', 'Mol Kavramı', 'Karışımlar', 'Asitler, Bazlar ve Tuzlar', 'Kimya Her Yerde']
  },
  {
    key: 'tyt_biyoloji',
    name: 'Biyoloji (Fen)',
    maxQuestions: 6,
    category: 'TYT',
    topics: ['Yaşam Bilimi Biyoloji', 'Hücre ve Organelleri', 'Canlılar Dünyası (Sınıflandırma)', 'Hücre Bölünmeleri (Mitoz & Mayoz)', 'Kalıtım', 'Ekosistem Ekolojisi ve Güncel Çevre Sorunları']
  },
  {
    key: 'tyt_tarih',
    name: 'Tarih (Sosyal)',
    maxQuestions: 5,
    category: 'TYT',
    topics: ['Tarih ve Zaman', 'İlk ve Orta Çağlarda Türk Dünyası', 'İslam Medeniyetinin Doğuşu', 'Türklerin İslamiyeti Kabulü', 'Beylikten Devlete Osmanlı', 'Dünya Gücü Osmanlı', 'Milli Mücadele', 'Atatürkçülük ve Türk İnkılabı']
  },
  {
    key: 'tyt_cografya',
    name: 'Coğrafya (Sosyal)',
    maxQuestions: 5,
    category: 'TYT',
    topics: ['Doğa ve İnsan', 'Dünya’nın Şekli ve Hareketleri', 'Coğrafi Konum', 'Harita Bilgisi', 'Atmosfer ve İklim', 'İç ve Dış Kuvvetler', 'Nüfus ve Yerleşme', 'Bölgeler', 'Doğal Afetler']
  },
  {
    key: 'tyt_felsefe',
    name: 'Felsefe (Sosyal)',
    maxQuestions: 5,
    category: 'TYT',
    topics: ['Felsefeyi Tanıma', 'Bilgi Felsefesi (Epistemoloji)', 'Varlık Felsefesi (Ontoloji)', 'Ahlak Felsefesi (Etik)', 'Sanat Felsefesi (Estetik)', 'Din Felsefesi', 'Siyaset Felsefesi', 'Bilim Felsefesi']
  },
  {
    key: 'tyt_din',
    name: 'Din Kültürü (Sosyal)',
    maxQuestions: 5,
    category: 'TYT',
    topics: ['İnanç', 'İbadet', 'Ahlak ve Değerler', 'Din, Kültür ve Medeniyet', 'Hz. Muhammed’in Hayatı', 'Vahiy ve Akıl']
  }
];

export const AYT_SAYISAL_SUBJECTS: SubjectConfig[] = [
  {
    key: 'ayt_matematik',
    name: 'AYT Matematik',
    maxQuestions: 40,
    category: 'AYT',
    topics: ['Fonksiyonlar', 'Polinomlar', 'İkinci Dereceden Denklemler & Eşitsizlikler', 'Parabol', 'Trigonometri', 'Logaritma', 'Diziler', 'Limit ve Süreklilik', 'Türev ve Uygulamaları', 'İntegral ve Uygulamaları', 'Analitik Geometri', 'Çemberin Analitiği', 'Dönüşümlerle Geometri']
  },
  {
    key: 'ayt_fizik',
    name: 'AYT Fizik',
    maxQuestions: 14,
    category: 'AYT',
    topics: ['Vektörler ve Bağıl Hareket', 'Newton’ın Hareket Yasaları', 'Bir ve İki Boyutta Sabit İvmeli Hareket', 'İş, Güç, Enerji', 'İtme ve Çizgisel Momentum', 'Tork ve Denge', 'Basit Makineler', 'Elektriksel Kuvvet, Alan ve Potansiyel', 'Manyetizma ve Elektromanyetik İndüksiyon', 'Alternatif Akım ve Transformatörler', 'Çembersel Hareket ve Dönme Kinetik Enerjisi', 'Basit Harmonik Hareket', 'Dalga Mekaniği', 'Atom Fiziğine Giriş ve Radyoaktivite', 'Modern Fizik ve Teknolojideki Uygulamaları']
  },
  {
    key: 'ayt_kimya',
    name: 'AYT Kimya',
    maxQuestions: 13,
    category: 'AYT',
    topics: ['Modern Atom Teorisi', 'Gazlar', 'Sıvı Çözeltiler ve Çözünürlük', 'Kimyasal Tepkimelerde Enerji', 'Kimyasal Tepkimelerde Hız', 'Kimyasal Denge', 'Asit-Baz Dengesi', 'Çözünürlük Dengesi (KÇÇ)', 'Kimya ve Elektrik (Elektrokimya)', 'Karbon Kimyasına Giriş', 'Organik Bileşikler (Hidrokarbonlar, Fonksiyonel Gruplar)']
  },
  {
    key: 'ayt_biyoloji',
    name: 'AYT Biyoloji',
    maxQuestions: 13,
    category: 'AYT',
    topics: ['Sinir Sistemi ve Duyu Organları', 'Endokrin Sistem', 'Destek ve Hareket Sistemi', 'Sindirim Sistemi', 'Dolaşım ve Bağışıklık Sistemi', 'Solunum Sistemi', 'Boşaltım Sistemi', 'Üreme Sistemi ve Embriyonik Gelişim', 'Komünite ve Popülasyon Ekolojisi', 'Nükleik Asitler (DNA, RNA, Protein Sentezi)', 'Hücresel Solunum ve Fotosentez-Kemosentez', 'Bitki Biyolojisi', 'Canlılar ve Çevre']
  }
];

export const AYT_ESIT_AGIRLIK_SUBJECTS: SubjectConfig[] = [
  {
    key: 'ayt_matematik',
    name: 'AYT Matematik',
    maxQuestions: 40,
    category: 'AYT',
    topics: ['Fonksiyonlar', 'Polinomlar', 'İkinci Dereceden Denklemler & Eşitsizlikler', 'Parabol', 'Trigonometri', 'Logaritma', 'Diziler', 'Limit ve Süreklilik', 'Türev ve Uygulamaları', 'İntegral ve Uygulamaları', 'Analitik Geometri']
  },
  {
    key: 'ayt_edebiyat',
    name: 'Türk Dili ve Edebiyatı',
    maxQuestions: 24,
    category: 'AYT',
    topics: ['Şiir Bilgisi (Nazım Birimi, Ölçü, Uyak)', 'Edebi Sanatlar', 'İslamiyet Öncesi ve Geçiş Dönemi Türk Edebiyatı', 'Halk Edebiyatı', 'Divan Edebiyatı', 'Tanzimat Edebiyatı', 'Servet-i Fünun ve Fecr-i Ati', 'Milli Edebiyat', 'Cumhuriyet Dönemi Türk Edebiyatı', 'Edebi Akımlar']
  },
  {
    key: 'ayt_tarih1',
    name: 'Tarih-1',
    maxQuestions: 10,
    category: 'AYT',
    topics: ['Tarih Bilimi', 'İlk Çağ Uygarlıkları', 'Orta Çağda Dünya', 'İlk Türk-İslam Devletleri', 'Osmanlı Devleti Kuruluş ve Yükselme', 'Osmanlı Kültür ve Medeniyeti', '20. Yüzyıl Başlarında Osmanlı', 'Kurtuluş Savaşı ve Antlaşmalar', 'Atatürk İlkeleri ve İnkılapları']
  },
  {
    key: 'ayt_cografya1',
    name: 'Coğrafya-1',
    maxQuestions: 6,
    category: 'AYT',
    topics: ['Biyoçeşitlilik ve Ekosistemler', 'Nüfus Politikaları', 'Türkiye’de Şehirler ve Fonksiyonları', 'Türkiye’nin Ekonomik Coğrafyası', 'Küresel Ticaret ve Turizm', 'Bölgeler ve Ülkeler', 'Çevre Sorunları']
  }
];

export const AYT_SOZEL_SUBJECTS: SubjectConfig[] = [
  {
    key: 'ayt_edebiyat',
    name: 'Türk Dili ve Edebiyatı',
    maxQuestions: 24,
    category: 'AYT',
    topics: ['Şiir Bilgisi', 'Edebi Sanatlar', 'Halk Edebiyatı', 'Divan Edebiyatı', 'Tanzimat & Servet-i Fünun', 'Milli Edebiyat', 'Cumhuriyet Dönemi Edebiyatı', 'Edebi Akımlar']
  },
  {
    key: 'ayt_tarih1',
    name: 'Tarih-1',
    maxQuestions: 10,
    category: 'AYT',
    topics: ['İlk ve Orta Çağda Türkler', 'İslam Medeniyeti', 'Osmanlı Tarihi', 'Milli Mücadele', 'İnkılap Tarihi']
  },
  {
    key: 'ayt_cografya1',
    name: 'Coğrafya-1',
    maxQuestions: 6,
    category: 'AYT',
    topics: ['Ekosistemler', 'Nüfus ve Yerleşme', 'Türkiye Ekonomisi', 'Küresel Örgütler']
  },
  {
    key: 'ayt_tarih2',
    name: 'Tarih-2',
    maxQuestions: 11,
    category: 'AYT',
    topics: ['Eski Türk Tarihi', 'Selçuklular', 'Osmanlı Diplomasi ve Islahatlar', 'I. Dünya Savaşı ve Sonrası', 'İki Savaş Arası Dönem', 'II. Dünya Savaşı ve Soğuk Savaş', 'Yumuşama Dönemi ve Küreselleşen Dünya']
  },
  {
    key: 'ayt_cografya2',
    name: 'Coğrafya-2',
    maxQuestions: 11,
    category: 'AYT',
    topics: ['Ekstrem Doğa Olayları', 'Doğal Kaynaklar ve Ekonomi', 'Türkiye’de Tarım ve Hayvancılık', 'Sanayi ve Madenler', 'Uluslararası Örgütler', 'Çevre ve Toplum']
  },
  {
    key: 'ayt_felsefe_grubu',
    name: 'Felsefe Grubu (Mantık, Psikoloji, Sosyoloji)',
    maxQuestions: 12,
    category: 'AYT',
    topics: ['Psikolojinin Alanı ve Süreçleri', 'Öğrenme, Bellek, Düşünme', 'Sosyolojiye Giriş', 'Toplumsal Yapı ve Değişme', 'Kültür ve Kurumlar', 'Klasik Mantık (Kavram, Önerme, Kıyas)', 'Sembolik Mantık']
  },
  {
    key: 'ayt_din_sozel',
    name: 'Din Kültürü ve Ahlak Bilgisi (Sözel)',
    maxQuestions: 6,
    category: 'AYT',
    topics: ['Kur’an ve Yorumu', 'İslam ve Bilim', 'Anadolu’da İslam', 'İslam Düşüncesinde Tasavvuf', 'Güncel Dini Meseleler', 'Dünya Dinleri']
  }
];

export const YDT_LANGUAGES: LanguageChoice[] = ['İngilizce', 'Almanca', 'Fransızca', 'Arapça', 'Rusça'];

export function getYdtSubjects(language: LanguageChoice = 'İngilizce'): SubjectConfig[] {
  return [
    {
      key: `ydt_${language.toLowerCase()}`,
      name: `YDT ${language}`,
      maxQuestions: 80,
      category: 'YDT',
      topics: ['Vocabulary', 'Grammar', 'Cloze Test', 'Sentence Completion', 'Reading Comprehension', 'Dialogue Completion', 'Restatement', 'Situation', 'Paragraph Completion', 'Translation']
    }
  ];
}

/**
 * Returns the relevant subjects dynamically based on student's field and the selected exam type.
 */
export function getSubjectsForExam(field: FieldType, examType: ExamType, language: LanguageChoice = 'İngilizce'): SubjectConfig[] {
  if (examType === 'TYT') {
    return TYT_SUBJECTS;
  }

  if (examType === 'YDT') {
    return getYdtSubjects(language);
  }

  let aytSubjects: SubjectConfig[] = [];
  switch (field) {
    case 'Sayısal':
      aytSubjects = AYT_SAYISAL_SUBJECTS;
      break;
    case 'Eşit Ağırlık':
      aytSubjects = AYT_ESIT_AGIRLIK_SUBJECTS;
      break;
    case 'Sözel':
      aytSubjects = AYT_SOZEL_SUBJECTS;
      break;
    case 'Dil':
      aytSubjects = getYdtSubjects(language);
      break;
  }

  if (examType === 'AYT') {
    return aytSubjects;
  }

  if (examType === 'TYT_AYT') {
    return [...TYT_SUBJECTS, ...aytSubjects];
  }

  return TYT_SUBJECTS;
}

/**
 * Net calculation standard formula: Net = Doğru - (Yanlış / 4)
 */
export function calculateNet(correct: number, wrong: number): number {
  const net = correct - (wrong / 4);
  return Math.max(0, Math.round(net * 100) / 100);
}
