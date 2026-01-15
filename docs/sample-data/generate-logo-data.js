// Logo ERP formatında gerçekçi test verisi üreteci
// Node.js ile çalıştır: node generate-logo-data.js

const fs = require('fs');

// Ürün kategorileri ve alt kategorileri
const productCategories = {
  'BILGISAYAR': {
    subcategories: ['LAPTOP', 'MASAUSTU', 'ALL-IN-ONE', 'MINI-PC', 'WORKSTATION'],
    brands: ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Apple', 'Monster', 'Casper', 'Huawei'],
    priceRange: [15000, 150000]
  },
  'TELEFON': {
    subcategories: ['AKILLI-TELEFON', 'TABLET', 'AKSESUAR'],
    brands: ['Samsung', 'Apple', 'Xiaomi', 'Oppo', 'Huawei', 'OnePlus', 'Google', 'Realme', 'Vivo', 'Honor'],
    priceRange: [5000, 80000]
  },
  'MONITOR': {
    subcategories: ['GAMING', 'PROFESYONEL', 'OFIS', 'ULTRAWIDE', 'CURVED'],
    brands: ['Samsung', 'LG', 'Dell', 'Asus', 'BenQ', 'AOC', 'Philips', 'ViewSonic', 'MSI', 'Acer'],
    priceRange: [3000, 50000]
  },
  'YAZICI': {
    subcategories: ['LAZER', 'INKJET', 'COKFONKSIYONLU', 'ETIKET', 'FOTO'],
    brands: ['HP', 'Canon', 'Epson', 'Brother', 'Xerox', 'Samsung', 'Kyocera', 'Lexmark'],
    priceRange: [2000, 30000]
  },
  'NETWORK': {
    subcategories: ['ROUTER', 'SWITCH', 'ACCESS-POINT', 'MODEM', 'KABLO'],
    brands: ['TP-Link', 'Asus', 'Netgear', 'D-Link', 'Ubiquiti', 'Cisco', 'MikroTik', 'Huawei'],
    priceRange: [500, 15000]
  },
  'DEPOLAMA': {
    subcategories: ['SSD', 'HDD', 'NAS', 'USB-BELLEK', 'HAFIZA-KARTI'],
    brands: ['Samsung', 'Western Digital', 'Seagate', 'Kingston', 'Crucial', 'SanDisk', 'Toshiba', 'Synology'],
    priceRange: [300, 20000]
  },
  'RAM': {
    subcategories: ['DDR4', 'DDR5', 'LAPTOP-RAM', 'SERVER-RAM'],
    brands: ['Kingston', 'Corsair', 'G.Skill', 'Crucial', 'TeamGroup', 'Patriot', 'ADATA', 'HyperX'],
    priceRange: [800, 15000]
  },
  'EKRAN-KARTI': {
    subcategories: ['GAMING', 'PROFESYONEL', 'ENTRY-LEVEL'],
    brands: ['Nvidia', 'AMD', 'Asus', 'MSI', 'Gigabyte', 'EVGA', 'Zotac', 'Sapphire', 'XFX', 'Palit'],
    priceRange: [3000, 80000]
  },
  'ANAKART': {
    subcategories: ['INTEL', 'AMD', 'SERVER'],
    brands: ['Asus', 'MSI', 'Gigabyte', 'ASRock', 'Biostar', 'EVGA'],
    priceRange: [2000, 25000]
  },
  'ISLEMCI': {
    subcategories: ['INTEL-CORE', 'AMD-RYZEN', 'SERVER'],
    brands: ['Intel', 'AMD'],
    priceRange: [3000, 40000]
  },
  'KASA': {
    subcategories: ['MID-TOWER', 'FULL-TOWER', 'MINI-ITX', 'MICRO-ATX'],
    brands: ['Corsair', 'NZXT', 'Fractal Design', 'Lian Li', 'be quiet!', 'Cooler Master', 'Thermaltake', 'Phanteks'],
    priceRange: [1000, 15000]
  },
  'SOGUTUCU': {
    subcategories: ['HAVA', 'SIVI', 'TERMAL-MACUN'],
    brands: ['Noctua', 'Corsair', 'NZXT', 'be quiet!', 'Cooler Master', 'Arctic', 'DeepCool', 'Thermaltake'],
    priceRange: [200, 8000]
  },
  'GUC-KAYNAGI': {
    subcategories: ['MODULAR', 'SEMI-MODULAR', 'NON-MODULAR'],
    brands: ['Corsair', 'Seasonic', 'EVGA', 'be quiet!', 'Cooler Master', 'Thermaltake', 'FSP', 'Silverstone'],
    priceRange: [1000, 12000]
  },
  'KLAVYE': {
    subcategories: ['MEKANIK', 'MEMBRANE', 'WIRELESS', 'GAMING'],
    brands: ['Logitech', 'Razer', 'Corsair', 'SteelSeries', 'HyperX', 'Asus ROG', 'Ducky', 'Keychron'],
    priceRange: [200, 8000]
  },
  'MOUSE': {
    subcategories: ['GAMING', 'OFIS', 'ERGONOMIK', 'WIRELESS'],
    brands: ['Logitech', 'Razer', 'Corsair', 'SteelSeries', 'Zowie', 'Pulsar', 'Glorious', 'Endgame Gear'],
    priceRange: [150, 5000]
  },
  'KULAKLIK': {
    subcategories: ['GAMING', 'WIRELESS', 'IN-EAR', 'OVER-EAR', 'STÜDYO'],
    brands: ['Sony', 'Bose', 'Apple', 'Samsung', 'JBL', 'Sennheiser', 'Audio-Technica', 'Razer', 'SteelSeries', 'HyperX'],
    priceRange: [300, 15000]
  },
  'KAMERA': {
    subcategories: ['WEBCAM', 'GUVENLIK', 'AKSIYON', 'DSLR'],
    brands: ['Logitech', 'Razer', 'Elgato', 'GoPro', 'Canon', 'Sony', 'Hikvision', 'Dahua'],
    priceRange: [500, 50000]
  },
  'PROJEKTOR': {
    subcategories: ['OFIS', 'EV-SINEMA', 'TASINABILIR', 'LAZER'],
    brands: ['Epson', 'BenQ', 'Optoma', 'ViewSonic', 'Sony', 'LG', 'Samsung', 'Acer'],
    priceRange: [5000, 80000]
  },
  'UPS': {
    subcategories: ['LINE-INTERACTIVE', 'ONLINE', 'OFFLINE'],
    brands: ['APC', 'Eaton', 'CyberPower', 'Vertiv', 'FSP', 'Legrand', 'Inform'],
    priceRange: [1500, 30000]
  },
  'YAZILIM': {
    subcategories: ['ISLETIM-SISTEMI', 'OFIS', 'GUVENLIK', 'TASARIM'],
    brands: ['Microsoft', 'Adobe', 'Kaspersky', 'Norton', 'ESET', 'Autodesk', 'Corel'],
    priceRange: [500, 25000]
  }
};

