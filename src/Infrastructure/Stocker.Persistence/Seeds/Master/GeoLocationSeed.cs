using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Master.Entities.GeoLocation;
using Stocker.Persistence.Contexts;

namespace Stocker.Persistence.Seeds.Master;

/// <summary>
/// GeoLocation seed data - Countries, Cities (Turkish provinces), and Districts
/// Data source: https://github.com/dr5hn/countries-states-cities-database
/// </summary>
public static class GeoLocationSeed
{
    // Fixed GUIDs for consistency across environments
    private static readonly Guid TurkeyId = new("00000000-0000-0000-0001-000000000225");

    public static async Task SeedAsync(MasterDbContext context)
    {
        if (await context.Countries.AnyAsync())
            return;

        // Seed Turkey
        var turkey = Country.CreateWithId(
            TurkeyId,
            name: "Türkiye",
            nameEn: "Turkey",
            code: "TR",
            code3: "TUR",
            phoneCode: "90",
            currencyCode: "TRY",
            displayOrder: 1);

        await context.Countries.AddAsync(turkey);
        await context.SaveChangesAsync();

        // Seed Turkish Cities (81 provinces)
        var cities = GetTurkishCities(TurkeyId);
        await context.Cities.AddRangeAsync(cities);
        await context.SaveChangesAsync();

        // Seed Districts for major cities
        var districts = GetTurkishDistricts(cities);
        await context.Districts.AddRangeAsync(districts);
        await context.SaveChangesAsync();
    }

