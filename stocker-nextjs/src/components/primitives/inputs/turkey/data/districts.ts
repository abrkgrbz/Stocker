/**
 * =====================================
 * TURKEY DISTRICTS DATA
 * =====================================
 *
 * Districts (ilçeler) for all 81 cities of Turkey.
 * Complete data for all provinces.
 */

export interface District {
  name: string;
  cityCode: string;
}

export const TURKEY_DISTRICTS: Record<string, string[]> = {
  // Adana (01)
  '01': [
    'Aladağ', 'Ceyhan', 'Çukurova', 'Feke', 'İmamoğlu', 'Karaisalı', 'Karataş',
    'Kozan', 'Pozantı', 'Saimbeyli', 'Sarıçam', 'Seyhan', 'Tufanbeyli', 'Yumurtalık', 'Yüreğir'
  ],
  // Adıyaman (02)
  '02': [
    'Besni', 'Çelikhan', 'Gerger', 'Gölbaşı', 'Kahta', 'Merkez', 'Samsat', 'Sincik', 'Tut'
  ],
  // Afyonkarahisar (03)
  '03': [
    'Başmakçı', 'Bayat', 'Bolvadin', 'Çay', 'Çobanlar', 'Dazkırı', 'Dinar', 'Emirdağ',
    'Evciler', 'Hocalar', 'İhsaniye', 'İscehisar', 'Kızılören', 'Merkez', 'Sandıklı',
    'Sinanpaşa', 'Sultandağı', 'Şuhut'
  ],
  // Ağrı (04)
  '04': [
    'Diyadin', 'Doğubayazıt', 'Eleşkirt', 'Hamur', 'Merkez', 'Patnos', 'Taşlıçay', 'Tutak'
  ],
  // Amasya (05)
  '05': [
    'Göynücek', 'Gümüşhacıköy', 'Hamamözü', 'Merkez', 'Merzifon', 'Suluova', 'Taşova'
  ],
  // Ankara (06)
  '06': [
    'Akyurt', 'Altındağ', 'Ayaş', 'Balâ', 'Beypazarı', 'Çamlıdere', 'Çankaya',
    'Çubuk', 'Elmadağ', 'Etimesgut', 'Evren', 'Gölbaşı', 'Güdül', 'Haymana',
    'Kahramankazan', 'Kalecik', 'Keçiören', 'Kızılcahamam', 'Mamak', 'Nallıhan',
    'Polatlı', 'Pursaklar', 'Sincan', 'Şereflikoçhisar', 'Yenimahalle'
  ],
  // Antalya (07)
  '07': [
    'Akseki', 'Aksu', 'Alanya', 'Demre', 'Döşemealtı', 'Elmalı', 'Finike',
    'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer', 'Kepez', 'Konyaaltı',
    'Korkuteli', 'Kumluca', 'Manavgat', 'Muratpaşa', 'Serik'
  ],
  // Artvin (08)
  '08': [
    'Ardanuç', 'Arhavi', 'Borçka', 'Hopa', 'Kemalpaşa', 'Merkez', 'Murgul', 'Şavşat', 'Yusufeli'
  ],
  // Aydın (09)
  '09': [
    'Bozdoğan', 'Buharkent', 'Çine', 'Didim', 'Efeler', 'Germencik', 'İncirliova',
    'Karacasu', 'Karpuzlu', 'Koçarlı', 'Köşk', 'Kuşadası', 'Kuyucak', 'Nazilli',
    'Söke', 'Sultanhisar', 'Yenipazar'
  ],
  // Balıkesir (10)
  '10': [
    'Altıeylül', 'Ayvalık', 'Balya', 'Bandırma', 'Bigadiç', 'Burhaniye', 'Dursunbey',
    'Edremit', 'Erdek', 'Gömeç', 'Gönen', 'Havran', 'İvrindi', 'Karesi', 'Kepsut',
    'Manyas', 'Marmara', 'Savaştepe', 'Sındırgı', 'Susurluk'
  ],
  // Bilecik (11)
  '11': [
    'Bozüyük', 'Gölpazarı', 'İnhisar', 'Merkez', 'Osmaneli', 'Pazaryeri', 'Söğüt', 'Yenipazar'
  ],
  // Bingöl (12)
  '12': [
    'Adaklı', 'Genç', 'Karlıova', 'Kiğı', 'Merkez', 'Solhan', 'Yayladere', 'Yedisu'
  ],
  // Bitlis (13)
  '13': [
    'Adilcevaz', 'Ahlat', 'Güroymak', 'Hizan', 'Merkez', 'Mutki', 'Tatvan'
  ],
  // Bolu (14)
  '14': [
    'Dörtdivan', 'Gerede', 'Göynük', 'Kıbrıscık', 'Mengen', 'Merkez', 'Mudurnu', 'Seben', 'Yeniçağa'
  ],
  // Burdur (15)
  '15': [
    'Ağlasun', 'Altınyayla', 'Bucak', 'Çavdır', 'Çeltikçi', 'Gölhisar', 'Karamanlı',
    'Kemer', 'Merkez', 'Tefenni', 'Yeşilova'
  ],
  // Bursa (16)
  '16': [
    'Büyükorhan', 'Gemlik', 'Gürsu', 'Harmancık', 'İnegöl', 'İznik', 'Karacabey',
    'Keles', 'Kestel', 'Mudanya', 'Mustafakemalpaşa', 'Nilüfer', 'Orhaneli',
    'Orhangazi', 'Osmangazi', 'Yenişehir', 'Yıldırım'
  ],
  // Çanakkale (17)
  '17': [
    'Ayvacık', 'Bayramiç', 'Biga', 'Bozcaada', 'Çan', 'Eceabat', 'Ezine', 'Gelibolu',
    'Gökçeada', 'Lapseki', 'Merkez', 'Yenice'
  ],
  // Çankırı (18)
  '18': [
    'Atkaracalar', 'Bayramören', 'Çerkeş', 'Eldivan', 'Ilgaz', 'Kızılırmak', 'Korgun',
    'Kurşunlu', 'Merkez', 'Orta', 'Şabanözü', 'Yapraklı'
  ],
  // Çorum (19)
  '19': [
    'Alaca', 'Bayat', 'Boğazkale', 'Dodurga', 'İskilip', 'Kargı', 'Laçin', 'Mecitözü',
    'Merkez', 'Oğuzlar', 'Ortaköy', 'Osmancık', 'Sungurlu', 'Uğurludağ'
  ],
  // Denizli (20)
  '20': [
    'Acıpayam', 'Babadağ', 'Baklan', 'Bekilli', 'Beyağaç', 'Bozkurt', 'Buldan',
    'Çal', 'Çameli', 'Çardak', 'Çivril', 'Güney', 'Honaz', 'Kale', 'Merkezefendi',
    'Pamukkale', 'Sarayköy', 'Serinhisar', 'Tavas'
  ],
  // Diyarbakır (21)
  '21': [
    'Bağlar', 'Bismil', 'Çermik', 'Çınar', 'Çüngüş', 'Dicle', 'Eğil', 'Ergani',
    'Hani', 'Hazro', 'Kayapınar', 'Kocaköy', 'Kulp', 'Lice', 'Silvan', 'Sur', 'Yenişehir'
  ],
  // Edirne (22)
  '22': [
    'Enez', 'Havsa', 'İpsala', 'Keşan', 'Lalapaşa', 'Meriç', 'Merkez', 'Süloğlu', 'Uzunköprü'
  ],
  // Elazığ (23)
  '23': [
    'Ağın', 'Alacakaya', 'Arıcak', 'Baskil', 'Karakoçan', 'Keban', 'Kovancılar',
    'Maden', 'Merkez', 'Palu', 'Sivrice'
  ],
  // Erzincan (24)
  '24': [
    'Çayırlı', 'İliç', 'Kemah', 'Kemaliye', 'Merkez', 'Otlukbeli', 'Refahiye', 'Tercan', 'Üzümlü'
  ],
  // Erzurum (25)
  '25': [
    'Aşkale', 'Aziziye', 'Çat', 'Hınıs', 'Horasan', 'İspir', 'Karaçoban', 'Karayazı',
    'Köprüköy', 'Narman', 'Oltu', 'Olur', 'Palandöken', 'Pasinler', 'Pazaryolu',
    'Şenkaya', 'Tekman', 'Tortum', 'Uzundere', 'Yakutiye'
  ],
  // Eskişehir (26)
  '26': [
    'Alpu', 'Beylikova', 'Çifteler', 'Günyüzü', 'Han', 'İnönü', 'Mahmudiye',
    'Mihalgazi', 'Mihalıççık', 'Odunpazarı', 'Sarıcakaya', 'Seyitgazi',
    'Sivrihisar', 'Tepebaşı'
  ],
  // Gaziantep (27)
  '27': [
    'Araban', 'İslahiye', 'Karkamış', 'Nizip', 'Nurdağı', 'Oğuzeli', 'Şahinbey',
    'Şehitkamil', 'Yavuzeli'
  ],
  // Giresun (28)
  '28': [
    'Alucra', 'Bulancak', 'Çamoluk', 'Çanakçı', 'Dereli', 'Doğankent', 'Espiye',
    'Eynesil', 'Görele', 'Güce', 'Keşap', 'Merkez', 'Piraziz', 'Şebinkarahisar',
    'Tirebolu', 'Yağlıdere'
  ],
  // Gümüşhane (29)
  '29': [
    'Kelkit', 'Köse', 'Kürtün', 'Merkez', 'Şiran', 'Torul'
  ],
  // Hakkari (30)
  '30': [
    'Çukurca', 'Derecik', 'Merkez', 'Şemdinli', 'Yüksekova'
  ],
  // Hatay (31)
  '31': [
    'Altınözü', 'Antakya', 'Arsuz', 'Belen', 'Defne', 'Dörtyol', 'Erzin', 'Hassa',
    'İskenderun', 'Kırıkhan', 'Kumlu', 'Payas', 'Reyhanlı', 'Samandağ', 'Yayladağı'
  ],
  // Isparta (32)
  '32': [
    'Aksu', 'Atabey', 'Eğirdir', 'Gelendost', 'Gönen', 'Keçiborlu', 'Merkez',
    'Senirkent', 'Sütçüler', 'Şarkikaraağaç', 'Uluborlu', 'Yalvaç', 'Yenişarbademli'
  ],
  // Mersin (33)
  '33': [
    'Akdeniz', 'Anamur', 'Aydıncık', 'Bozyazı', 'Çamlıyayla', 'Erdemli', 'Gülnar',
    'Mezitli', 'Mut', 'Silifke', 'Tarsus', 'Toroslar', 'Yenişehir'
  ],
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
  // İzmir (35)
  '35': [
    'Aliağa', 'Balçova', 'Bayındır', 'Bayraklı', 'Bergama', 'Beydağ', 'Bornova',
    'Buca', 'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir', 'Güzelbahçe',
    'Karabağlar', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz',
    'Konak', 'Menderes', 'Menemen', 'Narlıdere', 'Ödemiş', 'Seferihisar',
    'Selçuk', 'Tire', 'Torbalı', 'Urla'
  ],
  // Kars (36)
  '36': [
    'Akyaka', 'Arpaçay', 'Digor', 'Kağızman', 'Merkez', 'Sarıkamış', 'Selim', 'Susuz'
  ],
  // Kastamonu (37)
  '37': [
    'Abana', 'Ağlı', 'Araç', 'Azdavay', 'Bozkurt', 'Cide', 'Çatalzeytin', 'Daday',
    'Devrekani', 'Doğanyurt', 'Hanönü', 'İhsangazi', 'İnebolu', 'Küre', 'Merkez',
    'Pınarbaşı', 'Seydiler', 'Şenpazar', 'Taşköprü', 'Tosya'
  ],
  // Kayseri (38)
  '38': [
    'Akkışla', 'Bünyan', 'Develi', 'Felahiye', 'Hacılar', 'İncesu', 'Kocasinan',
    'Melikgazi', 'Özvatan', 'Pınarbaşı', 'Sarıoğlan', 'Sarız', 'Talas', 'Tomarza',
    'Yahyalı', 'Yeşilhisar'
  ],
  // Kırklareli (39)
  '39': [
    'Babaeski', 'Demirköy', 'Kofçaz', 'Lüleburgaz', 'Merkez', 'Pehlivanköy', 'Pınarhisar', 'Vize'
  ],
  // Kırşehir (40)
  '40': [
    'Akçakent', 'Akpınar', 'Boztepe', 'Çiçekdağı', 'Kaman', 'Merkez', 'Mucur'
  ],
  // Kocaeli (41)
  '41': [
    'Başiskele', 'Çayırova', 'Darıca', 'Derince', 'Dilovası', 'Gebze', 'Gölcük',
    'İzmit', 'Kandıra', 'Karamürsel', 'Kartepe', 'Körfez'
  ],
  // Konya (42)
  '42': [
    'Ahırlı', 'Akören', 'Akşehir', 'Altınekin', 'Beyşehir', 'Bozkır', 'Cihanbeyli',
    'Çeltik', 'Çumra', 'Derbent', 'Derebucak', 'Doğanhisar', 'Emirgazi', 'Ereğli',
    'Güneysınır', 'Hadim', 'Halkapınar', 'Hüyük', 'Ilgın', 'Kadınhanı', 'Karapınar',
    'Karatay', 'Kulu', 'Meram', 'Sarayönü', 'Selçuklu', 'Seydişehir', 'Taşkent',
    'Tuzlukçu', 'Yalıhüyük', 'Yunak'
  ],
  // Kütahya (43)
  '43': [
    'Altıntaş', 'Aslanapa', 'Çavdarhisar', 'Domaniç', 'Dumlupınar', 'Emet', 'Gediz',
    'Hisarcık', 'Merkez', 'Pazarlar', 'Şaphane', 'Simav', 'Tavşanlı'
  ],
  // Malatya (44)
  '44': [
    'Akçadağ', 'Arapgir', 'Arguvan', 'Battalgazi', 'Darende', 'Doğanşehir',
    'Doğanyol', 'Hekimhan', 'Kale', 'Kuluncak', 'Pütürge', 'Yazıhan', 'Yeşilyurt'
  ],
  // Manisa (45)
  '45': [
    'Ahmetli', 'Akhisar', 'Alaşehir', 'Demirci', 'Gölmarmara', 'Gördes', 'Kırkağaç',
    'Köprübaşı', 'Kula', 'Salihli', 'Sarıgöl', 'Saruhanlı', 'Selendi', 'Soma',
    'Şehzadeler', 'Turgutlu', 'Yunusemre'
  ],
  // Kahramanmaraş (46)
  '46': [
    'Afşin', 'Andırın', 'Çağlayancerit', 'Dulkadiroğlu', 'Ekinözü', 'Elbistan',
    'Göksun', 'Nurhak', 'Onikişubat', 'Pazarcık', 'Türkoğlu'
  ],
  // Mardin (47)
  '47': [
    'Artuklu', 'Dargeçit', 'Derik', 'Kızıltepe', 'Mazıdağı', 'Midyat', 'Nusaybin',
    'Ömerli', 'Savur', 'Yeşilli'
  ],
  // Muğla (48)
  '48': [
    'Bodrum', 'Dalaman', 'Datça', 'Fethiye', 'Kavaklıdere', 'Köyceğiz', 'Marmaris',
    'Menteşe', 'Milas', 'Ortaca', 'Seydikemer', 'Ula', 'Yatağan'
  ],
  // Muş (49)
  '49': [
    'Bulanık', 'Hasköy', 'Korkut', 'Malazgirt', 'Merkez', 'Varto'
  ],
  // Nevşehir (50)
  '50': [
    'Acıgöl', 'Avanos', 'Derinkuyu', 'Gülşehir', 'Hacıbektaş', 'Kozaklı', 'Merkez', 'Ürgüp'
  ],
  // Niğde (51)
  '51': [
    'Altunhisar', 'Bor', 'Çamardı', 'Çiftlik', 'Merkez', 'Ulukışla'
  ],
  // Ordu (52)
  '52': [
    'Akkuş', 'Altınordu', 'Aybastı', 'Çamaş', 'Çatalpınar', 'Çaybaşı', 'Fatsa',
    'Gölköy', 'Gülyalı', 'Gürgentepe', 'İkizce', 'Kabadüz', 'Kabataş', 'Korgan',
    'Kumru', 'Mesudiye', 'Perşembe', 'Ulubey', 'Ünye'
  ],
  // Rize (53)
  '53': [
    'Ardeşen', 'Çamlıhemşin', 'Çayeli', 'Derepazarı', 'Fındıklı', 'Güneysu',
    'Hemşin', 'İkizdere', 'İyidere', 'Kalkandere', 'Merkez', 'Pazar'
  ],
  // Sakarya (54)
  '54': [
    'Adapazarı', 'Akyazı', 'Arifiye', 'Erenler', 'Ferizli', 'Geyve', 'Hendek',
    'Karapürçek', 'Karasu', 'Kaynarca', 'Kocaali', 'Pamukova', 'Sapanca',
    'Serdivan', 'Söğütlü', 'Taraklı'
  ],
  // Samsun (55)
  '55': [
    'Alaçam', 'Asarcık', 'Atakum', 'Ayvacık', 'Bafra', 'Canik', 'Çarşamba',
    'Havza', 'İlkadım', 'Kavak', 'Ladik', 'Ondokuzmayıs', 'Salıpazarı',
    'Tekkeköy', 'Terme', 'Vezirköprü', 'Yakakent'
  ],
  // Siirt (56)
  '56': [
    'Baykan', 'Eruh', 'Kurtalan', 'Merkez', 'Pervari', 'Şirvan', 'Tillo'
  ],
  // Sinop (57)
  '57': [
    'Ayancık', 'Boyabat', 'Dikmen', 'Durağan', 'Erfelek', 'Gerze', 'Merkez', 'Saraydüzü', 'Türkeli'
  ],
  // Sivas (58)
  '58': [
    'Akıncılar', 'Altınyayla', 'Divriği', 'Doğanşar', 'Gemerek', 'Gölova', 'Gürün',
    'Hafik', 'İmranlı', 'Kangal', 'Koyulhisar', 'Merkez', 'Suşehri', 'Şarkışla',
    'Ulaş', 'Yıldızeli', 'Zara'
  ],
  // Tekirdağ (59)
  '59': [
    'Çerkezköy', 'Çorlu', 'Ergene', 'Hayrabolu', 'Kapaklı', 'Malkara',
    'Marmaraereğlisi', 'Muratlı', 'Saray', 'Süleymanpaşa', 'Şarköy'
  ],
  // Tokat (60)
  '60': [
    'Almus', 'Artova', 'Başçiftlik', 'Erbaa', 'Merkez', 'Niksar', 'Pazar',
    'Reşadiye', 'Sulusaray', 'Turhal', 'Yeşilyurt', 'Zile'
  ],
  // Trabzon (61)
  '61': [
    'Akçaabat', 'Araklı', 'Arsin', 'Beşikdüzü', 'Çarşıbaşı', 'Çaykara', 'Dernekpazarı',
    'Düzköy', 'Hayrat', 'Köprübaşı', 'Maçka', 'Of', 'Ortahisar', 'Sürmene',
    'Şalpazarı', 'Tonya', 'Vakfıkebir', 'Yomra'
  ],
  // Tunceli (62)
  '62': [
    'Çemişgezek', 'Hozat', 'Mazgirt', 'Merkez', 'Nazımiye', 'Ovacık', 'Pertek', 'Pülümür'
  ],
  // Şanlıurfa (63)
  '63': [
    'Akçakale', 'Birecik', 'Bozova', 'Ceylanpınar', 'Eyyübiye', 'Halfeti',
    'Haliliye', 'Harran', 'Hilvan', 'Karaköprü', 'Siverek', 'Suruç', 'Viranşehir'
  ],
  // Uşak (64)
  '64': [
    'Banaz', 'Eşme', 'Karahallı', 'Merkez', 'Sivaslı', 'Ulubey'
  ],
  // Van (65)
  '65': [
    'Bahçesaray', 'Başkale', 'Çaldıran', 'Çatak', 'Edremit', 'Erciş', 'Gevaş',
    'Gürpınar', 'İpekyolu', 'Muradiye', 'Özalp', 'Saray', 'Tuşba'
  ],
  // Yozgat (66)
  '66': [
    'Akdağmadeni', 'Aydıncık', 'Boğazlıyan', 'Çandır', 'Çayıralan', 'Çekerek',
    'Kadışehri', 'Merkez', 'Saraykent', 'Sarıkaya', 'Sorgun', 'Şefaatli', 'Yenifakılı', 'Yerköy'
  ],
  // Zonguldak (67)
  '67': [
    'Alaplı', 'Çaycuma', 'Devrek', 'Ereğli', 'Gökçebey', 'Kilimli', 'Kozlu', 'Merkez'
  ],
  // Aksaray (68)
  '68': [
    'Ağaçören', 'Eskil', 'Gülağaç', 'Güzelyurt', 'Merkez', 'Ortaköy', 'Sarıyahşi', 'Sultanhanı'
  ],
  // Bayburt (69)
  '69': [
    'Aydıntepe', 'Demirözü', 'Merkez'
  ],
  // Karaman (70)
  '70': [
    'Ayrancı', 'Başyayla', 'Ermenek', 'Kazımkarabekir', 'Merkez', 'Sarıveliler'
  ],
  // Kırıkkale (71)
  '71': [
    'Bahşili', 'Balışeyh', 'Çelebi', 'Delice', 'Karakeçili', 'Keskin', 'Merkez', 'Sulakyurt', 'Yahşihan'
  ],
  // Batman (72)
  '72': [
    'Beşiri', 'Gercüş', 'Hasankeyf', 'Kozluk', 'Merkez', 'Sason'
  ],
  // Şırnak (73)
  '73': [
    'Beytüşşebap', 'Cizre', 'Güçlükonak', 'İdil', 'Merkez', 'Silopi', 'Uludere'
  ],
  // Bartın (74)
  '74': [
    'Amasra', 'Kurucaşile', 'Merkez', 'Ulus'
  ],
  // Ardahan (75)
  '75': [
    'Çıldır', 'Damal', 'Göle', 'Hanak', 'Merkez', 'Posof'
  ],
  // Iğdır (76)
  '76': [
    'Aralık', 'Karakoyunlu', 'Merkez', 'Tuzluca'
  ],
  // Yalova (77)
  '77': [
    'Altınova', 'Armutlu', 'Çiftlikköy', 'Çınarcık', 'Merkez', 'Termal'
  ],
  // Karabük (78)
  '78': [
    'Eflani', 'Eskipazar', 'Merkez', 'Ovacık', 'Safranbolu', 'Yenice'
  ],
  // Kilis (79)
  '79': [
    'Elbeyli', 'Merkez', 'Musabeyli', 'Polateli'
  ],
  // Osmaniye (80)
  '80': [
    'Bahçe', 'Düziçi', 'Hasanbeyli', 'Kadirli', 'Merkez', 'Sumbas', 'Toprakkale'
  ],
  // Düzce (81)
  '81': [
    'Akçakoca', 'Cumayeri', 'Çilimli', 'Gölyaka', 'Gümüşova', 'Kaynaşlı', 'Merkez', 'Yığılca'
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