// Ürün modelleri ve açıklamaları için şablonlar
const productTemplates = {
  'BILGISAYAR': {
    'LAPTOP': [
      { name: '{brand} {series} {inch}" {cpu} {ram}GB {storage}', desc: '{brand} {series} Notebook, {inch} inç Ekran, {cpu} İşlemci, {ram}GB RAM, {storage} SSD' },
    ],
    'MASAUSTU': [
      { name: '{brand} {series} Desktop {cpu} {ram}GB', desc: '{brand} {series} Masaüstü Bilgisayar, {cpu} İşlemci, {ram}GB RAM, {storage} SSD' },
    ]
  }
};

const laptopSeries = ['Inspiron', 'XPS', 'Latitude', 'Vostro', 'Pavilion', 'Envy', 'EliteBook', 'ProBook', 'ThinkPad', 'IdeaPad', 'Legion', 'ROG', 'TUF', 'Vivobook', 'Zenbook', 'Nitro', 'Swift', 'Predator', 'MacBook Air', 'MacBook Pro', 'Abra', 'Tulpar', 'Excalibur', 'Nirvana', 'MateBook'];
const cpuModels = ['i3-12100', 'i5-12400', 'i5-13400', 'i7-12700', 'i7-13700', 'i9-13900', 'i5-12500H', 'i7-12700H', 'i9-12900H', 'Ryzen 5 5600', 'Ryzen 5 7600', 'Ryzen 7 5800', 'Ryzen 7 7700', 'Ryzen 9 7900', 'M1', 'M2', 'M3', 'M3 Pro', 'M3 Max'];
const ramSizes = [8, 16, 32, 64];
const storageSizes = ['256GB', '512GB', '1TB', '2TB'];
const screenSizes = [13, 14, 15.6, 16, 17.3];

