/**
 * Qase.io Inventory Module Detayli Test Case Import Script
 *
 * Envanter modulu icin detayli test verileri ile test case'ler yukler
 * Mevcut suite'leri yeniden kullanir veya yeni olusturur
 *
 * Kullanim: node qase_import_detailed.js
 */

const API_TOKEN = 'dfbfaad3c35c109e393cb34d3226029a2d7f4199557dde6a3a297a400abd34ff';
const PROJECT_CODE = 'INV'; // Inventory icin ayri proje kodu

const testData = require('./Inventory_Test_Qase_Import_Detailed.json');

async function getSuites() {
    const response = await fetch(`https://api.qase.io/v1/suite/${PROJECT_CODE}?limit=100`, {
        method: 'GET',
        headers: {
            'Token': API_TOKEN,
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    if (data.status) {
        return data.result.entities || [];
    }
    return [];
}

async function deleteSuite(suiteId) {
    const response = await fetch(`https://api.qase.io/v1/suite/${PROJECT_CODE}/${suiteId}`, {
        method: 'DELETE',
        headers: {
            'Token': API_TOKEN
        }
    });
    const data = await response.json();
    return data.status;
}

async function createSuite(projectCode, title, description = '') {
    const body = { title };
    if (description) body.description = description;

    const response = await fetch(`https://api.qase.io/v1/suite/${projectCode}`, {
        method: 'POST',
        headers: {
            'Token': API_TOKEN,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    if (data.status) {
        console.log(`✅ Suite olusturuldu: ${title} (ID: ${data.result.id})`);
        return data.result.id;
    } else {
        console.error(`❌ Suite hatasi: ${title}`, data);
        return null;
    }
}

async function createTestCase(projectCode, suiteId, testCase) {
    const priorityMap = {
        'high': 2,
        'medium': 1,
        'low': 0,
        'critical': 3
    };

    const severityMap = {
        'critical': 4,
        'major': 3,
        'normal': 2,
        'minor': 1,
        'trivial': 0
    };

    const typeMap = {
        'functional': 1,
        'regression': 3,
        'security': 5,
        'usability': 6,
        'performance': 7,
        'other': 0
    };

    const steps = testCase.steps.map((step, index) => ({
        position: index + 1,
        action: step.action,
        expected_result: step.expected_result
    }));

    // Test data'yi preconditions'a ekle
    let preconditions = testCase.preconditions || '';
    if (testCase.test_data) {
        preconditions += '\n\n📋 TEST VERILERI:\n';
        for (const [key, value] of Object.entries(testCase.test_data)) {
            if (typeof value === 'object') {
                preconditions += `• ${key}: ${JSON.stringify(value, null, 2)}\n`;
            } else {
                preconditions += `• ${key}: ${value}\n`;
            }
        }
    }

    // Missing feature bilgisini description'a ekle
    let description = testCase.description || '';
    if (testCase.missing_feature) {
        description += `\n\n⚠️ EKSİK ÖZELLİK: ${testCase.missing_feature}`;
    }

    const body = {
        title: testCase.title,
        description: description,
        preconditions: preconditions,
        suite_id: suiteId,
        priority: priorityMap[testCase.priority] || 1,
        severity: severityMap[testCase.severity] || 2,
        type: typeMap[testCase.type] || 1,
        steps: steps
    };

    const response = await fetch(`https://api.qase.io/v1/case/${projectCode}`, {
        method: 'POST',
        headers: {
            'Token': API_TOKEN,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    if (data.status) {
        const missingTag = testCase.missing_feature ? ' ⚠️' : '';
        console.log(`  ✅ Test Case: ${testCase.title}${missingTag}`);
        return data.result.id;
    } else {
        console.error(`  ❌ Test Case hatasi: ${testCase.title}`, data);
        return null;
    }
}

async function clearExistingSuites() {
    console.log('🧹 Mevcut suite\'ler temizleniyor...\n');
    const suites = await getSuites();

    for (const suite of suites) {
        const deleted = await deleteSuite(suite.id);
        if (deleted) {
            console.log(`  🗑️ Silindi: ${suite.title}`);
        }
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\n✅ ${suites.length} suite silindi\n`);
}

function countMissingFeatures() {
    let count = 0;
    for (const suite of testData.suites) {
        for (const testCase of suite.cases) {
            if (testCase.missing_feature) count++;
        }
    }
    return count;
}

async function importAll() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 Qase.io INVENTORY MODULE DETAYLI Import Basliyor...');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`📁 Proje: ${PROJECT_CODE}`);
    console.log(`📊 Toplam Suite: ${testData.suites.length}`);

    let totalCases = 0;
    testData.suites.forEach(s => totalCases += s.cases.length);
    console.log(`📋 Toplam Test Case: ${totalCases}`);

    const missingCount = countMissingFeatures();
    if (missingCount > 0) {
        console.log(`⚠️ Eksik Ozellik Iceren: ${missingCount} test case`);
    }
    console.log('');

    // Once mevcut suite'leri temizle
    await clearExistingSuites();

    let successSuites = 0;
    let successCases = 0;
    let missingFeatureCases = 0;

    for (const suite of testData.suites) {
        // Suite olustur
        const suiteId = await createSuite(PROJECT_CODE, suite.title);

        if (suiteId) {
            successSuites++;

            // Test case'leri olustur
            for (const testCase of suite.cases) {
                const caseId = await createTestCase(PROJECT_CODE, suiteId, testCase);
                if (caseId) {
                    successCases++;
                    if (testCase.missing_feature) missingFeatureCases++;
                }

                // Rate limit icin bekle
                await new Promise(resolve => setTimeout(resolve, 250));
            }
        }

        console.log('');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ INVENTORY MODULE DETAYLI Import Tamamlandi!`);
    console.log(`📁 Suite: ${successSuites}/${testData.suites.length}`);
    console.log(`📋 Test Case: ${successCases}/${totalCases}`);
    if (missingFeatureCases > 0) {
        console.log(`⚠️ Eksik Ozellik: ${missingFeatureCases} test case frontend'de eklenmesi gerekiyor`);
    }
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📝 Notlar:');
    console.log('   • Test verileri preconditions alanina eklendi');
    console.log('   • Eksik ozellikler description alaninda belirtildi');
    console.log('   • ⚠️ isareti eksik frontend ozelligi oldugunu gosterir');
}

// Sadece belirli suite'leri import etmek icin
async function importSuites(suiteNames) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 Secili Suite\'ler Import Ediliyor...');
    console.log('═══════════════════════════════════════════════════════\n');

    const filteredSuites = testData.suites.filter(s =>
        suiteNames.some(name => s.title.toLowerCase().includes(name.toLowerCase()))
    );

    if (filteredSuites.length === 0) {
        console.log('❌ Eslesen suite bulunamadi!');
        console.log('Mevcut suite\'ler:');
        testData.suites.forEach(s => console.log(`  • ${s.title}`));
        return;
    }

    console.log(`📊 Secili Suite: ${filteredSuites.length}`);
    filteredSuites.forEach(s => console.log(`  • ${s.title}`));
    console.log('');

    let successCases = 0;

    for (const suite of filteredSuites) {
        const suiteId = await createSuite(PROJECT_CODE, suite.title);

        if (suiteId) {
            for (const testCase of suite.cases) {
                const caseId = await createTestCase(PROJECT_CODE, suiteId, testCase);
                if (caseId) successCases++;
                await new Promise(resolve => setTimeout(resolve, 250));
            }
        }
        console.log('');
    }

    console.log(`✅ Secili Import Tamamlandi! (${successCases} test case)`);
}

// Komut satiri argumanlari
const args = process.argv.slice(2);

if (args.length > 0 && args[0] === '--suites') {
    // Belirli suite'leri import et: node qase_import_detailed.js --suites Urunler Stok
    const suiteNames = args.slice(1);
    importSuites(suiteNames).catch(console.error);
} else if (args.length > 0 && args[0] === '--list') {
    // Suite listesini goster
    console.log('📊 Mevcut Suite\'ler:\n');
    testData.suites.forEach((s, i) => {
        const missingCount = s.cases.filter(c => c.missing_feature).length;
        const missingTag = missingCount > 0 ? ` (⚠️ ${missingCount} eksik ozellik)` : '';
        console.log(`  ${i + 1}. ${s.title} (${s.cases.length} test case)${missingTag}`);
    });
} else if (args.length > 0 && args[0] === '--missing') {
    // Eksik ozellikleri listele
    console.log('⚠️ Eksik Frontend Ozellikleri:\n');
    for (const suite of testData.suites) {
        const missingCases = suite.cases.filter(c => c.missing_feature);
        if (missingCases.length > 0) {
            console.log(`📁 ${suite.title}:`);
            missingCases.forEach(c => {
                console.log(`   • ${c.title}: ${c.missing_feature}`);
            });
            console.log('');
        }
    }
} else {
    // Tum suite'leri import et
    importAll().catch(console.error);
}
