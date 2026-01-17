/**
 * Qase.io Test Case Import Script
 *
 * Kullanım:
 * 1. API Token al: https://app.qase.io/user/api/token
 * 2. Aşağıdaki değerleri düzenle
 * 3. node qase_import.js
 */

const API_TOKEN = 'dfbfaad3c35c109e393cb34d3226029a2d7f4199557dde6a3a297a400abd34ff'; // Qase.io API Token
const PROJECT_CODE = 'CRM'; // Proje kodu (Qase.io'da oluşturduğunuz)

const testData = require('./CRM_Test_Qase_Import.json');

async function createSuite(projectCode, title, parentId = null) {
    const body = { title };
    if (parentId) body.parent_id = parentId;

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
        console.log(`✅ Suite oluşturuldu: ${title} (ID: ${data.result.id})`);
        return data.result.id;
    } else {
        console.error(`❌ Suite hatası: ${title}`, data);
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

    const body = {
        title: testCase.title,
        description: testCase.description || '',
        preconditions: testCase.preconditions || '',
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
        console.log(`  ✅ Test Case: ${testCase.title}`);
        return data.result.id;
    } else {
        console.error(`  ❌ Test Case hatası: ${testCase.title}`, data);
        return null;
    }
}

async function importAll() {
    console.log('🚀 Qase.io Import Başlıyor...\n');
    console.log(`📁 Proje: ${PROJECT_CODE}`);
    console.log(`📊 Toplam Suite: ${testData.suites.length}`);

    let totalCases = 0;
    testData.suites.forEach(s => totalCases += s.cases.length);
    console.log(`📋 Toplam Test Case: ${totalCases}\n`);

    let successSuites = 0;
    let successCases = 0;

    for (const suite of testData.suites) {
        // Suite oluştur
        const suiteId = await createSuite(PROJECT_CODE, suite.title);

        if (suiteId) {
            successSuites++;

            // Test case'leri oluştur
            for (const testCase of suite.cases) {
                const caseId = await createTestCase(PROJECT_CODE, suiteId, testCase);
                if (caseId) successCases++;

                // Rate limit için bekle
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        console.log('');
    }

    console.log('═══════════════════════════════════════');
    console.log(`✅ Import Tamamlandı!`);
    console.log(`📁 Suite: ${successSuites}/${testData.suites.length}`);
    console.log(`📋 Test Case: ${successCases}/${totalCases}`);
    console.log('═══════════════════════════════════════');
}

// API Token kontrolü
if (API_TOKEN === 'YOUR_API_TOKEN_HERE') {
    console.log('⚠️  API Token ayarlanmamış!\n');
    console.log('Adımlar:');
    console.log('1. https://app.qase.io/user/api/token adresine git');
    console.log('2. "Create new API token" tıkla');
    console.log('3. Token\'ı kopyala');
    console.log('4. Bu dosyada API_TOKEN değerini değiştir');
    console.log('5. node qase_import.js komutunu çalıştır\n');
} else {
    importAll().catch(console.error);
}