    private static List<City> GetTurkishCities(Guid countryId)
    {
        // Turkish provinces with plate codes, regions, and coordinates
        // Data from dr5hn/countries-states-cities-database
        var cityData = new (string Name, string PlateCode, string Region, string AreaCode)[]
        {
            ("Adana", "01", "Akdeniz", "322"),
            ("Adıyaman", "02", "Güneydoğu Anadolu", "416"),
            ("Afyonkarahisar", "03", "Ege", "272"),
            ("Ağrı", "04", "Doğu Anadolu", "472"),
            ("Amasya", "05", "Karadeniz", "358"),
            ("Ankara", "06", "İç Anadolu", "312"),
            ("Antalya", "07", "Akdeniz", "242"),
            ("Artvin", "08", "Karadeniz", "466"),
            ("Aydın", "09", "Ege", "256"),
            ("Balıkesir", "10", "Marmara", "266"),
            ("Bilecik", "11", "Marmara", "228"),
            ("Bingöl", "12", "Doğu Anadolu", "426"),
            ("Bitlis", "13", "Doğu Anadolu", "434"),
            ("Bolu", "14", "Karadeniz", "374"),
            ("Burdur", "15", "Akdeniz", "248"),
            ("Bursa", "16", "Marmara", "224"),
            ("Çanakkale", "17", "Marmara", "286"),
            ("Çankırı", "18", "İç Anadolu", "376"),
            ("Çorum", "19", "Karadeniz", "364"),
            ("Denizli", "20", "Ege", "258"),
            ("Diyarbakır", "21", "Güneydoğu Anadolu", "412"),
            ("Edirne", "22", "Marmara", "284"),
            ("Elazığ", "23", "Doğu Anadolu", "424"),
            ("Erzincan", "24", "Doğu Anadolu", "446"),
            ("Erzurum", "25", "Doğu Anadolu", "442"),
            ("Eskişehir", "26", "İç Anadolu", "222"),
            ("Gaziantep", "27", "Güneydoğu Anadolu", "342"),
            ("Giresun", "28", "Karadeniz", "454"),
            ("Gümüşhane", "29", "Karadeniz", "456"),
            ("Hakkâri", "30", "Doğu Anadolu", "438"),
            ("Hatay", "31", "Akdeniz", "326"),
            ("Isparta", "32", "Akdeniz", "246"),
            ("Mersin", "33", "Akdeniz", "324"),
            ("İstanbul", "34", "Marmara", "212"),
            ("İzmir", "35", "Ege", "232"),
            ("Kars", "36", "Doğu Anadolu", "474"),
            ("Kastamonu", "37", "Karadeniz", "366"),
            ("Kayseri", "38", "İç Anadolu", "352"),
            ("Kırklareli", "39", "Marmara", "288"),
            ("Kırşehir", "40", "İç Anadolu", "386"),
            ("Kocaeli", "41", "Marmara", "262"),
            ("Konya", "42", "İç Anadolu", "332"),
            ("Kütahya", "43", "Ege", "274"),
            ("Malatya", "44", "Doğu Anadolu", "422"),
            ("Manisa", "45", "Ege", "236"),
            ("Kahramanmaraş", "46", "Akdeniz", "344"),
            ("Mardin", "47", "Güneydoğu Anadolu", "482"),
            ("Muğla", "48", "Ege", "252"),
            ("Muş", "49", "Doğu Anadolu", "436"),
            ("Nevşehir", "50", "İç Anadolu", "384"),
            ("Niğde", "51", "İç Anadolu", "388"),
            ("Ordu", "52", "Karadeniz", "452"),
            ("Rize", "53", "Karadeniz", "464"),
            ("Sakarya", "54", "Marmara", "264"),
            ("Samsun", "55", "Karadeniz", "362"),
            ("Siirt", "56", "Güneydoğu Anadolu", "484"),
            ("Sinop", "57", "Karadeniz", "368"),
            ("Sivas", "58", "İç Anadolu", "346"),
            ("Tekirdağ", "59", "Marmara", "282"),
            ("Tokat", "60", "Karadeniz", "356"),
            ("Trabzon", "61", "Karadeniz", "462"),
            ("Tunceli", "62", "Doğu Anadolu", "428"),
            ("Şanlıurfa", "63", "Güneydoğu Anadolu", "414"),
            ("Uşak", "64", "Ege", "276"),
            ("Van", "65", "Doğu Anadolu", "432"),
            ("Yozgat", "66", "İç Anadolu", "354"),
            ("Zonguldak", "67", "Karadeniz", "372"),
            ("Aksaray", "68", "İç Anadolu", "382"),
            ("Bayburt", "69", "Karadeniz", "458"),
            ("Karaman", "70", "İç Anadolu", "338"),
            ("Kırıkkale", "71", "İç Anadolu", "318"),
            ("Batman", "72", "Güneydoğu Anadolu", "488"),
            ("Şırnak", "73", "Güneydoğu Anadolu", "486"),
            ("Bartın", "74", "Karadeniz", "378"),
            ("Ardahan", "75", "Doğu Anadolu", "478"),
            ("Iğdır", "76", "Doğu Anadolu", "476"),
            ("Yalova", "77", "Marmara", "226"),
            ("Karabük", "78", "Karadeniz", "370"),
            ("Kilis", "79", "Güneydoğu Anadolu", "348"),
            ("Osmaniye", "80", "Akdeniz", "328"),
            ("Düzce", "81", "Karadeniz", "380")
        };

        return cityData.Select((c, index) => City.CreateWithId(
            GenerateCityGuid(c.PlateCode),
            countryId,
            c.Name,
            c.PlateCode,
            c.AreaCode,
            c.Region,
            int.Parse(c.PlateCode)
        )).ToList();
    }