const monitorSizes = [24, 27, 32, 34, 49];
const monitorResolutions = ['FHD', 'QHD', '4K', 'WQHD'];
const refreshRates = [60, 75, 144, 165, 240, 360];

const ssdCapacities = ['256GB', '512GB', '1TB', '2TB', '4TB'];
const hddCapacities = ['1TB', '2TB', '4TB', '8TB', '12TB', '16TB'];
const ramCapacities = ['8GB', '16GB', '32GB', '64GB', '128GB'];

const gpuModels = ['RTX 4060', 'RTX 4070', 'RTX 4070 Ti', 'RTX 4080', 'RTX 4090', 'RTX 3060', 'RTX 3070', 'RTX 3080', 'RX 7600', 'RX 7700 XT', 'RX 7800 XT', 'RX 7900 XT', 'RX 7900 XTX'];

// Yardımcı fonksiyonlar
function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice(min, max) {
  const price = Math.floor(Math.random() * (max - min) + min);
  return Math.round(price / 100) * 100; // 100'e yuvarla
}

function generateBarcode() {
  return '869' + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
}

function generateProductCode(category, subcategory, index) {
  const catCode = category.substring(0, 3).toUpperCase();
  const subCode = subcategory.substring(0, 2).toUpperCase();
  return `${catCode}-${subCode}-${String(index).padStart(4, '0')}`;
}

