/**
 * Playwright Debug Script - Authentication Redirect Loop Analysis
 *
 * Bu script auth.stoocker.app login flow'unu takip eder ve:
 * - Tüm redirect chain'i detaylı loglar
 * - Cookie değişimlerini izler
 * - Network request/response'ları kaydeder
 * - Her adımda screenshot alır
 * - Browser console çıktılarını yakalar
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Çıktı dizinleri
const OUTPUT_DIR = path.join(__dirname, 'debug-output');
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');

// Debug verileri
const debugData = {
  redirectChain: [],
  cookies: [],
  networkLogs: [],
  consoleLogs: [],
  timestamp: new Date().toISOString()
};

// Test credentials
const EMAIL = process.env.TEST_EMAIL || 'anilberk1997@hotmail.com';
const PASSWORD = process.env.TEST_PASSWORD || 'A.bg010203';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function debugAuthFlow() {
  console.log('🚀 Playwright Auth Debug başlatılıyor...\n');

  const browser = await chromium.launch({
    headless: false, // Görsel debug için
    slowMo: 500 // Her işlem arası 500ms bekle (görüntü için)
  });

  const context = await browser.newContext({
    ignoreHTTPSErrors: true, // SSL sorunlarını görmezden gel
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();
  let stepCounter = 0;

  // Console mesajlarını yakala
  page.on('console', msg => {
    const logEntry = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };
    debugData.consoleLogs.push(logEntry);
    console.log(`📝 Console [${msg.type()}]:`, msg.text());
  });

  // Network isteklerini izle
  page.on('request', request => {
    const logEntry = {
      step: stepCounter,
      type: 'request',
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      timestamp: new Date().toISOString()
    };
    debugData.networkLogs.push(logEntry);
    console.log(`🌐 Request: ${request.method()} ${request.url()}`);
  });

  // Network yanıtlarını izle
  page.on('response', async response => {
    const logEntry = {
      step: stepCounter,
      type: 'response',
      url: response.url(),
      status: response.status(),
      headers: response.headers(),
      timestamp: new Date().toISOString()
    };
    debugData.networkLogs.push(logEntry);

    if (response.status() >= 300 && response.status() < 400) {
      const location = response.headers()['location'];
      console.log(`🔄 Redirect: ${response.status()} → ${location || 'N/A'}`);
    }
    console.log(`✅ Response: ${response.status()} ${response.url()}`);
  });

  // Navigation tracking
  page.on('framenavigated', async frame => {
    if (frame === page.mainFrame()) {
      stepCounter++;
      const currentUrl = frame.url();
      const cookies = await context.cookies();

      const navigationEntry = {
        step: stepCounter,
        url: currentUrl,
        timestamp: new Date().toISOString(),
        cookies: cookies.map(c => ({
          name: c.name,
          value: c.value,
          domain: c.domain,
          path: c.path,
          secure: c.secure,
          httpOnly: c.httpOnly,
          sameSite: c.sameSite
        }))
      };

      debugData.redirectChain.push(navigationEntry);
      console.log(`\n📍 Step ${stepCounter}: ${currentUrl}`);
      console.log(`🍪 Cookies: ${cookies.length} cookie(s) found`);

      // Screenshot al
      const screenshotPath = path.join(SCREENSHOTS_DIR, `step-${stepCounter}-${Date.now()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Screenshot: ${screenshotPath}`);
    }
  });

  try {
    // Step 1: Login sayfasına git
    console.log('\n=== STEP 1: Login Sayfasına Gidiş ===');
    await page.goto('https://auth.stoocker.app/login', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await sleep(3000);

    // Form elementlerini kontrol et
    console.log('\n=== Form Elementlerini İnceleme ===');
    const pageContent = await page.content();
    const inputs = await page.$$('input');
    console.log(`📋 Toplam ${inputs.length} input bulundu`);

    for (let i = 0; i < inputs.length; i++) {
      const type = await inputs[i].getAttribute('type');
      const name = await inputs[i].getAttribute('name');
      const id = await inputs[i].getAttribute('id');
      const placeholder = await inputs[i].getAttribute('placeholder');
      console.log(`   Input ${i+1}: type="${type}" name="${name}" id="${id}" placeholder="${placeholder}"`);
    }

    // Step 2: Email gir (dinamik selector)
    console.log('\n=== STEP 2: Email Girişi ===');
    const emailInput = await page.$('input[type="email"]') ||
                       await page.$('input[name="email"]') ||
                       await page.$('input[placeholder*="mail" i]') ||
                       await page.$('input[placeholder*="e-posta" i]');

    if (!emailInput) {
      throw new Error('Email input bulunamadı!');
    }

    await emailInput.fill(EMAIL);
    console.log('✅ Email girildi');
    await sleep(1000);

    // Email girişinden sonra "İleri" / "Devam" butonu olabilir
    console.log('\n=== Email Sonrası Buton Kontrolü ===');
    const emailContinueButton = await page.$('button[type="submit"]') ||
                                 await page.$('button:has-text("İleri")') ||
                                 await page.$('button:has-text("Devam")') ||
                                 await page.$('button:has-text("Next")') ||
                                 await page.$('button:has-text("Continue")');

    if (emailContinueButton) {
      console.log('🔘 Email devam butonu bulundu, tıklanıyor...');
      await emailContinueButton.click();
      await sleep(2000); // Şifre input'unun yüklenmesini bekle

      console.log('⏳ Şifre input\'u bekleniyor...');
      await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    }

    // Step 3: Şifre gir (dinamik selector)
    console.log('\n=== STEP 3: Şifre Girişi ===');
    const passwordInput = await page.$('input[type="password"]') ||
                          await page.$('input[name="password"]') ||
                          await page.$('input[placeholder*="şifre" i]') ||
                          await page.$('input[placeholder*="password" i]');

    if (!passwordInput) {
      // Tekrar form elementlerini kontrol et
      const currentInputs = await page.$$('input');
      console.log(`📋 Şu an ${currentInputs.length} input var`);
      for (let i = 0; i < currentInputs.length; i++) {
        const type = await currentInputs[i].getAttribute('type');
        const placeholder = await currentInputs[i].getAttribute('placeholder');
        console.log(`   Input ${i+1}: type="${type}" placeholder="${placeholder}"`);
      }
      throw new Error('Password input bulunamadı!');
    }

    await passwordInput.fill(PASSWORD);
    console.log('✅ Şifre girildi');
    await sleep(1000);

    // Step 4: Login butonuna tıkla
    console.log('\n=== STEP 4: Login Butonuna Tıklama ===');

    const buttons = await page.$$('button');
    console.log(`🔘 Toplam ${buttons.length} buton bulundu`);

    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const type = await buttons[i].getAttribute('type');
      console.log(`   Button ${i+1}: type="${type}" text="${text.trim()}"`);
    }

    // Login butonunu bul ve tıkla
    const submitButton = await page.$('button[type="submit"]') ||
                         await page.$('button:has-text("Giriş")') ||
                         await page.$('button:has-text("Login")') ||
                         buttons[0]; // Fallback: ilk buton

    if (!submitButton) {
      throw new Error('Submit button bulunamadı!');
    }

    console.log('🔘 Login butonuna tıklanıyor...');

    // Redirect chain'i izlemek için navigation promise'i al
    const navigationPromise = page.waitForNavigation({
      waitUntil: 'domcontentloaded',
      timeout: 60000
    }).catch(e => console.log('⚠️ Navigation timeout (beklenen bir durum olabilir)'));

    // Tıkla
    await submitButton.click();
    console.log('✅ Buton tıklandı, redirect bekleniyor...');

    // Navigation'ı bekle
    await navigationPromise;
    await sleep(5000); // Daha uzun bekle - redirect chain için

    // Step 5: Son durumu kontrol et
    console.log('\n=== STEP 5: Son Durum Kontrolü ===');
    const finalUrl = page.url();
    const finalCookies = await context.cookies();

    console.log(`\n📊 Son URL: ${finalUrl}`);
    console.log(`🍪 Final Cookies: ${finalCookies.length} cookie(s)`);

    debugData.finalState = {
      url: finalUrl,
      cookies: finalCookies,
      timestamp: new Date().toISOString()
    };

    // Redirect loop detection
    const urls = debugData.redirectChain.map(r => r.url);
    const uniqueUrls = [...new Set(urls)];
    const isLoop = urls.length > uniqueUrls.length;

    console.log(`\n🔍 Redirect Analizi:`);
    console.log(`   Total navigations: ${urls.length}`);
    console.log(`   Unique URLs: ${uniqueUrls.length}`);
    console.log(`   Loop detected: ${isLoop ? '🚨 EVET' : '✅ HAYIR'}`);

    if (isLoop) {
      console.log(`\n🚨 REDIRECT LOOP TESPİT EDİLDİ!`);
      console.log(`   Chain: ${urls.join(' → ')}`);
    }

  } catch (error) {
    console.error('\n❌ Hata oluştu:', error.message);
    debugData.error = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
  } finally {
    // Debug verilerini kaydet
    console.log('\n💾 Debug verileri kaydediliyor...');

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'redirect-chain.json'),
      JSON.stringify(debugData.redirectChain, null, 2)
    );

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'cookies.json'),
      JSON.stringify(debugData.cookies, null, 2)
    );

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'network-logs.json'),
      JSON.stringify(debugData.networkLogs, null, 2)
    );

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'console-logs.json'),
      JSON.stringify(debugData.consoleLogs, null, 2)
    );

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'full-debug-report.json'),
      JSON.stringify(debugData, null, 2)
    );

    console.log('✅ Debug verileri kaydedildi:');
    console.log(`   - ${OUTPUT_DIR}/redirect-chain.json`);
    console.log(`   - ${OUTPUT_DIR}/cookies.json`);
    console.log(`   - ${OUTPUT_DIR}/network-logs.json`);
    console.log(`   - ${OUTPUT_DIR}/console-logs.json`);
    console.log(`   - ${OUTPUT_DIR}/full-debug-report.json`);
    console.log(`   - ${SCREENSHOTS_DIR}/*.png`);

    // 10 saniye bekle (kullanıcı son durumu görsün)
    console.log('\n⏳ 10 saniye bekleniyor (son durumu inceleyebilirsiniz)...');
    await sleep(10000);

    await context.close();
    await browser.close();

    console.log('\n✅ Debug tamamlandı!');
  }
}

// Script'i çalıştır
debugAuthFlow().catch(console.error);
