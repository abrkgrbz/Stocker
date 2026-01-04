export interface City {
    id: string;
    name: string;
    plateCode: string;
}

export interface District {
    id: string;
    name: string;
    cityId: string;
}

// 81 il - Plaka koduna göre sıralı
export const TURKEY_CITIES: City[] = [
    { id: 'city-01', name: 'Adana', plateCode: '01' },
    { id: 'city-02', name: 'Adıyaman', plateCode: '02' },
    { id: 'city-03', name: 'Afyonkarahisar', plateCode: '03' },
    { id: 'city-04', name: 'Ağrı', plateCode: '04' },
    { id: 'city-05', name: 'Amasya', plateCode: '05' },
    { id: 'city-06', name: 'Ankara', plateCode: '06' },
    { id: 'city-07', name: 'Antalya', plateCode: '07' },
    { id: 'city-08', name: 'Artvin', plateCode: '08' },
    { id: 'city-09', name: 'Aydın', plateCode: '09' },
    { id: 'city-10', name: 'Balıkesir', plateCode: '10' },
    { id: 'city-11', name: 'Bilecik', plateCode: '11' },
    { id: 'city-12', name: 'Bingöl', plateCode: '12' },
    { id: 'city-13', name: 'Bitlis', plateCode: '13' },
    { id: 'city-14', name: 'Bolu', plateCode: '14' },
    { id: 'city-15', name: 'Burdur', plateCode: '15' },
    { id: 'city-16', name: 'Bursa', plateCode: '16' },
    { id: 'city-17', name: 'Çanakkale', plateCode: '17' },
    { id: 'city-18', name: 'Çankırı', plateCode: '18' },
    { id: 'city-19', name: 'Çorum', plateCode: '19' },
    { id: 'city-20', name: 'Denizli', plateCode: '20' },
    { id: 'city-21', name: 'Diyarbakır', plateCode: '21' },
    { id: 'city-22', name: 'Edirne', plateCode: '22' },
    { id: 'city-23', name: 'Elazığ', plateCode: '23' },
    { id: 'city-24', name: 'Erzincan', plateCode: '24' },
    { id: 'city-25', name: 'Erzurum', plateCode: '25' },
    { id: 'city-26', name: 'Eskişehir', plateCode: '26' },
    { id: 'city-27', name: 'Gaziantep', plateCode: '27' },
    { id: 'city-28', name: 'Giresun', plateCode: '28' },
    { id: 'city-29', name: 'Gümüşhane', plateCode: '29' },
    { id: 'city-30', name: 'Hakkari', plateCode: '30' },
    { id: 'city-31', name: 'Hatay', plateCode: '31' },
    { id: 'city-32', name: 'Isparta', plateCode: '32' },
    { id: 'city-33', name: 'Mersin', plateCode: '33' },
    { id: 'city-34', name: 'İstanbul', plateCode: '34' },
    { id: 'city-35', name: 'İzmir', plateCode: '35' },
    { id: 'city-36', name: 'Kars', plateCode: '36' },
    { id: 'city-37', name: 'Kastamonu', plateCode: '37' },
    { id: 'city-38', name: 'Kayseri', plateCode: '38' },
    { id: 'city-39', name: 'Kırklareli', plateCode: '39' },
    { id: 'city-40', name: 'Kırşehir', plateCode: '40' },
    { id: 'city-41', name: 'Kocaeli', plateCode: '41' },
    { id: 'city-42', name: 'Konya', plateCode: '42' },
    { id: 'city-43', name: 'Kütahya', plateCode: '43' },
    { id: 'city-44', name: 'Malatya', plateCode: '44' },
    { id: 'city-45', name: 'Manisa', plateCode: '45' },
    { id: 'city-46', name: 'Kahramanmaraş', plateCode: '46' },
    { id: 'city-47', name: 'Mardin', plateCode: '47' },
    { id: 'city-48', name: 'Muğla', plateCode: '48' },
    { id: 'city-49', name: 'Muş', plateCode: '49' },
    { id: 'city-50', name: 'Nevşehir', plateCode: '50' },
    { id: 'city-51', name: 'Niğde', plateCode: '51' },
    { id: 'city-52', name: 'Ordu', plateCode: '52' },
    { id: 'city-53', name: 'Rize', plateCode: '53' },
    { id: 'city-54', name: 'Sakarya', plateCode: '54' },
    { id: 'city-55', name: 'Samsun', plateCode: '55' },
    { id: 'city-56', name: 'Siirt', plateCode: '56' },
    { id: 'city-57', name: 'Sinop', plateCode: '57' },
    { id: 'city-58', name: 'Sivas', plateCode: '58' },
    { id: 'city-59', name: 'Tekirdağ', plateCode: '59' },
    { id: 'city-60', name: 'Tokat', plateCode: '60' },
    { id: 'city-61', name: 'Trabzon', plateCode: '61' },
    { id: 'city-62', name: 'Tunceli', plateCode: '62' },
    { id: 'city-63', name: 'Şanlıurfa', plateCode: '63' },
    { id: 'city-64', name: 'Uşak', plateCode: '64' },
    { id: 'city-65', name: 'Van', plateCode: '65' },
    { id: 'city-66', name: 'Yozgat', plateCode: '66' },
    { id: 'city-67', name: 'Zonguldak', plateCode: '67' },
    { id: 'city-68', name: 'Aksaray', plateCode: '68' },
    { id: 'city-69', name: 'Bayburt', plateCode: '69' },
    { id: 'city-70', name: 'Karaman', plateCode: '70' },
    { id: 'city-71', name: 'Kırıkkale', plateCode: '71' },
    { id: 'city-72', name: 'Batman', plateCode: '72' },
    { id: 'city-73', name: 'Şırnak', plateCode: '73' },
    { id: 'city-74', name: 'Bartın', plateCode: '74' },
    { id: 'city-75', name: 'Ardahan', plateCode: '75' },
    { id: 'city-76', name: 'Iğdır', plateCode: '76' },
    { id: 'city-77', name: 'Yalova', plateCode: '77' },
    { id: 'city-78', name: 'Karabük', plateCode: '78' },
    { id: 'city-79', name: 'Kilis', plateCode: '79' },
    { id: 'city-80', name: 'Osmaniye', plateCode: '80' },
    { id: 'city-81', name: 'Düzce', plateCode: '81' },
];

