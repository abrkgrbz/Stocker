/**
 * Qase.io Detayli Test Case Import Script
 *
 * Detayli test verileri ile yeni test case'ler yukler
 * Mevcut suite'leri yeniden kullanir veya yeni olusturur
 */

const API_TOKEN = 'dfbfaad3c35c109e393cb34d3226029a2d7f4199557dde6a3a297a400abd34ff';
const PROJECT_CODE = 'CRM';

const testData = require('./CRM_Test_Qase_Import_Detailed.json');

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

    const body = {
        title: testCase.title,
        description: testCase.description || '',
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
        console.log(`  ✅ Test Case: ${testCase.title}`);
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

async function importAll() {
    console.log('═══════════════════════════════════════');
    console.log('🚀 Qase.io DETAYLI Import Basliyor...');
    console.log('═══════════════════════════════════════\n');
    console.log(`📁 Proje: ${PROJECT_CODE}`);
    console.log(`📊 Toplam Suite: ${testData.suites.length}`);

    let totalCases = 0;
    testData.suites.forEach(s => totalCases += s.cases.length);
    console.log(`📋 Toplam Test Case: ${totalCases}\n`);

    // Once mevcut suite'leri temizle
    await clearExistingSuites();

    let successSuites = 0;
    let successCases = 0;

    for (const suite of testData.suites) {
        // Suite olustur
        const suiteId = await createSuite(PROJECT_CODE, suite.title);

        if (suiteId) {
            successSuites++;

            // Test case'leri olustur
            for (const testCase of suite.cases) {
                const caseId = await createTestCase(PROJECT_CODE, suiteId, testCase);
                if (caseId) successCases++;

                // Rate limit icin bekle
                await new Promise(resolve => setTimeout(resolve, 250));
            }
        }

        console.log('');
    }

    console.log('═══════════════════════════════════════');
    console.log(`✅ DETAYLI Import Tamamlandi!`);
    console.log(`📁 Suite: ${successSuites}/${testData.suites.length}`);
    console.log(`📋 Test Case: ${successCases}/${totalCases}`);
    console.log('═══════════════════════════════════════');
    console.log('\n📝 Not: Test verileri preconditions alanina eklendi');
}

importAll().catch(console.error);