    private static List<District> GetTurkishDistricts(List<City> cities)
    {
        var districts = new List<District>();

        // İstanbul districts (39 districts)
        var istanbul = cities.First(c => c.PlateCode == "34");
        var istanbulDistricts = new[]
        {
            ("Adalar", false), ("Arnavutköy", false), ("Ataşehir", false), ("Avcılar", false),
            ("Bağcılar", false), ("Bahçelievler", false), ("Bakırköy", false), ("Başakşehir", false),
            ("Bayrampaşa", false), ("Beşiktaş", false), ("Beykoz", false), ("Beylikdüzü", false),
            ("Beyoğlu", false), ("Büyükçekmece", false), ("Çatalca", false), ("Çekmeköy", false),
            ("Esenler", false), ("Esenyurt", false), ("Eyüpsultan", false), ("Fatih", true),
            ("Gaziosmanpaşa", false), ("Güngören", false), ("Kadıköy", false), ("Kağıthane", false),
            ("Kartal", false), ("Küçükçekmece", false), ("Maltepe", false), ("Pendik", false),
            ("Sancaktepe", false), ("Sarıyer", false), ("Silivri", false), ("Sultanbeyli", false),
            ("Sultangazi", false), ("Şile", false), ("Şişli", false), ("Tuzla", false),
            ("Ümraniye", false), ("Üsküdar", false), ("Zeytinburnu", false)
        };
        districts.AddRange(istanbulDistricts.Select((d, i) =>
            District.CreateWithId(GenerateDistrictGuid("34", i + 1), istanbul.Id, d.Item1, null, d.Item2, i + 1)));

        // Ankara districts (25 districts)
        var ankara = cities.First(c => c.PlateCode == "06");
        var ankaraDistricts = new[]
        {
            ("Akyurt", false), ("Altındağ", false), ("Ayaş", false), ("Balâ", false),
            ("Beypazarı", false), ("Çamlıdere", false), ("Çankaya", true), ("Çubuk", false),
            ("Elmadağ", false), ("Etimesgut", false), ("Evren", false), ("Gölbaşı", false),
            ("Güdül", false), ("Haymana", false), ("Kahramankazan", false), ("Kalecik", false),
            ("Keçiören", false), ("Kızılcahamam", false), ("Mamak", false), ("Nallıhan", false),
            ("Polatlı", false), ("Pursaklar", false), ("Sincan", false), ("Şereflikoçhisar", false),
            ("Yenimahalle", false)
        };
        districts.AddRange(ankaraDistricts.Select((d, i) =>
            District.CreateWithId(GenerateDistrictGuid("06", i + 1), ankara.Id, d.Item1, null, d.Item2, i + 1)));

        // İzmir districts (30 districts)
        var izmir = cities.First(c => c.PlateCode == "35");
        var izmirDistricts = new[]
        {
            ("Aliağa", false), ("Balçova", false), ("Bayındır", false), ("Bayraklı", false),
            ("Bergama", false), ("Beydağ", false), ("Bornova", false), ("Buca", false),
            ("Çeşme", false), ("Çiğli", false), ("Dikili", false), ("Foça", false),
            ("Gaziemir", false), ("Güzelbahçe", false), ("Karabağlar", false), ("Karaburun", false),
            ("Karşıyaka", false), ("Kemalpaşa", false), ("Kınık", false), ("Kiraz", false),
            ("Konak", true), ("Menderes", false), ("Menemen", false), ("Narlıdere", false),
            ("Ödemiş", false), ("Seferihisar", false), ("Selçuk", false), ("Tire", false),
            ("Torbalı", false), ("Urla", false)
        };
        districts.AddRange(izmirDistricts.Select((d, i) =>
            District.CreateWithId(GenerateDistrictGuid("35", i + 1), izmir.Id, d.Item1, null, d.Item2, i + 1)));

        // Bursa districts (17 districts)
        var bursa = cities.First(c => c.PlateCode == "16");
        var bursaDistricts = new[]
        {
            ("Büyükorhan", false), ("Gemlik", false), ("Gürsu", false), ("Harmancık", false),
            ("İnegöl", false), ("İznik", false), ("Karacabey", false), ("Keles", false),
            ("Kestel", false), ("Mudanya", false), ("Mustafakemalpaşa", false), ("Nilüfer", false),
            ("Orhaneli", false), ("Orhangazi", false), ("Osmangazi", true), ("Yenişehir", false),
            ("Yıldırım", false)
        };
        districts.AddRange(bursaDistricts.Select((d, i) =>
            District.CreateWithId(GenerateDistrictGuid("16", i + 1), bursa.Id, d.Item1, null, d.Item2, i + 1)));

        // Antalya districts (19 districts)
        var antalya = cities.First(c => c.PlateCode == "07");
        var antalyaDistricts = new[]
        {
            ("Akseki", false), ("Aksu", false), ("Alanya", false), ("Demre", false),
            ("Döşemealtı", false), ("Elmalı", false), ("Finike", false), ("Gazipaşa", false),
            ("Gündoğmuş", false), ("İbradı", false), ("Kaş", false), ("Kemer", false),
            ("Kepez", false), ("Konyaaltı", false), ("Korkuteli", false), ("Kumluca", false),
            ("Manavgat", false), ("Muratpaşa", true), ("Serik", false)
        };
        districts.AddRange(antalyaDistricts.Select((d, i) =>
            District.CreateWithId(GenerateDistrictGuid("07", i + 1), antalya.Id, d.Item1, null, d.Item2, i + 1)));

        // Konya districts (31 districts)
        var konya = cities.First(c => c.PlateCode == "42");
        var konyaDistricts = new[]
        {
            ("Ahırlı", false), ("Akören", false), ("Akşehir", false), ("Altınekin", false),
            ("Beyşehir", false), ("Bozkır", false), ("Cihanbeyli", false), ("Çeltik", false),
            ("Çumra", false), ("Derbent", false), ("Derebucak", false), ("Doğanhisar", false),
            ("Emirgazi", false), ("Ereğli", false), ("Güneysınır", false), ("Hadim", false),
            ("Halkapınar", false), ("Hüyük", false), ("Ilgın", false), ("Kadınhanı", false),
            ("Karapınar", false), ("Karatay", true), ("Kulu", false), ("Meram", false),
            ("Sarayönü", false), ("Selçuklu", false), ("Seydişehir", false), ("Taşkent", false),
            ("Tuzlukçu", false), ("Yalıhüyük", false), ("Yunak", false)
        };
        districts.AddRange(konyaDistricts.Select((d, i) =>
            District.CreateWithId(GenerateDistrictGuid("42", i + 1), konya.Id, d.Item1, null, d.Item2, i + 1)));

        // Adana districts (15 districts)
        var adana = cities.First(c => c.PlateCode == "01");
        var adanaDistricts = new[]
        {
            ("Aladağ", false), ("Ceyhan", false), ("Çukurova", false), ("Feke", false),
            ("İmamoğlu", false), ("Karaisalı", false), ("Karataş", false), ("Kozan", false),
            ("Pozantı", false), ("Saimbeyli", false), ("Sarıçam", false), ("Seyhan", true),
            ("Tufanbeyli", false), ("Yumurtalık", false), ("Yüreğir", false)
        };
        districts.AddRange(adanaDistricts.Select((d, i) =>
            District.CreateWithId(GenerateDistrictGuid("01", i + 1), adana.Id, d.Item1, null, d.Item2, i + 1)));

        // Gaziantep districts (9 districts)
        var gaziantep = cities.First(c => c.PlateCode == "27");
        var gaziantepDistricts = new[]
        {
            ("Araban", false), ("İslahiye", false), ("Karkamış", false), ("Nizip", false),
            ("Nurdağı", false), ("Oğuzeli", false), ("Şahinbey", true), ("Şehitkamil", false),
            ("Yavuzeli", false)
        };
        districts.AddRange(gaziantepDistricts.Select((d, i) =>
            District.CreateWithId(GenerateDistrictGuid("27", i + 1), gaziantep.Id, d.Item1, null, d.Item2, i + 1)));

        // Kocaeli districts (12 districts)
        var kocaeli = cities.First(c => c.PlateCode == "41");
        var kocaeliDistricts = new[]
        {
            ("Başiskele", false), ("Çayırova", false), ("Darıca", false), ("Derince", false),
            ("Dilovası", false), ("Gebze", false), ("Gölcük", false), ("İzmit", true),
            ("Kandıra", false), ("Karamürsel", false), ("Kartepe", false), ("Körfez", false)
        };
        districts.AddRange(kocaeliDistricts.Select((d, i) =>
            District.CreateWithId(GenerateDistrictGuid("41", i + 1), kocaeli.Id, d.Item1, null, d.Item2, i + 1)));

        // Mersin districts (13 districts)
        var mersin = cities.First(c => c.PlateCode == "33");
        var mersinDistricts = new[]
        {
            ("Akdeniz", true), ("Anamur", false), ("Aydıncık", false), ("Bozyazı", false),
            ("Çamlıyayla", false), ("Erdemli", false), ("Gülnar", false), ("Mezitli", false),
            ("Mut", false), ("Silifke", false), ("Tarsus", false), ("Toroslar", false),
            ("Yenişehir", false)
        };
        districts.AddRange(mersinDistricts.Select((d, i) =>
            District.CreateWithId(GenerateDistrictGuid("33", i + 1), mersin.Id, d.Item1, null, d.Item2, i + 1)));

        // Kayseri districts (16 districts)
        var kayseri = cities.First(c => c.PlateCode == "38");
        var kayseriDistricts = new[]
        {
            ("Akkışla", false), ("Bünyan", false), ("Develi", false), ("Felahiye", false),
            ("Hacılar", false), ("İncesu", false), ("Kocasinan", true), ("Melikgazi", false),
            ("Özvatan", false), ("Pınarbaşı", false), ("Sarıoğlan", false), ("Sarız", false),
            ("Talas", false), ("Tomarza", false), ("Yahyalı", false), ("Yeşilhisar", false)
        };
        districts.AddRange(kayseriDistricts.Select((d, i) =>
            District.CreateWithId(GenerateDistrictGuid("38", i + 1), kayseri.Id, d.Item1, null, d.Item2, i + 1)));

        // Eskişehir districts (14 districts)
        var eskisehir = cities.First(c => c.PlateCode == "26");
        var eskisehirDistricts = new[]
        {
            ("Alpu", false), ("Beylikova", false), ("Çifteler", false), ("Günyüzü", false),
            ("Han", false), ("İnönü", false), ("Mahmudiye", false), ("Mihalgazi", false),
            ("Mihalıççık", false), ("Odunpazarı", true), ("Sarıcakaya", false), ("Seyitgazi", false),
            ("Sivrihisar", false), ("Tepebaşı", false)
        };
        districts.AddRange(eskisehirDistricts.Select((d, i) =>
            District.CreateWithId(GenerateDistrictGuid("26", i + 1), eskisehir.Id, d.Item1, null, d.Item2, i + 1)));

        // Diyarbakır districts (17 districts)
        var diyarbakir = cities.First(c => c.PlateCode == "21");
        var diyarbakirDistricts = new[]
        {
            ("Bağlar", false), ("Bismil", false), ("Çermik", false), ("Çınar", false),
            ("Çüngüş", false), ("Dicle", false), ("Eğil", false), ("Ergani", false),
            ("Hani", false), ("Hazro", false), ("Kayapınar", false), ("Kocaköy", false),
            ("Kulp", false), ("Lice", false), ("Silvan", false), ("Sur", true),
            ("Yenişehir", false)
        };
        districts.AddRange(diyarbakirDistricts.Select((d, i) =>
            District.CreateWithId(GenerateDistrictGuid("21", i + 1), diyarbakir.Id, d.Item1, null, d.Item2, i + 1)));

        // Samsun districts (17 districts)
        var samsun = cities.First(c => c.PlateCode == "55");
        var samsunDistricts = new[]
        {
            ("Alaçam", false), ("Asarcık", false), ("Atakum", false), ("Ayvacık", false),
            ("Bafra", false), ("Canik", false), ("Çarşamba", false), ("Havza", false),
            ("İlkadım", true), ("Kavak", false), ("Ladik", false), ("Ondokuzmayıs", false),
            ("Salıpazarı", false), ("Tekkeköy", false), ("Terme", false), ("Vezirköprü", false),
            ("Yakakent", false)
        };
        districts.AddRange(samsunDistricts.Select((d, i) =>
            District.CreateWithId(GenerateDistrictGuid("55", i + 1), samsun.Id, d.Item1, null, d.Item2, i + 1)));

        // Denizli districts (19 districts)
        var denizli = cities.First(c => c.PlateCode == "20");
        var denizliDistricts = new[]
        {
            ("Acıpayam", false), ("Babadağ", false), ("Baklan", false), ("Bekilli", false),
            ("Beyağaç", false), ("Bozkurt", false), ("Buldan", false), ("Çal", false),
            ("Çameli", false), ("Çardak", false), ("Çivril", false), ("Güney", false),
            ("Honaz", false), ("Kale", false), ("Merkezefendi", true), ("Pamukkale", false),
            ("Sarayköy", false), ("Serinhisar", false), ("Tavas", false)
        };
        districts.AddRange(denizliDistricts.Select((d, i) =>
            District.CreateWithId(GenerateDistrictGuid("20", i + 1), denizli.Id, d.Item1, null, d.Item2, i + 1)));

        // Şanlıurfa districts (13 districts)
        var sanliurfa = cities.First(c => c.PlateCode == "63");
        var sanliurfaDistricts = new[]
        {
            ("Akçakale", false), ("Birecik", false), ("Bozova", false), ("Ceylanpınar", false),
            ("Eyyübiye", true), ("Halfeti", false), ("Haliliye", false), ("Harran", false),
            ("Hilvan", false), ("Karaköprü", false), ("Siverek", false), ("Suruç", false),
            ("Viranşehir", false)
        };
        districts.AddRange(sanliurfaDistricts.Select((d, i) =>
            District.CreateWithId(GenerateDistrictGuid("63", i + 1), sanliurfa.Id, d.Item1, null, d.Item2, i + 1)));

        // Trabzon districts (18 districts)
        var trabzon = cities.First(c => c.PlateCode == "61");
        var trabzonDistricts = new[]
        {
            ("Akçaabat", false), ("Araklı", false), ("Arsin", false), ("Beşikdüzü", false),
            ("Çarşıbaşı", false), ("Çaykara", false), ("Dernekpazarı", false), ("Düzköy", false),
            ("Hayrat", false), ("Köprübaşı", false), ("Maçka", false), ("Of", false),
            ("Ortahisar", true), ("Sürmene", false), ("Şalpazarı", false), ("Tonya", false),
            ("Vakfıkebir", false), ("Yomra", false)
        };
        districts.AddRange(trabzonDistricts.Select((d, i) =>
            District.CreateWithId(GenerateDistrictGuid("61", i + 1), trabzon.Id, d.Item1, null, d.Item2, i + 1)));

        return districts;
    }

    /// <summary>
    /// Generate consistent GUID for cities based on plate code
    /// Format: 00000000-0000-0000-0002-0000000000XX (XX = plate code)
    /// </summary>
    private static Guid GenerateCityGuid(string plateCode)
    {
        var paddedCode = plateCode.PadLeft(4, '0');
        return new Guid($"00000000-0000-0000-0002-0000000{paddedCode}");
    }

    /// <summary>
    /// Generate consistent GUID for districts
    /// Format: 00000000-0000-0000-0003-00XXYYYYYYYY (XX = plate code, YY = district index)
    /// </summary>
    private static Guid GenerateDistrictGuid(string plateCode, int districtIndex)
    {
        var paddedPlate = plateCode.PadLeft(2, '0');
        var paddedIndex = districtIndex.ToString().PadLeft(4, '0');
        return new Guid($"00000000-0000-0000-0003-00{paddedPlate}0000{paddedIndex}");
    }
}