// Popüler iller için ilçeler (İstanbul, Ankara, İzmir, Bursa, Antalya)
export const TURKEY_DISTRICTS: District[] = [
    // İstanbul (34)
    { id: 'dist-34-01', name: 'Adalar', cityId: 'city-34' },
    { id: 'dist-34-02', name: 'Arnavutköy', cityId: 'city-34' },
    { id: 'dist-34-03', name: 'Ataşehir', cityId: 'city-34' },
    { id: 'dist-34-04', name: 'Avcılar', cityId: 'city-34' },
    { id: 'dist-34-05', name: 'Bağcılar', cityId: 'city-34' },
    { id: 'dist-34-06', name: 'Bahçelievler', cityId: 'city-34' },
    { id: 'dist-34-07', name: 'Bakırköy', cityId: 'city-34' },
    { id: 'dist-34-08', name: 'Başakşehir', cityId: 'city-34' },
    { id: 'dist-34-09', name: 'Bayrampaşa', cityId: 'city-34' },
    { id: 'dist-34-10', name: 'Beşiktaş', cityId: 'city-34' },
    { id: 'dist-34-11', name: 'Beykoz', cityId: 'city-34' },
    { id: 'dist-34-12', name: 'Beylikdüzü', cityId: 'city-34' },
    { id: 'dist-34-13', name: 'Beyoğlu', cityId: 'city-34' },
    { id: 'dist-34-14', name: 'Büyükçekmece', cityId: 'city-34' },
    { id: 'dist-34-15', name: 'Çatalca', cityId: 'city-34' },
    { id: 'dist-34-16', name: 'Çekmeköy', cityId: 'city-34' },
    { id: 'dist-34-17', name: 'Esenler', cityId: 'city-34' },
    { id: 'dist-34-18', name: 'Esenyurt', cityId: 'city-34' },
    { id: 'dist-34-19', name: 'Eyüpsultan', cityId: 'city-34' },
    { id: 'dist-34-20', name: 'Fatih', cityId: 'city-34' },
    { id: 'dist-34-21', name: 'Gaziosmanpaşa', cityId: 'city-34' },
    { id: 'dist-34-22', name: 'Güngören', cityId: 'city-34' },
    { id: 'dist-34-23', name: 'Kadıköy', cityId: 'city-34' },
    { id: 'dist-34-24', name: 'Kağıthane', cityId: 'city-34' },
    { id: 'dist-34-25', name: 'Kartal', cityId: 'city-34' },
    { id: 'dist-34-26', name: 'Küçükçekmece', cityId: 'city-34' },
    { id: 'dist-34-27', name: 'Maltepe', cityId: 'city-34' },
    { id: 'dist-34-28', name: 'Pendik', cityId: 'city-34' },
    { id: 'dist-34-29', name: 'Sancaktepe', cityId: 'city-34' },
    { id: 'dist-34-30', name: 'Sarıyer', cityId: 'city-34' },
    { id: 'dist-34-31', name: 'Silivri', cityId: 'city-34' },
    { id: 'dist-34-32', name: 'Sultanbeyli', cityId: 'city-34' },
    { id: 'dist-34-33', name: 'Sultangazi', cityId: 'city-34' },
    { id: 'dist-34-34', name: 'Şile', cityId: 'city-34' },
    { id: 'dist-34-35', name: 'Şişli', cityId: 'city-34' },
    { id: 'dist-34-36', name: 'Tuzla', cityId: 'city-34' },
    { id: 'dist-34-37', name: 'Ümraniye', cityId: 'city-34' },
    { id: 'dist-34-38', name: 'Üsküdar', cityId: 'city-34' },
    { id: 'dist-34-39', name: 'Zeytinburnu', cityId: 'city-34' },

    // Ankara (06)
    { id: 'dist-06-01', name: 'Akyurt', cityId: 'city-06' },
    { id: 'dist-06-02', name: 'Altındağ', cityId: 'city-06' },
    { id: 'dist-06-03', name: 'Ayaş', cityId: 'city-06' },
    { id: 'dist-06-04', name: 'Balâ', cityId: 'city-06' },
    { id: 'dist-06-05', name: 'Beypazarı', cityId: 'city-06' },
    { id: 'dist-06-06', name: 'Çamlıdere', cityId: 'city-06' },
    { id: 'dist-06-07', name: 'Çankaya', cityId: 'city-06' },
    { id: 'dist-06-08', name: 'Çubuk', cityId: 'city-06' },
    { id: 'dist-06-09', name: 'Elmadağ', cityId: 'city-06' },
    { id: 'dist-06-10', name: 'Etimesgut', cityId: 'city-06' },
    { id: 'dist-06-11', name: 'Evren', cityId: 'city-06' },
    { id: 'dist-06-12', name: 'Gölbaşı', cityId: 'city-06' },
    { id: 'dist-06-13', name: 'Güdül', cityId: 'city-06' },
    { id: 'dist-06-14', name: 'Haymana', cityId: 'city-06' },
    { id: 'dist-06-15', name: 'Kahramankazan', cityId: 'city-06' },
    { id: 'dist-06-16', name: 'Kalecik', cityId: 'city-06' },
    { id: 'dist-06-17', name: 'Keçiören', cityId: 'city-06' },
    { id: 'dist-06-18', name: 'Kızılcahamam', cityId: 'city-06' },
    { id: 'dist-06-19', name: 'Mamak', cityId: 'city-06' },
    { id: 'dist-06-20', name: 'Nallıhan', cityId: 'city-06' },
    { id: 'dist-06-21', name: 'Polatlı', cityId: 'city-06' },
    { id: 'dist-06-22', name: 'Pursaklar', cityId: 'city-06' },
    { id: 'dist-06-23', name: 'Sincan', cityId: 'city-06' },
    { id: 'dist-06-24', name: 'Şereflikoçhisar', cityId: 'city-06' },
    { id: 'dist-06-25', name: 'Yenimahalle', cityId: 'city-06' },

    // İzmir (35)
    { id: 'dist-35-01', name: 'Aliağa', cityId: 'city-35' },
    { id: 'dist-35-02', name: 'Balçova', cityId: 'city-35' },
    { id: 'dist-35-03', name: 'Bayındır', cityId: 'city-35' },
    { id: 'dist-35-04', name: 'Bayraklı', cityId: 'city-35' },
    { id: 'dist-35-05', name: 'Bergama', cityId: 'city-35' },
    { id: 'dist-35-06', name: 'Beydağ', cityId: 'city-35' },
    { id: 'dist-35-07', name: 'Bornova', cityId: 'city-35' },
    { id: 'dist-35-08', name: 'Buca', cityId: 'city-35' },
    { id: 'dist-35-09', name: 'Çeşme', cityId: 'city-35' },
    { id: 'dist-35-10', name: 'Çiğli', cityId: 'city-35' },
    { id: 'dist-35-11', name: 'Dikili', cityId: 'city-35' },
    { id: 'dist-35-12', name: 'Foça', cityId: 'city-35' },
    { id: 'dist-35-13', name: 'Gaziemir', cityId: 'city-35' },
    { id: 'dist-35-14', name: 'Güzelbahçe', cityId: 'city-35' },
    { id: 'dist-35-15', name: 'Karabağlar', cityId: 'city-35' },
    { id: 'dist-35-16', name: 'Karaburun', cityId: 'city-35' },
    { id: 'dist-35-17', name: 'Karşıyaka', cityId: 'city-35' },
    { id: 'dist-35-18', name: 'Kemalpaşa', cityId: 'city-35' },
    { id: 'dist-35-19', name: 'Kınık', cityId: 'city-35' },
    { id: 'dist-35-20', name: 'Kiraz', cityId: 'city-35' },
    { id: 'dist-35-21', name: 'Konak', cityId: 'city-35' },
    { id: 'dist-35-22', name: 'Menderes', cityId: 'city-35' },
    { id: 'dist-35-23', name: 'Menemen', cityId: 'city-35' },
    { id: 'dist-35-24', name: 'Narlıdere', cityId: 'city-35' },
    { id: 'dist-35-25', name: 'Ödemiş', cityId: 'city-35' },
    { id: 'dist-35-26', name: 'Seferihisar', cityId: 'city-35' },
    { id: 'dist-35-27', name: 'Selçuk', cityId: 'city-35' },
    { id: 'dist-35-28', name: 'Tire', cityId: 'city-35' },
    { id: 'dist-35-29', name: 'Torbalı', cityId: 'city-35' },
    { id: 'dist-35-30', name: 'Urla', cityId: 'city-35' },

    // Bursa (16)
    { id: 'dist-16-01', name: 'Büyükorhan', cityId: 'city-16' },
    { id: 'dist-16-02', name: 'Gemlik', cityId: 'city-16' },
    { id: 'dist-16-03', name: 'Gürsu', cityId: 'city-16' },
    { id: 'dist-16-04', name: 'Harmancık', cityId: 'city-16' },
    { id: 'dist-16-05', name: 'İnegöl', cityId: 'city-16' },
    { id: 'dist-16-06', name: 'İznik', cityId: 'city-16' },
    { id: 'dist-16-07', name: 'Karacabey', cityId: 'city-16' },
    { id: 'dist-16-08', name: 'Keles', cityId: 'city-16' },
    { id: 'dist-16-09', name: 'Kestel', cityId: 'city-16' },
    { id: 'dist-16-10', name: 'Mudanya', cityId: 'city-16' },
    { id: 'dist-16-11', name: 'Mustafakemalpaşa', cityId: 'city-16' },
    { id: 'dist-16-12', name: 'Nilüfer', cityId: 'city-16' },
    { id: 'dist-16-13', name: 'Orhaneli', cityId: 'city-16' },
    { id: 'dist-16-14', name: 'Orhangazi', cityId: 'city-16' },
    { id: 'dist-16-15', name: 'Osmangazi', cityId: 'city-16' },
    { id: 'dist-16-16', name: 'Yenişehir', cityId: 'city-16' },
    { id: 'dist-16-17', name: 'Yıldırım', cityId: 'city-16' },

    // Antalya (07)
    { id: 'dist-07-01', name: 'Akseki', cityId: 'city-07' },
    { id: 'dist-07-02', name: 'Aksu', cityId: 'city-07' },
    { id: 'dist-07-03', name: 'Alanya', cityId: 'city-07' },
    { id: 'dist-07-04', name: 'Demre', cityId: 'city-07' },
    { id: 'dist-07-05', name: 'Döşemealtı', cityId: 'city-07' },
    { id: 'dist-07-06', name: 'Elmalı', cityId: 'city-07' },
    { id: 'dist-07-07', name: 'Finike', cityId: 'city-07' },
    { id: 'dist-07-08', name: 'Gazipaşa', cityId: 'city-07' },
    { id: 'dist-07-09', name: 'Gündoğmuş', cityId: 'city-07' },
    { id: 'dist-07-10', name: 'İbradı', cityId: 'city-07' },
    { id: 'dist-07-11', name: 'Kaş', cityId: 'city-07' },
    { id: 'dist-07-12', name: 'Kemer', cityId: 'city-07' },
    { id: 'dist-07-13', name: 'Kepez', cityId: 'city-07' },
    { id: 'dist-07-14', name: 'Konyaaltı', cityId: 'city-07' },
    { id: 'dist-07-15', name: 'Korkuteli', cityId: 'city-07' },
    { id: 'dist-07-16', name: 'Kumluca', cityId: 'city-07' },
    { id: 'dist-07-17', name: 'Manavgat', cityId: 'city-07' },
    { id: 'dist-07-18', name: 'Muratpaşa', cityId: 'city-07' },
    { id: 'dist-07-19', name: 'Serik', cityId: 'city-07' },
];

// Helper functions
export const getCityById = (cityId: string): City | undefined => {
    return TURKEY_CITIES.find(city => city.id === cityId);
};

export const getCityByName = (name: string): City | undefined => {
    return TURKEY_CITIES.find(city => city.name.toLowerCase() === name.toLowerCase());
};

export const getDistrictsByCityId = (cityId: string): District[] => {
    return TURKEY_DISTRICTS.filter(district => district.cityId === cityId);
};

export const getDistrictById = (districtId: string): District | undefined => {
    return TURKEY_DISTRICTS.find(district => district.id === districtId);
};

export const getCityOptions = () => {
    return TURKEY_CITIES.map(city => ({
        value: city.id,
        label: city.name,
    }));
};

export const getDistrictOptions = (cityId: string) => {
    return getDistrictsByCityId(cityId).map(district => ({
        value: district.id,
        label: district.name,
    }));
};