// Ürün üreteci
function generateProducts(count) {
  const products = [];
  let index = 1;

  const categories = Object.keys(productCategories);

  while (products.length < count) {
    const category = randomElement(categories);
    const catData = productCategories[category];
    const subcategory = randomElement(catData.subcategories);
    const brand = randomElement(catData.brands);

    let productName = '';
    let description = '';

    // Kategori bazlı ürün oluşturma
    switch (category) {
      case 'BILGISAYAR':
        const series = randomElement(laptopSeries);
        const cpu = randomElement(cpuModels);
        const ram = randomElement(ramSizes);
        const storage = randomElement(storageSizes);
        const inch = randomElement(screenSizes);
        productName = `${brand} ${series} ${inch}" ${cpu} ${ram}GB ${storage}`;
        description = `${brand} ${series} Notebook, ${inch} inç Full HD Ekran, ${cpu} İşlemci, ${ram}GB DDR4 RAM, ${storage} NVMe SSD, Windows 11`;
        break;

      case 'MONITOR':
        const monSize = randomElement(monitorSizes);
        const res = randomElement(monitorResolutions);
        const hz = randomElement(refreshRates);
        productName = `${brand} ${monSize}" ${res} ${hz}Hz Monitor`;
        description = `${brand} ${monSize} inç ${res} ${hz}Hz Gaming/Profesyonel Monitor, IPS Panel, 1ms Tepki Süresi`;
        break;

      case 'DEPOLAMA':
        if (subcategory === 'SSD') {
          const cap = randomElement(ssdCapacities);
          productName = `${brand} ${cap} NVMe SSD`;
          description = `${brand} ${cap} M.2 NVMe PCIe 4.0 SSD, 7000MB/s Okuma, 5000MB/s Yazma`;
        } else if (subcategory === 'HDD') {
          const cap = randomElement(hddCapacities);
          productName = `${brand} ${cap} HDD 7200RPM`;
          description = `${brand} ${cap} 3.5" SATA HDD, 7200RPM, 256MB Cache`;
        } else {
          const cap = randomElement(ssdCapacities);
          productName = `${brand} ${cap} ${subcategory}`;
          description = `${brand} ${cap} ${subcategory} Depolama Ünitesi`;
        }
        break;

      case 'RAM':
        const ramCap = randomElement(ramCapacities);
        const ddrType = subcategory.includes('DDR5') ? 'DDR5' : 'DDR4';
        const speed = ddrType === 'DDR5' ? randomElement([5200, 5600, 6000, 6400]) : randomElement([3200, 3600, 4000]);
        productName = `${brand} ${ramCap} ${ddrType}-${speed}`;
        description = `${brand} ${ramCap} ${ddrType} ${speed}MHz RAM, CL16, RGB Aydınlatma`;
        break;

      case 'EKRAN-KARTI':
        const gpu = randomElement(gpuModels);
        const vram = gpu.includes('4090') ? '24GB' : gpu.includes('4080') ? '16GB' : gpu.includes('4070') ? '12GB' : '8GB';
        productName = `${brand} ${gpu} ${vram}`;
        description = `${brand} ${gpu} ${vram} GDDR6X Ekran Kartı, Triple Fan, RGB`;
        break;

      case 'TELEFON':
        const phoneSeries = ['Galaxy S24', 'Galaxy A54', 'Galaxy Z Fold5', 'iPhone 15', 'iPhone 15 Pro', 'Redmi Note 13', 'POCO X6', 'Reno 11', 'P60 Pro', 'Nord 3'];
        const phoneModel = randomElement(phoneSeries);
        const phoneStorage = randomElement(['128GB', '256GB', '512GB', '1TB']);
        productName = `${brand} ${phoneModel} ${phoneStorage}`;
        description = `${brand} ${phoneModel} ${phoneStorage} Akıllı Telefon, 5G, Çift SIM`;
        break;

      case 'KLAVYE':
        const switchType = randomElement(['Red', 'Blue', 'Brown', 'Silent Red', 'Speed Silver']);
        const layout = randomElement(['TR-Q', 'US', 'Türkçe Q']);
        productName = `${brand} ${subcategory} Klavye ${switchType}`;
        description = `${brand} ${subcategory} Mekanik Klavye, ${switchType} Switch, ${layout} Layout, RGB`;
        break;

      case 'MOUSE':
        const dpi = randomElement([12000, 16000, 20000, 25000]);
        const weight = randomElement([60, 70, 80, 90, 100]);
        productName = `${brand} ${subcategory} Mouse ${dpi}DPI`;
        description = `${brand} ${subcategory} Gaming Mouse, ${dpi} DPI, ${weight}g, RGB`;
        break;

      case 'KULAKLIK':
        const driver = randomElement(['40mm', '50mm', '53mm']);
        const feature = randomElement(['ANC', 'Wireless', 'Hi-Res', '7.1 Surround']);
        productName = `${brand} ${subcategory} Kulaklık ${feature}`;
        description = `${brand} ${subcategory} Kulaklık, ${driver} Driver, ${feature}, Mikrofon`;
        break;

      case 'YAZICI':
        const ppm = randomElement([20, 25, 30, 35, 40]);
        productName = `${brand} ${subcategory} Yazıcı ${ppm}ppm`;
        description = `${brand} ${subcategory} Yazıcı, ${ppm} Sayfa/Dakika, Duplex, WiFi`;
        break;

      case 'NETWORK':
        const netSpeed = randomElement(['AC1200', 'AX1800', 'AX3000', 'AX5400', 'AX6000']);
        productName = `${brand} ${subcategory} ${netSpeed}`;
        description = `${brand} ${subcategory} ${netSpeed}, WiFi 6, Gigabit, MU-MIMO`;
        break;

      default:
        productName = `${brand} ${subcategory} Ürün`;
        description = `${brand} ${subcategory} - Yüksek Kalite Ürün`;
    }

    const salePrice = randomPrice(catData.priceRange[0], catData.priceRange[1]);
    const purchasePrice = Math.round(salePrice * (0.65 + Math.random() * 0.15)); // %65-80 arası maliyet

    products.push({
      StokKodu: generateProductCode(category, subcategory, index),
      StokAdi: productName,
      Aciklama: description,
      Barkod: generateBarcode(),
      BirimKodu: 'ADET',
      Grup1: category,
      Grup2: subcategory,
      KdvOrani: 20,
      SatisFiyati: salePrice,
      AlisFiyati: purchasePrice,
      ParaBirimi: 'TRY',
      MinStok: Math.floor(Math.random() * 10) + 1,
      MaxStok: Math.floor(Math.random() * 100) + 20,
      Durum: 'Aktif'
    });

    index++;
  }

  return products;
}

