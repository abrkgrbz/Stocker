/**
 * =====================================
 * TURKEY DISTRICTS DATA
 * =====================================
 *
 * Districts (ilçeler) for major cities.
 * Complete data for İstanbul, Ankara, İzmir, and other major cities.
 */

export interface District {
  name: string;
  cityCode: string;
}

export const TURKEY_DISTRICTS: Record<string, string[]> = {
  // İstanbul (34)
  '34': [
    'Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler',
    'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü',
    'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt',
    'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane',
    'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer',
    'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla',
    'Ümraniye', 'Üsküdar', 'Zeytinburnu'
  ],
  // Ankara (06)
  '06': [
    'Akyurt', 'Altındağ', 'Ayaş', 'Balâ', 'Beypazarı', 'Çamlıdere', 'Çankaya',
    'Çubuk', 'Elmadağ', 'Etimesgut', 'Evren', 'Gölbaşı', 'Güdül', 'Haymana',
    'Kahramankazan', 'Kalecik', 'Keçiören', 'Kızılcahamam', 'Mamak', 'Nallıhan',
    'Polatlı', 'Pursaklar', 'Sincan', 'Şereflikoçhisar', 'Yenimahalle'
  ],
  // İzmir (35)
  '35': [
    'Aliağa', 'Balçova', 'Bayındır', 'Bayraklı', 'Bergama', 'Beydağ', 'Bornova',
    'Buca', 'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir', 'Güzelbahçe',
    'Karabağlar', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz',
    'Konak', 'Menderes', 'Menemen', 'Narlıdere', 'Ödemiş', 'Seferihisar',
    'Selçuk', 'Tire', 'Torbalı', 'Urla'
  ],
  // Bursa (16)
  '16': [
    'Büyükorhan', 'Gemlik', 'Gürsu', 'Harmancık', 'İnegöl', 'İznik', 'Karacabey',
    'Keles', 'Kestel', 'Mudanya', 'Mustafakemalpaşa', 'Nilüfer', 'Orhaneli',
    'Orhangazi', 'Osmangazi', 'Yenişehir', 'Yıldırım'
  ],
  // Antalya (07)
  '07': [
    'Akseki', 'Aksu', 'Alanya', 'Demre', 'Döşemealtı', 'Elmalı', 'Finike',
    'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer', 'Kepez', 'Konyaaltı',
    'Korkuteli', 'Kumluca', 'Manavgat', 'Muratpaşa', 'Serik'
  ],
  // Adana (01)
  '01': [
    'Aladağ', 'Ceyhan', 'Çukurova', 'Feke', 'İmamoğlu', 'Karaisalı', 'Karataş',
    'Kozan', 'Pozantı', 'Saimbeyli', 'Sarıçam', 'Seyhan', 'Tufanbeyli', 'Yumurtalık', 'Yüreğir'
  ],
  // Konya (42)
  '42': [
    'Ahırlı', 'Akören', 'Akşehir', 'Altınekin', 'Beyşehir', 'Bozkır', 'Cihanbeyli',
    'Çeltik', 'Çumra', 'Derbent', 'Derebucak', 'Doğanhisar', 'Emirgazi', 'Ereğli',
    'Güneysınır', 'Hadim', 'Halkapınar', 'Hüyük', 'Ilgın', 'Kadınhanı', 'Karapınar',
    'Karatay', 'Kulu', 'Meram', 'Sarayönü', 'Selçuklu', 'Seydişehir', 'Taşkent',
    'Tuzlukçu', 'Yalıhüyük', 'Yunak'
  ],
  // Gaziantep (27)
  '27': [
    'Araban', 'İslahiye', 'Karkamış', 'Nizip', 'Nurdağı', 'Oğuzeli', 'Şahinbey',
    'Şehitkamil', 'Yavuzeli'
  ],
  // Kocaeli (41)
  '41': [
    'Başiskele', 'Çayırova', 'Darıca', 'Derince', 'Dilovası', 'Gebze', 'Gölcük',
    'İzmit', 'Kandıra', 'Karamürsel', 'Kartepe', 'Körfez'
  ],
  // Mersin (33)
  '33': [
    'Akdeniz', 'Anamur', 'Aydıncık', 'Bozyazı', 'Çamlıyayla', 'Erdemli', 'Gülnar',
    'Mezitli', 'Mut', 'Silifke', 'Tarsus', 'Toroslar', 'Yenişehir'
  ],
  // Kayseri (38)
  '38': [
    'Akkışla', 'Bünyan', 'Develi', 'Felahiye', 'Hacılar', 'İncesu', 'Kocasinan',
    'Melikgazi', 'Özvatan', 'Pınarbaşı', 'Sarıoğlan', 'Sarız', 'Talas', 'Tomarza',
    'Yahyalı', 'Yeşilhisar'
  ],
  // Eskişehir (26)
  '26': [
    'Alpu', 'Beylikova', 'Çifteler', 'Günyüzü', 'Han', 'İnönü', 'Mahmudiye',
    'Mihalgazi', 'Mihalıççık', 'Odunpazarı', 'Sarıcakaya', 'Seyitgazi',
    'Sivrihisar', 'Tepebaşı'
  ],
  // Diyarbakır (21)
  '21': [
    'Bağlar', 'Bismil', 'Çermik', 'Çınar', 'Çüngüş', 'Dicle', 'Eğil', 'Ergani',
    'Hani', 'Hazro', 'Kayapınar', 'Kocaköy', 'Kulp', 'Lice', 'Silvan', 'Sur', 'Yenişehir'
  ],
  // Samsun (55)
  '55': [
    'Alaçam', 'Asarcık', 'Atakum', 'Ayvacık', 'Bafra', 'Canik', 'Çarşamba',
    'Havza', 'İlkadım', 'Kavak', 'Ladik', 'Ondokuzmayıs', 'Salıpazarı',
    'Tekkeköy', 'Terme', 'Vezirköprü', 'Yakakent'
  ],
  // Denizli (20)
  '20': [
    'Acıpayam', 'Babadağ', 'Baklan', 'Bekilli', 'Beyağaç', 'Bozkurt', 'Buldan',
    'Çal', 'Çameli', 'Çardak', 'Çivril', 'Güney', 'Honaz', 'Kale', 'Merkezefendi',
    'Pamukkale', 'Sarayköy', 'Serinhisar', 'Tavas'
  ],
  // Şanlıurfa (63)
  '63': [
    'Akçakale', 'Birecik', 'Bozova', 'Ceylanpınar', 'Eyyübiye', 'Halfeti',
    'Haliliye', 'Harran', 'Hilvan', 'Karaköprü', 'Siverek', 'Suruç', 'Viranşehir'
  ],
  // Malatya (44)
  '44': [
    'Akçadağ', 'Arapgir', 'Arguvan', 'Battalgazi', 'Darende', 'Doğanşehir',
    'Doğanyol', 'Hekimhan', 'Kale', 'Kuluncak', 'Pütürge', 'Yazıhan', 'Yeşilyurt'
  ],
  // Trabzon (61)
  '61': [
    'Akçaabat', 'Araklı', 'Arsin', 'Beşikdüzü', 'Çarşıbaşı', 'Çaykara', 'Dernekpazarı',
    'Düzköy', 'Hayrat', 'Köprübaşı', 'Maçka', 'Of', 'Ortahisar', 'Sürmene',
    'Şalpazarı', 'Tonya', 'Vakfıkebir', 'Yomra'
  ],
  // Sakarya (54)
  '54': [
    'Adapazarı', 'Akyazı', 'Arifiye', 'Erenler', 'Ferizli', 'Geyve', 'Hendek',
    'Karapürçek', 'Karasu', 'Kaynarca', 'Kocaali', 'Pamukova', 'Sapanca',
    'Serdivan', 'Söğütlü', 'Taraklı'
  ],
  // Tekirdağ (59)
  '59': [
    'Çerkezköy', 'Çorlu', 'Ergene', 'Hayrabolu', 'Kapaklı', 'Malkara',
    'Marmaraereğlisi', 'Muratlı', 'Saray', 'Süleymanpaşa', 'Şarköy'
  ],
  // Manisa (45)
  '45': [
    'Ahmetli', 'Akhisar', 'Alaşehir', 'Demirci', 'Gölmarmara', 'Gördes', 'Kırkağaç',
    'Köprübaşı', 'Kula', 'Salihli', 'Sarıgöl', 'Saruhanlı', 'Selendi', 'Soma',
    'Şehzadeler', 'Turgutlu', 'Yunusemre'
  ],
  // Balıkesir (10)
  '10': [
    'Altıeylül', 'Ayvalık', 'Balya', 'Bandırma', 'Bigadiç', 'Burhaniye', 'Dursunbey',
    'Edremit', 'Erdek', 'Gömeç', 'Gönen', 'Havran', 'İvrindi', 'Karesi', 'Kepsut',
    'Manyas', 'Marmara', 'Savaştepe', 'Sındırgı', 'Susurluk'
  ],
  // Hatay (31)
  '31': [
    'Altınözü', 'Antakya', 'Arsuz', 'Belen', 'Defne', 'Dörtyol', 'Erzin', 'Hassa',
    'İskenderun', 'Kırıkhan', 'Kumlu', 'Payas', 'Reyhanlı', 'Samandağ', 'Yayladağı'
  ],
  // Muğla (48)
  '48': [
    'Bodrum', 'Dalaman', 'Datça', 'Fethiye', 'Kavaklıdere', 'Köyceğiz', 'Marmaris',
    'Menteşe', 'Milas', 'Ortaca', 'Seydikemer', 'Ula', 'Yatağan'
  ],
  // Aydın (09)
  '09': [
    'Bozdoğan', 'Buharkent', 'Çine', 'Didim', 'Efeler', 'Germencik', 'İncirliova',
    'Karacasu', 'Karpuzlu', 'Koçarlı', 'Köşk', 'Kuşadası', 'Kuyucak', 'Nazilli',
    'Söke', 'Sultanhisar', 'Yenipazar'
  ],
};

/**
 * Get districts for a city
 */
export function getDistrictsByCity(cityCode: string): string[] {
  return TURKEY_DISTRICTS[cityCode] || [];
}

/**
 * Check if city has districts data
 */
export function hasDistrictsData(cityCode: string): boolean {
  return cityCode in TURKEY_DISTRICTS;
}

export default TURKEY_DISTRICTS;
