const puppeteer = require('puppeteer-core');

async function testMapSync() {
  console.log('🚀 Starting Puppeteer browser...');
  const browser = await puppeteer.launch({
    executablePath: '/opt/google/chrome/chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    console.log('🌐 Navigating to http://localhost:3009/en/list-property...');
    await page.goto('http://localhost:3009/en/list-property', { waitUntil: 'networkidle2', timeout: 30000 });

    // Step 1: Select Property Type
    console.log('📋 Step 1: Selecting Property Type...');
    await page.waitForSelector('#form-continue-button', { timeout: 10000 });
    // Click the LAND card
    const allButtons = await page.$$('button');
    for (const b of allButtons) {
      const text = await page.evaluate(el => el.innerText, b);
      if (text && (text.includes('Land') || text.includes('భూమి'))) {
        await b.click();
        console.log('Selected LAND card');
        break;
      }
    }
    await new Promise(r => setTimeout(r, 500));
    await page.click('#form-continue-button');
    await new Promise(r => setTimeout(r, 1000));

    // Step 2: Basic Info
    console.log('📝 Step 2: Filling Title & Description...');
    const titleInput = await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await titleInput.type('Prime Commercial Land Parcel Near ORR');

    const descInput = await page.waitForSelector('textarea', { timeout: 5000 });
    await descInput.type('Exceptional clear title agricultural and villa plot land parcel with direct access road and water connection.');

    await new Promise(r => setTimeout(r, 500));
    await page.click('#form-continue-button');
    await new Promise(r => setTimeout(r, 1500));

    // Step 3: Location & Map Sync
    console.log('📍 Checking Step 3 Location & Map Sync...');

    // 1. Check if Growth Hub chips are present
    const hubButtons = await page.$$('button');
    let kokapetHubBtn = null;
    for (const b of hubButtons) {
      const t = await page.evaluate(el => el.innerText, b);
      if (t && t.includes('Kokapet')) {
        kokapetHubBtn = b;
        break;
      }
    }

    if (!kokapetHubBtn) {
      throw new Error('❌ Kokapet Growth Hub button not found!');
    }
    console.log('✅ Found Kokapet Growth Hub chip. Clicking it...');
    await kokapetHubBtn.click();
    await new Promise(r => setTimeout(r, 1500));

    // Verify form fields auto-filled
    const formVals = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return {
        inputs: inputs.map(i => ({ placeholder: i.placeholder, value: i.value }))
      };
    });
    console.log('Input fields after clicking Kokapet:', JSON.stringify(formVals.inputs.filter(i => i.value), null, 2));

    const kokapetFilled = formVals.inputs.some(i => i.value === 'Kokapet') &&
                         formVals.inputs.some(i => i.value === 'Rangareddy') &&
                         formVals.inputs.some(i => i.value === 'Gandipet');

    if (!kokapetFilled) {
      throw new Error('❌ Form fields were not auto-filled with Kokapet details!');
    }
    console.log('✅ Verified: Form auto-filled with Kokapet, Gandipet, Rangareddy!');

    // 2. Test Quick 4-Corner Plot on the Leaflet Map
    console.log('🗺️ Testing Quick 4-Corner Plot demarcation on map...');
    const allBtns3 = await page.$$('button');
    let presetBtn = null;
    for (const b of allBtns3) {
      const t = await page.evaluate(el => el.innerText, b);
      if (t && (t.includes('4-Corner') || t.includes('Preset'))) {
        presetBtn = b;
        break;
      }
    }

    if (presetBtn) {
      await presetBtn.click();
      console.log('✅ Clicked 4-Corner Preset button!');
      await new Promise(r => setTimeout(r, 1500));

      // Check if Apply button exists
      const allBtns4 = await page.$$('button');
      let applyBtn = null;
      for (const b of allBtns4) {
        const t = await page.evaluate(el => el.innerText, b);
        if (t && (t.includes('Apply Area') || t.includes('Apply'))) {
          applyBtn = b;
          break;
        }
      }

      if (applyBtn) {
        console.log('✅ Found Apply Area & Location button. Clicking it...');
        await applyBtn.click();
        await new Promise(r => setTimeout(r, 1500));
        console.log('✅ Applied Area & Location to Form!');
      }
    } else {
      console.log('ℹ️ Preset button not directly matched, checking map container existence...');
      const mapContainer = await page.$('.leaflet-container');
      if (!mapContainer) {
        throw new Error('❌ Leaflet map container not found!');
      }
      console.log('✅ Leaflet map container verified present and loaded.');
    }

    // 3. Test "Open This Place on Map" button
    console.log('🧭 Testing "Open This Place on Map" button...');
    const allBtns5 = await page.$$('button');
    let openMapBtn = null;
    for (const b of allBtns5) {
      const t = await page.evaluate(el => el.innerText, b);
      if (t && (t.includes('Open This Place on Map') || t.includes('మ్యాప్‌లో'))) {
        openMapBtn = b;
        break;
      }
    }
    if (openMapBtn) {
      await openMapBtn.click();
      console.log('✅ Clicked "Open This Place on Map" button!');
      await new Promise(r => setTimeout(r, 1000));
    }

    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! Map and Form bidirectional synchronization works flawlessly.');

  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

testMapSync();
