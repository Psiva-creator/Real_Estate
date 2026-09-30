const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  console.log('🚀 Launching headless Chrome...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });

  console.log('🌐 Navigating to /en/list-property...');
  await page.goto('http://localhost:3000/en/list-property', { waitUntil: 'networkidle2' });

  // Step 1: Select Property Type (LAND is selected by default, or click Next)
  console.log('👉 Advancing past Step 1...');
  const nextBtn = await page.waitForSelector('button:has-text("Next"), button:has-text("Continue"), form button[type="button"]', { timeout: 5000 });
  
  // Find the Next Step button
  const clickNext = async () => {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && (b.textContent.includes('Next') || b.textContent.includes('ముందుకు')));
      if (btn) btn.click();
    });
  };

  await clickNext();
  await new Promise(r => setTimeout(r, 800));

  // Step 2: Fill Basic Info
  console.log('👉 Filling Step 2 fields...');
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    const textInputs = inputs.filter(i => i.type === 'text' || i.type === 'number');
    textInputs.forEach(input => {
      if (input.placeholder.toLowerCase().includes('title') || input.name === 'title') {
        input.value = 'Premium Commercial Plot Kokapet';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (input.placeholder.toLowerCase().includes('price') || input.name === 'totalPrice') {
        input.value = '25000000';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (input.placeholder.toLowerCase().includes('zone') || input.name === 'zone') {
        input.value = 'Commercial Zone';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });

  await clickNext();
  await new Promise(r => setTimeout(r, 1200));

  console.log('📍 On Step 3: Location & Map');
  await page.screenshot({ path: path.join(screenshotDir, '1_step3_mounted.png') });

  // Wait for map container and tiles
  await page.waitForSelector('.leaflet-container', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000));

  // Check map state
  const checkMapStatus = async (label) => {
    return await page.evaluate((lbl) => {
      const mapEl = document.querySelector('.leaflet-container');
      if (!mapEl) return { label: lbl, exists: false };
      const tiles = Array.from(mapEl.querySelectorAll('.leaflet-tile-pane img'));
      const loadedTiles = tiles.filter(t => t.complete && t.naturalWidth > 0);
      const bounds = mapEl.getBoundingClientRect();
      return {
        label: lbl,
        exists: true,
        width: bounds.width,
        height: bounds.height,
        totalTiles: tiles.length,
        loadedTiles: loadedTiles.length,
        tileSrcSample: tiles[0]?.src?.substring(0, 70),
      };
    }, label);
  };

  let status1 = await checkMapStatus('Initial Satellite View');
  console.log('STATUS:', status1);
  await page.screenshot({ path: path.join(screenshotDir, '2_satellite_initial.png') });

  // 1. Switch to Street View
  console.log('🔄 Switching to Street View option...');
  const streetBtn = await page.$('#map-street-toggle');
  if (streetBtn) {
    await streetBtn.click();
    await new Promise(r => setTimeout(r, 1500));
  }
  let status2 = await checkMapStatus('After Street Toggle');
  console.log('STATUS:', status2);
  await page.screenshot({ path: path.join(screenshotDir, '3_street_view.png') });

  // 2. Switch back to Satellite View
  console.log('🔄 Switching back to Satellite View option...');
  const satBtn = await page.$('#map-satellite-toggle');
  if (satBtn) {
    await satBtn.click();
    await new Promise(r => setTimeout(r, 1500));
  }
  let status3 = await checkMapStatus('After Satellite Toggle');
  console.log('STATUS:', status3);
  await page.screenshot({ path: path.join(screenshotDir, '4_satellite_view.png') });

  // 3. Change Options / Form inputs (District, Mandal, Village)
  console.log('✍️ Changing District, Mandal, Village form options...');
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    const distInput = inputs.find(i => i.placeholder.toLowerCase().includes('district') || i.name === 'district');
    const mandalInput = inputs.find(i => i.placeholder.toLowerCase().includes('mandal') || i.name === 'mandal');
    const villageInput = inputs.find(i => i.placeholder.toLowerCase().includes('village') || i.name === 'village');

    if (distInput) {
      distInput.value = 'Rangareddy';
      distInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (mandalInput) {
      mandalInput.value = 'Rajendranagar';
      mandalInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (villageInput) {
      villageInput.value = 'Narsingi';
      villageInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  await new Promise(r => setTimeout(r, 1500));
  let status4 = await checkMapStatus('After Form Options Changed');
  console.log('STATUS:', status4);
  await page.screenshot({ path: path.join(screenshotDir, '5_form_options_changed.png') });

  // 4. Test Plotting Preset
  console.log('📐 Clicking Quick 4-Corner Plot Preset...');
  const presetBtn = await page.$('#map-quick-preset-btn');
  if (presetBtn) {
    await presetBtn.click();
    await new Promise(r => setTimeout(r, 1000));
  }
  let status5 = await checkMapStatus('After Plot Boundary Placed');
  console.log('STATUS:', status5);
  await page.screenshot({ path: path.join(screenshotDir, '6_plot_preset_placed.png') });

  // 5. Test step jumping back and forward
  console.log('⏮️ Jumping back to Step 1 and then back to Step 3...');
  await page.evaluate(() => {
    const stepBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && (b.textContent.includes('Type') || b.textContent.includes('రకం')));
    if (stepBtns[0]) stepBtns[0].click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const stepBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && (b.textContent.includes('Location') || b.textContent.includes('లొకేషన్')));
    if (stepBtns[0]) stepBtns[0].click();
  });
  await new Promise(r => setTimeout(r, 2000));

  let status6 = await checkMapStatus('After Step Jump Back & Forward');
  console.log('STATUS:', status6);
  await page.screenshot({ path: path.join(screenshotDir, '7_step_jump_revisit.png') });

  await browser.close();
  console.log('✅ All map option change tests completed successfully!');
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