// Müşteri üreteci
const cities = [
  { name: 'İstanbul', districts: ['Kadıköy', 'Beşiktaş', 'Şişli', 'Ümraniye', 'Ataşehir', 'Maltepe', 'Kartal', 'Pendik', 'Bakırköy', 'Beylikdüzü', 'Sarıyer', 'Beykoz', 'Üsküdar', 'Fatih', 'Beyoğlu'], code: '34' },
  { name: 'Ankara', districts: ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut', 'Sincan', 'Altındağ', 'Pursaklar'], code: '06' },
  { name: 'İzmir', districts: ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Bayraklı', 'Çiğli', 'Gaziemir', 'Balçova'], code: '35' },
  { name: 'Bursa', districts: ['Nilüfer', 'Osmangazi', 'Yıldırım', 'Mudanya', 'Gemlik', 'İnegöl'], code: '16' },
  { name: 'Antalya', districts: ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Aksu', 'Döşemealtı', 'Alanya'], code: '07' },
  { name: 'Adana', districts: ['Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam', 'Ceyhan'], code: '01' },
  { name: 'Konya', districts: ['Selçuklu', 'Meram', 'Karatay', 'Beyşehir', 'Ereğli'], code: '42' },
  { name: 'Gaziantep', districts: ['Şahinbey', 'Şehitkamil', 'Oğuzeli', 'Nizip'], code: '27' },
  { name: 'Kocaeli', districts: ['İzmit', 'Gebze', 'Darıca', 'Körfez', 'Derince'], code: '41' },
  { name: 'Mersin', districts: ['Yenişehir', 'Mezitli', 'Akdeniz', 'Toroslar', 'Tarsus'], code: '33' },
  { name: 'Kayseri', districts: ['Melikgazi', 'Kocasinan', 'Talas', 'Develi'], code: '38' },
  { name: 'Eskişehir', districts: ['Tepebaşı', 'Odunpazarı', 'Sivrihisar'], code: '26' },
  { name: 'Trabzon', districts: ['Ortahisar', 'Akçaabat', 'Yomra', 'Arsin'], code: '61' },
  { name: 'Samsun', districts: ['Atakum', 'İlkadım', 'Canik', 'Tekkeköy'], code: '55' },
  { name: 'Denizli', districts: ['Pamukkale', 'Merkezefendi', 'Çivril'], code: '20' }
];

const companyTypes = ['Ltd. Şti.', 'A.Ş.', 'Tic. Ltd. Şti.', 'San. Tic. Ltd. Şti.', 'San. ve Tic. A.Ş.'];
const businessTypes = ['Teknoloji', 'Bilişim', 'Elektronik', 'Yazılım', 'Otomasyon', 'Sistem', 'Network', 'Donanım', 'Çözümler', 'Dijital', 'Veri', 'Güvenlik', 'İletişim', 'Medya', 'Danışmanlık'];
const firstNames = ['Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hüseyin', 'Hasan', 'İbrahim', 'Osman', 'Yusuf', 'Ömer', 'Fatma', 'Ayşe', 'Zeynep', 'Elif', 'Merve', 'Esra', 'Emine', 'Hatice', 'Sema', 'Sibel', 'Burak', 'Emre', 'Cem', 'Kemal', 'Serkan', 'Tolga', 'Baran', 'Kaan', 'Arda', 'Ege'];
const lastNames = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Öztürk', 'Aydın', 'Arslan', 'Koç', 'Kurt', 'Özdemir', 'Aslan', 'Doğan', 'Kılıç', 'Yıldız', 'Yıldırım', 'Özer', 'Çetin', 'Aksoy', 'Korkmaz', 'Erdoğan', 'Özkan', 'Şimşek', 'Polat', 'Aktaş'];
const streets = ['Atatürk Cad.', 'Cumhuriyet Cad.', 'İstiklal Cad.', 'Fevzi Çakmak Cad.', 'Gazi Cad.', 'Millet Cad.', 'Vatan Cad.', 'Hürriyet Cad.', 'Zafer Cad.', 'Barış Cad.', 'Demokrasi Cad.', 'Özgürlük Cad.'];
const streetTypes = ['Mah.', 'Sok.', 'Blv.'];

function generateCustomers(count) {
  const customers = [];

  for (let i = 1; i <= count; i++) {
    const city = randomElement(cities);
    const district = randomElement(city.districts);
    const companyName = `${randomElement(businessTypes)} ${randomElement(businessTypes)} ${randomElement(companyTypes)}`;
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const streetName = randomElement(streets);
    const buildingNo = Math.floor(Math.random() * 200) + 1;

    const taxNo = String(Math.floor(Math.random() * 9000000000) + 1000000000);
    const phone = `0${city.code === '34' ? '212' : city.code === '06' ? '312' : city.code === '35' ? '232' : city.code.substring(0,1) + '4' + city.code.substring(1)}${String(Math.floor(Math.random() * 9000000) + 1000000)}`;
    const mobile = `05${Math.floor(Math.random() * 90) + 10}${String(Math.floor(Math.random() * 9000000) + 1000000)}`;

    const emailDomain = companyName.toLowerCase()
      .replace(/[ıİ]/g, 'i')
      .replace(/[öÖ]/g, 'o')
      .replace(/[üÜ]/g, 'u')
      .replace(/[şŞ]/g, 's')
      .replace(/[çÇ]/g, 'c')
      .replace(/[ğĞ]/g, 'g')
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15);

    customers.push({
      CariKodu: `120.01.${String(i).padStart(4, '0')}`,
      CariUnvani: companyName,
      VergiNo: taxNo,
      VergiDairesi: district,
      Telefon: phone,
      Eposta: `info@${emailDomain}.com.tr`,
      Adres: `${district} ${randomElement(streetTypes)} ${streetName} No:${buildingNo}`,
      Sehir: city.name,
      Ilce: district,
      PostaKodu: `${city.code}${String(Math.floor(Math.random() * 900) + 100)}`,
      Ulke: 'Türkiye',
      YetkiliAdi: `${firstName} ${lastName}`,
      YetkiliTelefon: mobile,
      CariTip: 'Müşteri',
      Durum: 'Aktif'
    });
  }

  return customers;
}

// Verileri oluştur
console.log('Ürün verileri oluşturuluyor...');
const products = generateProducts(1000);

console.log('Müşteri verileri oluşturuluyor...');
const customers = generateCustomers(500);

// JSON dosyalarına kaydet
const productOutput = {
  sourceType: 'Logo',
  sourceName: 'Logo Tiger 3',
  entityType: 'Product',
  generatedAt: new Date().toISOString(),
  totalRecords: products.length,
  data: products
};

const customerOutput = {
  sourceType: 'Logo',
  sourceName: 'Logo Tiger 3',
  entityType: 'Customer',
  generatedAt: new Date().toISOString(),
  totalRecords: customers.length,
  data: customers
};

fs.writeFileSync('logo-products-1000.json', JSON.stringify(productOutput, null, 2), 'utf8');
fs.writeFileSync('logo-customers-500.json', JSON.stringify(customerOutput, null, 2), 'utf8');

console.log(`✅ ${products.length} ürün kaydedildi: logo-products-1000.json`);
console.log(`✅ ${customers.length} müşteri kaydedildi: logo-customers-500.json`);

// Örnek verileri göster
console.log('\n--- Örnek Ürünler ---');
products.slice(0, 5).forEach(p => console.log(`${p.StokKodu}: ${p.StokAdi} - ${p.SatisFiyati} TRY`));

console.log('\n--- Örnek Müşteriler ---');
customers.slice(0, 5).forEach(c => console.log(`${c.CariKodu}: ${c.CariUnvani} - ${c.Sehir}`));
