using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Master.Entities.GeoLocation;
using Stocker.Persistence.Contexts;

namespace Stocker.Persistence.Seeds.Master;

/// <summary>
/// GeoLocation seed data - All World Countries + States/Cities
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

        // Seed all world countries
        var countries = GetAllCountries();
        await context.Countries.AddRangeAsync(countries);
        await context.SaveChangesAsync();

        // Seed cities for all countries
        var allCities = new List<City>();

        // Turkish Cities (81 provinces with detailed data)
        allCities.AddRange(GetTurkishCities(TurkeyId));

        // International Cities/States
        allCities.AddRange(GetInternationalCities(countries));

        await context.Cities.AddRangeAsync(allCities);
        await context.SaveChangesAsync();

        // Seed Districts for major Turkish cities
        var turkishCities = allCities.Where(c => c.CountryId == TurkeyId).ToList();
        var districts = GetTurkishDistricts(turkishCities);
        await context.Districts.AddRangeAsync(districts);
        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Get all 250 world countries from dr5hn/countries-states-cities-database
    /// </summary>
    private static List<Country> GetAllCountries()
    {
        // Format: (Name, NameEn, Code, Code3, PhoneCode, CurrencyCode)
        var countryData = new (string Name, string NameEn, string Code, string Code3, string PhoneCode, string CurrencyCode)[]
        {
            ("Afganistan", "Afghanistan", "AF", "AFG", "93", "AFN"),
            ("Aland Adaları", "Aland Islands", "AX", "ALA", "358", "EUR"),
            ("Arnavutluk", "Albania", "AL", "ALB", "355", "ALL"),
            ("Cezayir", "Algeria", "DZ", "DZA", "213", "DZD"),
            ("Amerikan Samoası", "American Samoa", "AS", "ASM", "1", "USD"),
            ("Andorra", "Andorra", "AD", "AND", "376", "EUR"),
            ("Angola", "Angola", "AO", "AGO", "244", "AOA"),
            ("Anguilla", "Anguilla", "AI", "AIA", "1", "XCD"),
            ("Antarktika", "Antarctica", "AQ", "ATA", "672", "AAD"),
            ("Antigua ve Barbuda", "Antigua and Barbuda", "AG", "ATG", "1", "XCD"),
            ("Arjantin", "Argentina", "AR", "ARG", "54", "ARS"),
            ("Ermenistan", "Armenia", "AM", "ARM", "374", "AMD"),
            ("Aruba", "Aruba", "AW", "ABW", "297", "AWG"),
            ("Avustralya", "Australia", "AU", "AUS", "61", "AUD"),
            ("Avusturya", "Austria", "AT", "AUT", "43", "EUR"),
            ("Azerbaycan", "Azerbaijan", "AZ", "AZE", "994", "AZN"),
            ("Bahreyn", "Bahrain", "BH", "BHR", "973", "BHD"),
            ("Bangladeş", "Bangladesh", "BD", "BGD", "880", "BDT"),
            ("Barbados", "Barbados", "BB", "BRB", "1", "BBD"),
            ("Belarus", "Belarus", "BY", "BLR", "375", "BYN"),
            ("Belçika", "Belgium", "BE", "BEL", "32", "EUR"),
            ("Belize", "Belize", "BZ", "BLZ", "501", "BZD"),
            ("Benin", "Benin", "BJ", "BEN", "229", "XOF"),
            ("Bermuda", "Bermuda", "BM", "BMU", "1", "BMD"),
            ("Bhutan", "Bhutan", "BT", "BTN", "975", "BTN"),
            ("Bolivya", "Bolivia", "BO", "BOL", "591", "BOB"),
            ("Bonaire, Sint Eustatius ve Saba", "Bonaire, Sint Eustatius and Saba", "BQ", "BES", "599", "USD"),
            ("Bosna Hersek", "Bosnia and Herzegovina", "BA", "BIH", "387", "BAM"),
            ("Botsvana", "Botswana", "BW", "BWA", "267", "BWP"),
            ("Bouvet Adası", "Bouvet Island", "BV", "BVT", "55", "NOK"),
            ("Brezilya", "Brazil", "BR", "BRA", "55", "BRL"),
            ("Britanya Hint Okyanusu Toprakları", "British Indian Ocean Territory", "IO", "IOT", "246", "USD"),
            ("Brunei", "Brunei", "BN", "BRN", "673", "BND"),
            ("Bulgaristan", "Bulgaria", "BG", "BGR", "359", "BGN"),
            ("Burkina Faso", "Burkina Faso", "BF", "BFA", "226", "XOF"),
            ("Burundi", "Burundi", "BI", "BDI", "257", "BIF"),
            ("Kamboçya", "Cambodia", "KH", "KHM", "855", "KHR"),
            ("Kamerun", "Cameroon", "CM", "CMR", "237", "XAF"),
            ("Kanada", "Canada", "CA", "CAN", "1", "CAD"),
            ("Yeşil Burun Adaları", "Cape Verde", "CV", "CPV", "238", "CVE"),
            ("Cayman Adaları", "Cayman Islands", "KY", "CYM", "1", "KYD"),
            ("Orta Afrika Cumhuriyeti", "Central African Republic", "CF", "CAF", "236", "XAF"),
            ("Çad", "Chad", "TD", "TCD", "235", "XAF"),
            ("Şili", "Chile", "CL", "CHL", "56", "CLP"),
            ("Çin", "China", "CN", "CHN", "86", "CNY"),
            ("Christmas Adası", "Christmas Island", "CX", "CXR", "61", "AUD"),
            ("Cocos (Keeling) Adaları", "Cocos (Keeling) Islands", "CC", "CCK", "61", "AUD"),
            ("Kolombiya", "Colombia", "CO", "COL", "57", "COP"),
            ("Komorlar", "Comoros", "KM", "COM", "269", "KMF"),
            ("Kongo", "Congo", "CG", "COG", "242", "CDF"),
            ("Cook Adaları", "Cook Islands", "CK", "COK", "682", "NZD"),
            ("Kosta Rika", "Costa Rica", "CR", "CRI", "506", "CRC"),
            ("Hırvatistan", "Croatia", "HR", "HRV", "385", "EUR"),
            ("Küba", "Cuba", "CU", "CUB", "53", "CUP"),
            ("Curaçao", "Curaçao", "CW", "CUW", "599", "ANG"),
            ("Kıbrıs", "Cyprus", "CY", "CYP", "357", "EUR"),
            ("Çekya", "Czech Republic", "CZ", "CZE", "420", "CZK"),
            ("Demokratik Kongo Cumhuriyeti", "Democratic Republic of the Congo", "CD", "COD", "243", "CDF"),
            ("Danimarka", "Denmark", "DK", "DNK", "45", "DKK"),
            ("Cibuti", "Djibouti", "DJ", "DJI", "253", "DJF"),
            ("Dominika", "Dominica", "DM", "DMA", "1", "XCD"),
            ("Dominik Cumhuriyeti", "Dominican Republic", "DO", "DOM", "1", "DOP"),
            ("Ekvador", "Ecuador", "EC", "ECU", "593", "USD"),
            ("Mısır", "Egypt", "EG", "EGY", "20", "EGP"),
            ("El Salvador", "El Salvador", "SV", "SLV", "503", "USD"),
            ("Ekvator Ginesi", "Equatorial Guinea", "GQ", "GNQ", "240", "XAF"),
            ("Eritre", "Eritrea", "ER", "ERI", "291", "ERN"),
            ("Estonya", "Estonia", "EE", "EST", "372", "EUR"),
            ("Esvatini", "Eswatini", "SZ", "SWZ", "268", "SZL"),
            ("Etiyopya", "Ethiopia", "ET", "ETH", "251", "ETB"),
            ("Falkland Adaları", "Falkland Islands", "FK", "FLK", "500", "FKP"),
            ("Faroe Adaları", "Faroe Islands", "FO", "FRO", "298", "DKK"),
            ("Fiji", "Fiji Islands", "FJ", "FJI", "679", "FJD"),
            ("Finlandiya", "Finland", "FI", "FIN", "358", "EUR"),
            ("Fransa", "France", "FR", "FRA", "33", "EUR"),
            ("Fransız Guyanası", "French Guiana", "GF", "GUF", "594", "EUR"),
            ("Fransız Polinezyası", "French Polynesia", "PF", "PYF", "689", "XPF"),
            ("Fransız Güney Toprakları", "French Southern Territories", "TF", "ATF", "262", "EUR"),
            ("Gabon", "Gabon", "GA", "GAB", "241", "XAF"),
            ("Gürcistan", "Georgia", "GE", "GEO", "995", "GEL"),
            ("Almanya", "Germany", "DE", "DEU", "49", "EUR"),
            ("Gana", "Ghana", "GH", "GHA", "233", "GHS"),
            ("Cebelitarık", "Gibraltar", "GI", "GIB", "350", "GIP"),
            ("Yunanistan", "Greece", "GR", "GRC", "30", "EUR"),
            ("Grönland", "Greenland", "GL", "GRL", "299", "DKK"),
            ("Grenada", "Grenada", "GD", "GRD", "1", "XCD"),
            ("Guadeloupe", "Guadeloupe", "GP", "GLP", "590", "EUR"),
            ("Guam", "Guam", "GU", "GUM", "1", "USD"),
            ("Guatemala", "Guatemala", "GT", "GTM", "502", "GTQ"),
            ("Guernsey", "Guernsey", "GG", "GGY", "44", "GBP"),
            ("Gine", "Guinea", "GN", "GIN", "224", "GNF"),
            ("Gine-Bissau", "Guinea-Bissau", "GW", "GNB", "245", "XOF"),
            ("Guyana", "Guyana", "GY", "GUY", "592", "GYD"),
            ("Haiti", "Haiti", "HT", "HTI", "509", "HTG"),
            ("Heard Adası ve McDonald Adaları", "Heard Island and McDonald Islands", "HM", "HMD", "672", "AUD"),
            ("Honduras", "Honduras", "HN", "HND", "504", "HNL"),
            ("Hong Kong", "Hong Kong S.A.R.", "HK", "HKG", "852", "HKD"),
            ("Macaristan", "Hungary", "HU", "HUN", "36", "HUF"),
            ("İzlanda", "Iceland", "IS", "ISL", "354", "ISK"),
            ("Hindistan", "India", "IN", "IND", "91", "INR"),
            ("Endonezya", "Indonesia", "ID", "IDN", "62", "IDR"),
            ("İran", "Iran", "IR", "IRN", "98", "IRR"),
            ("Irak", "Iraq", "IQ", "IRQ", "964", "IQD"),
            ("İrlanda", "Ireland", "IE", "IRL", "353", "EUR"),
            ("İsrail", "Israel", "IL", "ISR", "972", "ILS"),
            ("İtalya", "Italy", "IT", "ITA", "39", "EUR"),
            ("Fildişi Sahili", "Ivory Coast", "CI", "CIV", "225", "XOF"),
            ("Jamaika", "Jamaica", "JM", "JAM", "1", "JMD"),
            ("Japonya", "Japan", "JP", "JPN", "81", "JPY"),
            ("Jersey", "Jersey", "JE", "JEY", "44", "GBP"),
            ("Ürdün", "Jordan", "JO", "JOR", "962", "JOD"),
            ("Kazakistan", "Kazakhstan", "KZ", "KAZ", "7", "KZT"),
            ("Kenya", "Kenya", "KE", "KEN", "254", "KES"),
            ("Kiribati", "Kiribati", "KI", "KIR", "686", "AUD"),
            ("Kosova", "Kosovo", "XK", "XKX", "383", "EUR"),
            ("Kuveyt", "Kuwait", "KW", "KWT", "965", "KWD"),
            ("Kırgızistan", "Kyrgyzstan", "KG", "KGZ", "996", "KGS"),
            ("Laos", "Laos", "LA", "LAO", "856", "LAK"),
            ("Letonya", "Latvia", "LV", "LVA", "371", "EUR"),
            ("Lübnan", "Lebanon", "LB", "LBN", "961", "LBP"),
            ("Lesotho", "Lesotho", "LS", "LSO", "266", "LSL"),
            ("Liberya", "Liberia", "LR", "LBR", "231", "LRD"),
            ("Libya", "Libya", "LY", "LBY", "218", "LYD"),
            ("Lihtenştayn", "Liechtenstein", "LI", "LIE", "423", "CHF"),
            ("Litvanya", "Lithuania", "LT", "LTU", "370", "EUR"),
            ("Lüksemburg", "Luxembourg", "LU", "LUX", "352", "EUR"),
            ("Makao", "Macau S.A.R.", "MO", "MAC", "853", "MOP"),
            ("Madagaskar", "Madagascar", "MG", "MDG", "261", "MGA"),
            ("Malavi", "Malawi", "MW", "MWI", "265", "MWK"),
            ("Malezya", "Malaysia", "MY", "MYS", "60", "MYR"),
            ("Maldivler", "Maldives", "MV", "MDV", "960", "MVR"),
            ("Mali", "Mali", "ML", "MLI", "223", "XOF"),
            ("Malta", "Malta", "MT", "MLT", "356", "EUR"),
            ("Man Adası", "Man (Isle of)", "IM", "IMN", "44", "GBP"),
            ("Marshall Adaları", "Marshall Islands", "MH", "MHL", "692", "USD"),
            ("Martinik", "Martinique", "MQ", "MTQ", "596", "EUR"),
            ("Moritanya", "Mauritania", "MR", "MRT", "222", "MRU"),
            ("Mauritius", "Mauritius", "MU", "MUS", "230", "MUR"),
            ("Mayotte", "Mayotte", "YT", "MYT", "262", "EUR"),
            ("Meksika", "Mexico", "MX", "MEX", "52", "MXN"),
            ("Mikronezya", "Micronesia", "FM", "FSM", "691", "USD"),
            ("Moldova", "Moldova", "MD", "MDA", "373", "MDL"),
            ("Monako", "Monaco", "MC", "MCO", "377", "EUR"),
            ("Moğolistan", "Mongolia", "MN", "MNG", "976", "MNT"),
            ("Karadağ", "Montenegro", "ME", "MNE", "382", "EUR"),
            ("Montserrat", "Montserrat", "MS", "MSR", "1", "XCD"),
            ("Fas", "Morocco", "MA", "MAR", "212", "MAD"),
            ("Mozambik", "Mozambique", "MZ", "MOZ", "258", "MZN"),
            ("Myanmar", "Myanmar", "MM", "MMR", "95", "MMK"),
            ("Namibya", "Namibia", "NA", "NAM", "264", "NAD"),
            ("Nauru", "Nauru", "NR", "NRU", "674", "AUD"),
            ("Nepal", "Nepal", "NP", "NPL", "977", "NPR"),
            ("Hollanda", "Netherlands", "NL", "NLD", "31", "EUR"),
            ("Yeni Kaledonya", "New Caledonia", "NC", "NCL", "687", "XPF"),
            ("Yeni Zelanda", "New Zealand", "NZ", "NZL", "64", "NZD"),
            ("Nikaragua", "Nicaragua", "NI", "NIC", "505", "NIO"),
            ("Nijer", "Niger", "NE", "NER", "227", "XOF"),
            ("Nijerya", "Nigeria", "NG", "NGA", "234", "NGN"),
            ("Niue", "Niue", "NU", "NIU", "683", "NZD"),
            ("Norfolk Adası", "Norfolk Island", "NF", "NFK", "672", "AUD"),
            ("Kuzey Kore", "North Korea", "KP", "PRK", "850", "KPW"),
            ("Kuzey Makedonya", "North Macedonia", "MK", "MKD", "389", "MKD"),
            ("Kuzey Mariana Adaları", "Northern Mariana Islands", "MP", "MNP", "1", "USD"),
            ("Norveç", "Norway", "NO", "NOR", "47", "NOK"),
            ("Umman", "Oman", "OM", "OMN", "968", "OMR"),
            ("Pakistan", "Pakistan", "PK", "PAK", "92", "PKR"),
            ("Palau", "Palau", "PW", "PLW", "680", "USD"),
            ("Filistin", "Palestinian Territory Occupied", "PS", "PSE", "970", "ILS"),
            ("Panama", "Panama", "PA", "PAN", "507", "PAB"),
            ("Papua Yeni Gine", "Papua New Guinea", "PG", "PNG", "675", "PGK"),
            ("Paraguay", "Paraguay", "PY", "PRY", "595", "PYG"),
            ("Peru", "Peru", "PE", "PER", "51", "PEN"),
            ("Filipinler", "Philippines", "PH", "PHL", "63", "PHP"),
            ("Pitcairn Adaları", "Pitcairn Island", "PN", "PCN", "870", "NZD"),
            ("Polonya", "Poland", "PL", "POL", "48", "PLN"),
            ("Portekiz", "Portugal", "PT", "PRT", "351", "EUR"),
            ("Porto Riko", "Puerto Rico", "PR", "PRI", "1", "USD"),
            ("Katar", "Qatar", "QA", "QAT", "974", "QAR"),
            ("Réunion", "Reunion", "RE", "REU", "262", "EUR"),
            ("Romanya", "Romania", "RO", "ROU", "40", "RON"),
            ("Rusya", "Russia", "RU", "RUS", "7", "RUB"),
            ("Ruanda", "Rwanda", "RW", "RWA", "250", "RWF"),
            ("Saint Helena", "Saint Helena", "SH", "SHN", "290", "SHP"),
            ("Saint Kitts ve Nevis", "Saint Kitts and Nevis", "KN", "KNA", "1", "XCD"),
            ("Saint Lucia", "Saint Lucia", "LC", "LCA", "1", "XCD"),
            ("Saint Pierre ve Miquelon", "Saint Pierre and Miquelon", "PM", "SPM", "508", "EUR"),
            ("Saint Vincent ve Grenadinler", "Saint Vincent and the Grenadines", "VC", "VCT", "1", "XCD"),
            ("Saint-Barthélemy", "Saint-Barthelemy", "BL", "BLM", "590", "EUR"),
            ("Saint-Martin", "Saint-Martin (French part)", "MF", "MAF", "590", "EUR"),
            ("Samoa", "Samoa", "WS", "WSM", "685", "WST"),
            ("San Marino", "San Marino", "SM", "SMR", "378", "EUR"),
            ("São Tomé ve Príncipe", "Sao Tome and Principe", "ST", "STP", "239", "STN"),
            ("Suudi Arabistan", "Saudi Arabia", "SA", "SAU", "966", "SAR"),
            ("Senegal", "Senegal", "SN", "SEN", "221", "XOF"),
            ("Sırbistan", "Serbia", "RS", "SRB", "381", "RSD"),
            ("Seyşeller", "Seychelles", "SC", "SYC", "248", "SCR"),
            ("Sierra Leone", "Sierra Leone", "SL", "SLE", "232", "SLL"),
            ("Singapur", "Singapore", "SG", "SGP", "65", "SGD"),
            ("Sint Maarten", "Sint Maarten (Dutch part)", "SX", "SXM", "1721", "ANG"),
            ("Slovakya", "Slovakia", "SK", "SVK", "421", "EUR"),
            ("Slovenya", "Slovenia", "SI", "SVN", "386", "EUR"),
            ("Solomon Adaları", "Solomon Islands", "SB", "SLB", "677", "SBD"),
            ("Somali", "Somalia", "SO", "SOM", "252", "SOS"),
            ("Güney Afrika", "South Africa", "ZA", "ZAF", "27", "ZAR"),
            ("Güney Georgia ve Güney Sandwich Adaları", "South Georgia", "GS", "SGS", "500", "GBP"),
            ("Güney Kore", "South Korea", "KR", "KOR", "82", "KRW"),
            ("Güney Sudan", "South Sudan", "SS", "SSD", "211", "SSP"),
            ("İspanya", "Spain", "ES", "ESP", "34", "EUR"),
            ("Sri Lanka", "Sri Lanka", "LK", "LKA", "94", "LKR"),
            ("Sudan", "Sudan", "SD", "SDN", "249", "SDG"),
            ("Surinam", "Suriname", "SR", "SUR", "597", "SRD"),
            ("Svalbard ve Jan Mayen", "Svalbard and Jan Mayen Islands", "SJ", "SJM", "47", "NOK"),
            ("İsveç", "Sweden", "SE", "SWE", "46", "SEK"),
            ("İsviçre", "Switzerland", "CH", "CHE", "41", "CHF"),
            ("Suriye", "Syria", "SY", "SYR", "963", "SYP"),
            ("Tayvan", "Taiwan", "TW", "TWN", "886", "TWD"),
            ("Tacikistan", "Tajikistan", "TJ", "TJK", "992", "TJS"),
            ("Tanzanya", "Tanzania", "TZ", "TZA", "255", "TZS"),
            ("Tayland", "Thailand", "TH", "THA", "66", "THB"),
            ("Bahamalar", "The Bahamas", "BS", "BHS", "1", "BSD"),
            ("Gambiya", "The Gambia", "GM", "GMB", "220", "GMD"),
            ("Doğu Timor", "Timor-Leste", "TL", "TLS", "670", "USD"),
            ("Togo", "Togo", "TG", "TGO", "228", "XOF"),
            ("Tokelau", "Tokelau", "TK", "TKL", "690", "NZD"),
            ("Tonga", "Tonga", "TO", "TON", "676", "TOP"),
            ("Trinidad ve Tobago", "Trinidad and Tobago", "TT", "TTO", "1", "TTD"),
            ("Tunus", "Tunisia", "TN", "TUN", "216", "TND"),
            ("Türkiye", "Turkey", "TR", "TUR", "90", "TRY"),
            ("Türkmenistan", "Turkmenistan", "TM", "TKM", "993", "TMT"),
            ("Turks ve Caicos Adaları", "Turks and Caicos Islands", "TC", "TCA", "1", "USD"),
            ("Tuvalu", "Tuvalu", "TV", "TUV", "688", "AUD"),
            ("Uganda", "Uganda", "UG", "UGA", "256", "UGX"),
            ("Ukrayna", "Ukraine", "UA", "UKR", "380", "UAH"),
            ("Birleşik Arap Emirlikleri", "United Arab Emirates", "AE", "ARE", "971", "AED"),
            ("Birleşik Krallık", "United Kingdom", "GB", "GBR", "44", "GBP"),
            ("Amerika Birleşik Devletleri", "United States", "US", "USA", "1", "USD"),
            ("ABD Küçük Dış Adaları", "United States Minor Outlying Islands", "UM", "UMI", "1", "USD"),
            ("Uruguay", "Uruguay", "UY", "URY", "598", "UYU"),
            ("Özbekistan", "Uzbekistan", "UZ", "UZB", "998", "UZS"),
            ("Vanuatu", "Vanuatu", "VU", "VUT", "678", "VUV"),
            ("Vatikan", "Vatican City State (Holy See)", "VA", "VAT", "379", "EUR"),
            ("Venezuela", "Venezuela", "VE", "VEN", "58", "VES"),
            ("Vietnam", "Vietnam", "VN", "VNM", "84", "VND"),
            ("Britanya Virjin Adaları", "Virgin Islands (British)", "VG", "VGB", "1", "USD"),
            ("ABD Virjin Adaları", "Virgin Islands (US)", "VI", "VIR", "1", "USD"),
            ("Wallis ve Futuna", "Wallis and Futuna Islands", "WF", "WLF", "681", "XPF"),
            ("Batı Sahra", "Western Sahara", "EH", "ESH", "212", "MAD"),
            ("Yemen", "Yemen", "YE", "YEM", "967", "YER"),
            ("Zambiya", "Zambia", "ZM", "ZMB", "260", "ZMW"),
            ("Zimbabve", "Zimbabwe", "ZW", "ZWE", "263", "ZWL")
        };

        // Turkey gets special treatment with fixed ID and display order 1
        var countries = new List<Country>();
        var displayOrder = 2;

        foreach (var c in countryData)
        {
            if (c.Code == "TR")
            {
                // Turkey with fixed ID and first display order
                countries.Add(Country.CreateWithId(
                    TurkeyId,
                    c.Name,
                    c.NameEn,
                    c.Code,
                    c.Code3,
                    c.PhoneCode,
                    c.CurrencyCode,
                    displayOrder: 1));
            }
            else
            {
                // Other countries with generated IDs
                countries.Add(Country.CreateWithId(
                    GenerateCountryGuid(c.Code),
                    c.Name,
                    c.NameEn,
                    c.Code,
                    c.Code3,
                    c.PhoneCode,
                    c.CurrencyCode,
                    displayOrder: displayOrder++));
            }
        }

        return countries;
    }

    /// <summary>
    /// Get cities/states for international countries
    /// </summary>
    private static List<City> GetInternationalCities(List<Country> countries)
    {
        var cities = new List<City>();
        var countryDict = countries.ToDictionary(c => c.Code, c => c.Id);

        // USA States (50 states + DC)
        if (countryDict.TryGetValue("US", out var usId))
        {
            var usStates = new[] { "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "District of Columbia" };
            cities.AddRange(usStates.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("US", i + 1), usId, s, (i + 1).ToString("D2"), null, "United States", i + 1)));
        }

        // Germany States (16 Bundesländer)
        if (countryDict.TryGetValue("DE", out var deId))
        {
            var deStates = new[] { "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen" };
            cities.AddRange(deStates.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("DE", i + 1), deId, s, (i + 1).ToString("D2"), null, "Germany", i + 1)));
        }

        // France Regions
        if (countryDict.TryGetValue("FR", out var frId))
        {
            var frRegions = new[] { "Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Bretagne", "Centre-Val de Loire", "Corse", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandie", "Nouvelle-Aquitaine", "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur" };
            cities.AddRange(frRegions.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("FR", i + 1), frId, s, (i + 1).ToString("D2"), null, "France", i + 1)));
        }

        // United Kingdom
        if (countryDict.TryGetValue("GB", out var gbId))
        {
            var gbRegions = new[] { "England", "Scotland", "Wales", "Northern Ireland", "London", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Leeds", "Edinburgh", "Bristol", "Sheffield", "Cardiff", "Belfast", "Newcastle", "Nottingham", "Southampton", "Leicester", "Brighton" };
            cities.AddRange(gbRegions.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("GB", i + 1), gbId, s, (i + 1).ToString("D2"), null, "United Kingdom", i + 1)));
        }

        // Italy Regions
        if (countryDict.TryGetValue("IT", out var itId))
        {
            var itRegions = new[] { "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna", "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche", "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana", "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto" };
            cities.AddRange(itRegions.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("IT", i + 1), itId, s, (i + 1).ToString("D2"), null, "Italy", i + 1)));
        }

        // Spain Autonomous Communities
        if (countryDict.TryGetValue("ES", out var esId))
        {
            var esRegions = new[] { "Andalucía", "Aragón", "Asturias", "Baleares", "Canarias", "Cantabria", "Castilla-La Mancha", "Castilla y León", "Cataluña", "Ceuta", "Extremadura", "Galicia", "La Rioja", "Madrid", "Melilla", "Murcia", "Navarra", "País Vasco", "Valencia" };
            cities.AddRange(esRegions.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("ES", i + 1), esId, s, (i + 1).ToString("D2"), null, "Spain", i + 1)));
        }

        // Netherlands Provinces
        if (countryDict.TryGetValue("NL", out var nlId))
        {
            var nlProvinces = new[] { "Drenthe", "Flevoland", "Friesland", "Gelderland", "Groningen", "Limburg", "Noord-Brabant", "Noord-Holland", "Overijssel", "Utrecht", "Zeeland", "Zuid-Holland" };
            cities.AddRange(nlProvinces.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("NL", i + 1), nlId, s, (i + 1).ToString("D2"), null, "Netherlands", i + 1)));
        }

        // Belgium
        if (countryDict.TryGetValue("BE", out var beId))
        {
            var beRegions = new[] { "Antwerp", "Brussels", "East Flanders", "Flemish Brabant", "Hainaut", "Liège", "Limburg", "Luxembourg", "Namur", "Walloon Brabant", "West Flanders" };
            cities.AddRange(beRegions.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("BE", i + 1), beId, s, (i + 1).ToString("D2"), null, "Belgium", i + 1)));
        }

        // Austria
        if (countryDict.TryGetValue("AT", out var atId))
        {
            var atStates = new[] { "Burgenland", "Kärnten", "Niederösterreich", "Oberösterreich", "Salzburg", "Steiermark", "Tirol", "Vorarlberg", "Wien" };
            cities.AddRange(atStates.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("AT", i + 1), atId, s, (i + 1).ToString("D2"), null, "Austria", i + 1)));
        }

        // Switzerland
        if (countryDict.TryGetValue("CH", out var chId))
        {
            var chCantons = new[] { "Aargau", "Appenzell Ausserrhoden", "Appenzell Innerrhoden", "Basel-Landschaft", "Basel-Stadt", "Bern", "Freiburg", "Genf", "Glarus", "Graubünden", "Jura", "Luzern", "Neuenburg", "Nidwalden", "Obwalden", "Schaffhausen", "Schwyz", "Solothurn", "St. Gallen", "Thurgau", "Tessin", "Uri", "Waadt", "Wallis", "Zug", "Zürich" };
            cities.AddRange(chCantons.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("CH", i + 1), chId, s, (i + 1).ToString("D2"), null, "Switzerland", i + 1)));
        }

        // UAE Emirates
        if (countryDict.TryGetValue("AE", out var aeId))
        {
            var aeEmirates = new[] { "Abu Dhabi", "Ajman", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah", "Umm Al Quwain" };
            cities.AddRange(aeEmirates.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("AE", i + 1), aeId, s, (i + 1).ToString("D2"), null, "UAE", i + 1)));
        }

        // Saudi Arabia
        if (countryDict.TryGetValue("SA", out var saId))
        {
            var saRegions = new[] { "Riyadh", "Makkah", "Madinah", "Eastern Province", "Asir", "Jizan", "Najran", "Al Bahah", "Northern Borders", "Jawf", "Hail", "Qassim", "Tabuk" };
            cities.AddRange(saRegions.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("SA", i + 1), saId, s, (i + 1).ToString("D2"), null, "Saudi Arabia", i + 1)));
        }

        // Russia
        if (countryDict.TryGetValue("RU", out var ruId))
        {
            var ruRegions = new[] { "Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Nizhny Novgorod", "Kazan", "Chelyabinsk", "Omsk", "Samara", "Rostov-on-Don", "Ufa", "Krasnoyarsk", "Voronezh", "Perm", "Volgograd", "Krasnodar", "Saratov", "Tyumen", "Tolyatti", "Izhevsk" };
            cities.AddRange(ruRegions.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("RU", i + 1), ruId, s, (i + 1).ToString("D2"), null, "Russia", i + 1)));
        }

        // China Provinces
        if (countryDict.TryGetValue("CN", out var cnId))
        {
            var cnProvinces = new[] { "Beijing", "Shanghai", "Tianjin", "Chongqing", "Anhui", "Fujian", "Gansu", "Guangdong", "Guizhou", "Hainan", "Hebei", "Heilongjiang", "Henan", "Hubei", "Hunan", "Jiangsu", "Jiangxi", "Jilin", "Liaoning", "Qinghai", "Shaanxi", "Shandong", "Shanxi", "Sichuan", "Yunnan", "Zhejiang", "Guangxi", "Inner Mongolia", "Ningxia", "Tibet", "Xinjiang", "Hong Kong", "Macau" };
            cities.AddRange(cnProvinces.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("CN", i + 1), cnId, s, (i + 1).ToString("D2"), null, "China", i + 1)));
        }

        // Japan Prefectures
        if (countryDict.TryGetValue("JP", out var jpId))
        {
            var jpPrefectures = new[] { "Tokyo", "Osaka", "Kanagawa", "Aichi", "Saitama", "Chiba", "Hyogo", "Hokkaido", "Fukuoka", "Shizuoka", "Hiroshima", "Kyoto", "Miyagi", "Niigata", "Nagano", "Gifu", "Fukushima", "Gunma", "Tochigi", "Ibaraki", "Okayama", "Kumamoto", "Kagoshima", "Okinawa", "Nara", "Wakayama", "Mie", "Shiga", "Ishikawa", "Toyama", "Fukui", "Yamanashi", "Yamagata", "Iwate", "Akita", "Aomori", "Nagasaki", "Saga", "Oita", "Miyazaki", "Kochi", "Ehime", "Kagawa", "Tokushima", "Yamaguchi", "Tottori", "Shimane" };
            cities.AddRange(jpPrefectures.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("JP", i + 1), jpId, s, (i + 1).ToString("D2"), null, "Japan", i + 1)));
        }

        // India States
        if (countryDict.TryGetValue("IN", out var inId))
        {
            var inStates = new[] { "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh" };
            cities.AddRange(inStates.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("IN", i + 1), inId, s, (i + 1).ToString("D2"), null, "India", i + 1)));
        }

        // Canada Provinces
        if (countryDict.TryGetValue("CA", out var caId))
        {
            var caProvinces = new[] { "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon" };
            cities.AddRange(caProvinces.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("CA", i + 1), caId, s, (i + 1).ToString("D2"), null, "Canada", i + 1)));
        }

        // Australia States
        if (countryDict.TryGetValue("AU", out var auId))
        {
            var auStates = new[] { "Australian Capital Territory", "New South Wales", "Northern Territory", "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia" };
            cities.AddRange(auStates.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("AU", i + 1), auId, s, (i + 1).ToString("D2"), null, "Australia", i + 1)));
        }

        // Brazil States
        if (countryDict.TryGetValue("BR", out var brId))
        {
            var brStates = new[] { "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins" };
            cities.AddRange(brStates.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("BR", i + 1), brId, s, (i + 1).ToString("D2"), null, "Brazil", i + 1)));
        }

        // Mexico States
        if (countryDict.TryGetValue("MX", out var mxId))
        {
            var mxStates = new[] { "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas" };
            cities.AddRange(mxStates.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("MX", i + 1), mxId, s, (i + 1).ToString("D2"), null, "Mexico", i + 1)));
        }

        // Egypt Governorates
        if (countryDict.TryGetValue("EG", out var egId))
        {
            var egGovernorates = new[] { "Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez", "Luxor", "Aswan", "Mansoura", "Tanta", "Ismailia", "Faiyum", "Zagazig", "Damietta", "Assiut", "Sohag", "Hurghada", "Marsa Matruh", "Beni Suef", "Qena", "Minya", "Damanhur", "New Valley", "Red Sea", "North Sinai", "South Sinai" };
            cities.AddRange(egGovernorates.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("EG", i + 1), egId, s, (i + 1).ToString("D2"), null, "Egypt", i + 1)));
        }

        // Pakistan Provinces
        if (countryDict.TryGetValue("PK", out var pkId))
        {
            var pkProvinces = new[] { "Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad", "Azad Kashmir", "Gilgit-Baltistan" };
            cities.AddRange(pkProvinces.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("PK", i + 1), pkId, s, (i + 1).ToString("D2"), null, "Pakistan", i + 1)));
        }

        // Indonesia Provinces
        if (countryDict.TryGetValue("ID", out var idCountryId))
        {
            var idProvinces = new[] { "Aceh", "Bali", "Banten", "Bengkulu", "DI Yogyakarta", "DKI Jakarta", "Gorontalo", "Jambi", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah", "Kalimantan Timur", "Kalimantan Utara", "Kepulauan Bangka Belitung", "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Papua", "Papua Barat", "Riau", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tengah", "Sulawesi Tenggara", "Sulawesi Utara", "Sumatera Barat", "Sumatera Selatan", "Sumatera Utara" };
            cities.AddRange(idProvinces.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("ID", i + 1), idCountryId, s, (i + 1).ToString("D2"), null, "Indonesia", i + 1)));
        }

        // Malaysia States
        if (countryDict.TryGetValue("MY", out var myId))
        {
            var myStates = new[] { "Johor", "Kedah", "Kelantan", "Kuala Lumpur", "Labuan", "Melaka", "Negeri Sembilan", "Pahang", "Penang", "Perak", "Perlis", "Putrajaya", "Sabah", "Sarawak", "Selangor", "Terengganu" };
            cities.AddRange(myStates.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("MY", i + 1), myId, s, (i + 1).ToString("D2"), null, "Malaysia", i + 1)));
        }

        // Singapore Regions
        if (countryDict.TryGetValue("SG", out var sgId))
        {
            var sgRegions = new[] { "Central Singapore", "North East", "North West", "South East", "South West" };
            cities.AddRange(sgRegions.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("SG", i + 1), sgId, s, (i + 1).ToString("D2"), null, "Singapore", i + 1)));
        }

        // South Korea Provinces
        if (countryDict.TryGetValue("KR", out var krId))
        {
            var krProvinces = new[] { "Seoul", "Busan", "Daegu", "Incheon", "Gwangju", "Daejeon", "Ulsan", "Sejong", "Gyeonggi", "Gangwon", "North Chungcheong", "South Chungcheong", "North Jeolla", "South Jeolla", "North Gyeongsang", "South Gyeongsang", "Jeju" };
            cities.AddRange(krProvinces.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("KR", i + 1), krId, s, (i + 1).ToString("D2"), null, "South Korea", i + 1)));
        }

        // Thailand Provinces (major ones)
        if (countryDict.TryGetValue("TH", out var thId))
        {
            var thProvinces = new[] { "Bangkok", "Chiang Mai", "Chiang Rai", "Phuket", "Krabi", "Surat Thani", "Nakhon Ratchasima", "Khon Kaen", "Udon Thani", "Chonburi", "Pattaya", "Samut Prakan", "Nonthaburi", "Pathum Thani", "Ayutthaya", "Songkhla", "Hat Yai", "Nakhon Si Thammarat", "Ubon Ratchathani", "Kanchanaburi" };
            cities.AddRange(thProvinces.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("TH", i + 1), thId, s, (i + 1).ToString("D2"), null, "Thailand", i + 1)));
        }

        // Vietnam Provinces (major ones)
        if (countryDict.TryGetValue("VN", out var vnId))
        {
            var vnProvinces = new[] { "Ha Noi", "Ho Chi Minh City", "Da Nang", "Hai Phong", "Can Tho", "Binh Duong", "Dong Nai", "Khanh Hoa", "Quang Ninh", "Thanh Hoa", "Nghe An", "Ha Tinh", "Thua Thien Hue", "Quang Nam", "Lam Dong", "Tay Ninh", "Long An", "Vinh Long", "An Giang", "Ben Tre" };
            cities.AddRange(vnProvinces.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("VN", i + 1), vnId, s, (i + 1).ToString("D2"), null, "Vietnam", i + 1)));
        }

        // Philippines Regions
        if (countryDict.TryGetValue("PH", out var phId))
        {
            var phRegions = new[] { "Metro Manila", "Cebu", "Davao", "Calabarzon", "Central Luzon", "Western Visayas", "Central Visayas", "Northern Mindanao", "Zamboanga Peninsula", "Bicol", "Eastern Visayas", "Ilocos", "Cagayan Valley", "SOCCSKSARGEN", "Caraga", "MIMAROPA", "CAR", "BARMM" };
            cities.AddRange(phRegions.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("PH", i + 1), phId, s, (i + 1).ToString("D2"), null, "Philippines", i + 1)));
        }

        // Greece Regions
        if (countryDict.TryGetValue("GR", out var grId))
        {
            var grRegions = new[] { "Attica", "Central Greece", "Central Macedonia", "Crete", "Eastern Macedonia and Thrace", "Epirus", "Ionian Islands", "North Aegean", "Peloponnese", "South Aegean", "Thessaly", "Western Greece", "Western Macedonia" };
            cities.AddRange(grRegions.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("GR", i + 1), grId, s, (i + 1).ToString("D2"), null, "Greece", i + 1)));
        }

        // Poland Voivodeships
        if (countryDict.TryGetValue("PL", out var plId))
        {
            var plVoivodeships = new[] { "Greater Poland", "Kuyavia-Pomerania", "Lesser Poland", "Łódź", "Lower Silesia", "Lublin", "Lubusz", "Masovia", "Opole", "Podlaskie", "Pomerania", "Silesia", "Subcarpathia", "Holy Cross", "Warmia-Masuria", "West Pomerania" };
            cities.AddRange(plVoivodeships.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("PL", i + 1), plId, s, (i + 1).ToString("D2"), null, "Poland", i + 1)));
        }

        // Ukraine Oblasts
        if (countryDict.TryGetValue("UA", out var uaId))
        {
            var uaOblasts = new[] { "Kyiv", "Kharkiv", "Odessa", "Dnipro", "Donetsk", "Zaporizhzhia", "Lviv", "Kryvyi Rih", "Mykolaiv", "Mariupol", "Vinnytsia", "Kherson", "Poltava", "Chernihiv", "Cherkasy", "Zhytomyr", "Sumy", "Rivne", "Ivano-Frankivsk", "Ternopil", "Lutsk", "Uzhhorod", "Chernivtsi", "Khmelnytskyi" };
            cities.AddRange(uaOblasts.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("UA", i + 1), uaId, s, (i + 1).ToString("D2"), null, "Ukraine", i + 1)));
        }

        // Nordic Countries
        if (countryDict.TryGetValue("SE", out var seId))
        {
            var seRegions = new[] { "Stockholm", "Göteborg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping", "Helsingborg", "Jönköping", "Norrköping", "Lund", "Umeå", "Gävle", "Borås", "Södertälje", "Eskilstuna", "Karlstad", "Täby", "Växjö", "Halmstad" };
            cities.AddRange(seRegions.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("SE", i + 1), seId, s, (i + 1).ToString("D2"), null, "Sweden", i + 1)));
        }

        if (countryDict.TryGetValue("NO", out var noId))
        {
            var noRegions = new[] { "Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen", "Fredrikstad", "Kristiansand", "Sandnes", "Tromsø", "Sarpsborg", "Skien", "Ålesund", "Sandefjord", "Haugesund", "Tønsberg", "Moss", "Porsgrunn", "Bodø", "Arendal", "Hamar" };
            cities.AddRange(noRegions.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("NO", i + 1), noId, s, (i + 1).ToString("D2"), null, "Norway", i + 1)));
        }

        if (countryDict.TryGetValue("DK", out var dkId))
        {
            var dkRegions = new[] { "Copenhagen", "Aarhus", "Odense", "Aalborg", "Frederiksberg", "Esbjerg", "Randers", "Kolding", "Horsens", "Vejle", "Roskilde", "Herning", "Silkeborg", "Næstved", "Fredericia", "Viborg", "Køge", "Holstebro", "Taastrup", "Slagelse" };
            cities.AddRange(dkRegions.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("DK", i + 1), dkId, s, (i + 1).ToString("D2"), null, "Denmark", i + 1)));
        }

        if (countryDict.TryGetValue("FI", out var fiId))
        {
            var fiRegions = new[] { "Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku", "Jyväskylä", "Lahti", "Kuopio", "Pori", "Kouvola", "Joensuu", "Lappeenranta", "Hämeenlinna", "Vaasa", "Rovaniemi", "Seinäjoki", "Mikkeli", "Kotka", "Salo" };
            cities.AddRange(fiRegions.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("FI", i + 1), fiId, s, (i + 1).ToString("D2"), null, "Finland", i + 1)));
        }

        // Ireland
        if (countryDict.TryGetValue("IE", out var ieId))
        {
            var ieCounties = new[] { "Dublin", "Cork", "Galway", "Limerick", "Waterford", "Kilkenny", "Wexford", "Kerry", "Clare", "Mayo", "Donegal", "Sligo", "Louth", "Meath", "Kildare", "Wicklow", "Tipperary", "Offaly", "Laois", "Westmeath", "Roscommon", "Longford", "Cavan", "Monaghan", "Carlow", "Leitrim" };
            cities.AddRange(ieCounties.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("IE", i + 1), ieId, s, (i + 1).ToString("D2"), null, "Ireland", i + 1)));
        }

        // Portugal
        if (countryDict.TryGetValue("PT", out var ptId))
        {
            var ptDistricts = new[] { "Lisboa", "Porto", "Braga", "Setúbal", "Aveiro", "Faro", "Leiria", "Coimbra", "Santarém", "Viseu", "Viana do Castelo", "Vila Real", "Castelo Branco", "Guarda", "Évora", "Beja", "Bragança", "Portalegre", "Açores", "Madeira" };
            cities.AddRange(ptDistricts.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("PT", i + 1), ptId, s, (i + 1).ToString("D2"), null, "Portugal", i + 1)));
        }

        // Czech Republic
        if (countryDict.TryGetValue("CZ", out var czId))
        {
            var czRegions = new[] { "Prague", "Central Bohemia", "South Bohemia", "Plzeň", "Karlovy Vary", "Ústí nad Labem", "Liberec", "Hradec Králové", "Pardubice", "Vysočina", "South Moravia", "Olomouc", "Zlín", "Moravian-Silesia" };
            cities.AddRange(czRegions.Select((s, i) => City.CreateWithId(GenerateInternationalCityGuid("CZ", i + 1), czId, s, (i + 1).ToString("D2"), null, "Czech Republic", i + 1)));
        }

        return cities;
    }

    private static List<City> GetTurkishCities(Guid countryId)
    {
        // Turkish provinces with plate codes, regions, and coordinates
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
        var istanbulDistricts = new[] { ("Adalar", false), ("Arnavutköy", false), ("Ataşehir", false), ("Avcılar", false), ("Bağcılar", false), ("Bahçelievler", false), ("Bakırköy", false), ("Başakşehir", false), ("Bayrampaşa", false), ("Beşiktaş", false), ("Beykoz", false), ("Beylikdüzü", false), ("Beyoğlu", false), ("Büyükçekmece", false), ("Çatalca", false), ("Çekmeköy", false), ("Esenler", false), ("Esenyurt", false), ("Eyüpsultan", false), ("Fatih", true), ("Gaziosmanpaşa", false), ("Güngören", false), ("Kadıköy", false), ("Kağıthane", false), ("Kartal", false), ("Küçükçekmece", false), ("Maltepe", false), ("Pendik", false), ("Sancaktepe", false), ("Sarıyer", false), ("Silivri", false), ("Sultanbeyli", false), ("Sultangazi", false), ("Şile", false), ("Şişli", false), ("Tuzla", false), ("Ümraniye", false), ("Üsküdar", false), ("Zeytinburnu", false) };
        districts.AddRange(istanbulDistricts.Select((d, i) => District.CreateWithId(GenerateDistrictGuid("34", i + 1), istanbul.Id, d.Item1, null, d.Item2, i + 1)));

        // Ankara districts (25 districts)
        var ankara = cities.First(c => c.PlateCode == "06");
        var ankaraDistricts = new[] { ("Akyurt", false), ("Altındağ", false), ("Ayaş", false), ("Balâ", false), ("Beypazarı", false), ("Çamlıdere", false), ("Çankaya", true), ("Çubuk", false), ("Elmadağ", false), ("Etimesgut", false), ("Evren", false), ("Gölbaşı", false), ("Güdül", false), ("Haymana", false), ("Kahramankazan", false), ("Kalecik", false), ("Keçiören", false), ("Kızılcahamam", false), ("Mamak", false), ("Nallıhan", false), ("Polatlı", false), ("Pursaklar", false), ("Sincan", false), ("Şereflikoçhisar", false), ("Yenimahalle", false) };
        districts.AddRange(ankaraDistricts.Select((d, i) => District.CreateWithId(GenerateDistrictGuid("06", i + 1), ankara.Id, d.Item1, null, d.Item2, i + 1)));

        // İzmir districts (30 districts)
        var izmir = cities.First(c => c.PlateCode == "35");
        var izmirDistricts = new[] { ("Aliağa", false), ("Balçova", false), ("Bayındır", false), ("Bayraklı", false), ("Bergama", false), ("Beydağ", false), ("Bornova", false), ("Buca", false), ("Çeşme", false), ("Çiğli", false), ("Dikili", false), ("Foça", false), ("Gaziemir", false), ("Güzelbahçe", false), ("Karabağlar", false), ("Karaburun", false), ("Karşıyaka", false), ("Kemalpaşa", false), ("Kınık", false), ("Kiraz", false), ("Konak", true), ("Menderes", false), ("Menemen", false), ("Narlıdere", false), ("Ödemiş", false), ("Seferihisar", false), ("Selçuk", false), ("Tire", false), ("Torbalı", false), ("Urla", false) };
        districts.AddRange(izmirDistricts.Select((d, i) => District.CreateWithId(GenerateDistrictGuid("35", i + 1), izmir.Id, d.Item1, null, d.Item2, i + 1)));

        // Bursa districts (17 districts)
        var bursa = cities.First(c => c.PlateCode == "16");
        var bursaDistricts = new[] { ("Büyükorhan", false), ("Gemlik", false), ("Gürsu", false), ("Harmancık", false), ("İnegöl", false), ("İznik", false), ("Karacabey", false), ("Keles", false), ("Kestel", false), ("Mudanya", false), ("Mustafakemalpaşa", false), ("Nilüfer", false), ("Orhaneli", false), ("Orhangazi", false), ("Osmangazi", true), ("Yenişehir", false), ("Yıldırım", false) };
        districts.AddRange(bursaDistricts.Select((d, i) => District.CreateWithId(GenerateDistrictGuid("16", i + 1), bursa.Id, d.Item1, null, d.Item2, i + 1)));

        // Antalya districts (19 districts)
        var antalya = cities.First(c => c.PlateCode == "07");
        var antalyaDistricts = new[] { ("Akseki", false), ("Aksu", false), ("Alanya", false), ("Demre", false), ("Döşemealtı", false), ("Elmalı", false), ("Finike", false), ("Gazipaşa", false), ("Gündoğmuş", false), ("İbradı", false), ("Kaş", false), ("Kemer", false), ("Kepez", false), ("Konyaaltı", false), ("Korkuteli", false), ("Kumluca", false), ("Manavgat", false), ("Muratpaşa", true), ("Serik", false) };
        districts.AddRange(antalyaDistricts.Select((d, i) => District.CreateWithId(GenerateDistrictGuid("07", i + 1), antalya.Id, d.Item1, null, d.Item2, i + 1)));

        // Additional major cities with their districts...
        // Konya, Adana, Gaziantep, Kocaeli, Mersin, Kayseri, Eskişehir, Diyarbakır, Samsun, Denizli, Şanlıurfa, Trabzon

        var konya = cities.First(c => c.PlateCode == "42");
        var konyaDistricts = new[] { ("Ahırlı", false), ("Akören", false), ("Akşehir", false), ("Altınekin", false), ("Beyşehir", false), ("Bozkır", false), ("Cihanbeyli", false), ("Çeltik", false), ("Çumra", false), ("Derbent", false), ("Derebucak", false), ("Doğanhisar", false), ("Emirgazi", false), ("Ereğli", false), ("Güneysınır", false), ("Hadim", false), ("Halkapınar", false), ("Hüyük", false), ("Ilgın", false), ("Kadınhanı", false), ("Karapınar", false), ("Karatay", true), ("Kulu", false), ("Meram", false), ("Sarayönü", false), ("Selçuklu", false), ("Seydişehir", false), ("Taşkent", false), ("Tuzlukçu", false), ("Yalıhüyük", false), ("Yunak", false) };
        districts.AddRange(konyaDistricts.Select((d, i) => District.CreateWithId(GenerateDistrictGuid("42", i + 1), konya.Id, d.Item1, null, d.Item2, i + 1)));

        var adana = cities.First(c => c.PlateCode == "01");
        var adanaDistricts = new[] { ("Aladağ", false), ("Ceyhan", false), ("Çukurova", false), ("Feke", false), ("İmamoğlu", false), ("Karaisalı", false), ("Karataş", false), ("Kozan", false), ("Pozantı", false), ("Saimbeyli", false), ("Sarıçam", false), ("Seyhan", true), ("Tufanbeyli", false), ("Yumurtalık", false), ("Yüreğir", false) };
        districts.AddRange(adanaDistricts.Select((d, i) => District.CreateWithId(GenerateDistrictGuid("01", i + 1), adana.Id, d.Item1, null, d.Item2, i + 1)));

        var gaziantep = cities.First(c => c.PlateCode == "27");
        var gaziantepDistricts = new[] { ("Araban", false), ("İslahiye", false), ("Karkamış", false), ("Nizip", false), ("Nurdağı", false), ("Oğuzeli", false), ("Şahinbey", true), ("Şehitkamil", false), ("Yavuzeli", false) };
        districts.AddRange(gaziantepDistricts.Select((d, i) => District.CreateWithId(GenerateDistrictGuid("27", i + 1), gaziantep.Id, d.Item1, null, d.Item2, i + 1)));

        var kocaeli = cities.First(c => c.PlateCode == "41");
        var kocaeliDistricts = new[] { ("Başiskele", false), ("Çayırova", false), ("Darıca", false), ("Derince", false), ("Dilovası", false), ("Gebze", false), ("Gölcük", false), ("İzmit", true), ("Kandıra", false), ("Karamürsel", false), ("Kartepe", false), ("Körfez", false) };
        districts.AddRange(kocaeliDistricts.Select((d, i) => District.CreateWithId(GenerateDistrictGuid("41", i + 1), kocaeli.Id, d.Item1, null, d.Item2, i + 1)));

        var mersin = cities.First(c => c.PlateCode == "33");
        var mersinDistricts = new[] { ("Akdeniz", true), ("Anamur", false), ("Aydıncık", false), ("Bozyazı", false), ("Çamlıyayla", false), ("Erdemli", false), ("Gülnar", false), ("Mezitli", false), ("Mut", false), ("Silifke", false), ("Tarsus", false), ("Toroslar", false), ("Yenişehir", false) };
        districts.AddRange(mersinDistricts.Select((d, i) => District.CreateWithId(GenerateDistrictGuid("33", i + 1), mersin.Id, d.Item1, null, d.Item2, i + 1)));

        var kayseri = cities.First(c => c.PlateCode == "38");
        var kayseriDistricts = new[] { ("Akkışla", false), ("Bünyan", false), ("Develi", false), ("Felahiye", false), ("Hacılar", false), ("İncesu", false), ("Kocasinan", true), ("Melikgazi", false), ("Özvatan", false), ("Pınarbaşı", false), ("Sarıoğlan", false), ("Sarız", false), ("Talas", false), ("Tomarza", false), ("Yahyalı", false), ("Yeşilhisar", false) };
        districts.AddRange(kayseriDistricts.Select((d, i) => District.CreateWithId(GenerateDistrictGuid("38", i + 1), kayseri.Id, d.Item1, null, d.Item2, i + 1)));

        return districts;
    }

    /// <summary>
    /// Generate consistent GUID for countries based on ISO 2-letter code
    /// </summary>
    private static Guid GenerateCountryGuid(string code)
    {
        var asciiSum = ((int)code[0] * 100) + (int)code[1];
        return new Guid($"00000000-0000-0000-0001-0000000{asciiSum:D5}");
    }

    /// <summary>
    /// Generate consistent GUID for Turkish cities based on plate code
    /// </summary>
    private static Guid GenerateCityGuid(string plateCode)
    {
        var paddedCode = plateCode.PadLeft(4, '0');
        return new Guid($"00000000-0000-0000-0002-0000000{paddedCode}");
    }

    /// <summary>
    /// Generate consistent GUID for international cities
    /// </summary>
    private static Guid GenerateInternationalCityGuid(string countryCode, int cityIndex)
    {
        var countryNum = ((int)countryCode[0] * 100) + (int)countryCode[1];
        return new Guid($"00000000-0000-0000-0002-{countryNum:D4}00{cityIndex:D6}");
    }

    /// <summary>
    /// Generate consistent GUID for districts
    /// </summary>
    private static Guid GenerateDistrictGuid(string plateCode, int districtIndex)
    {
        var paddedPlate = plateCode.PadLeft(2, '0');
        var paddedIndex = districtIndex.ToString().PadLeft(4, '0');
        return new Guid($"00000000-0000-0000-0003-00{paddedPlate}0000{paddedIndex}");
    }
}
