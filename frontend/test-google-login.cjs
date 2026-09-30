const puppeteer = require('puppeteer-core');

async function testGoogleLogin() {
  console.log('🚀 Starting Puppeteer browser for Gmail Login Test...');
  const browser = await puppeteer.launch({
    executablePath: '/opt/google/chrome/chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    console.log('🌐 Navigating to http://localhost:3009/en/login...');
    await page.goto('http://localhost:3009/en/login', { waitUntil: 'networkidle2', timeout: 30000 });

    // 1. Check for "Continue with Google / Gmail" button
    console.log('🔍 Looking for Google / Gmail login button...');
    const buttons = await page.$$('button');
    let googleBtn = null;
    for (const b of buttons) {
      const text = await page.evaluate(el => el.innerText, b);
      if (text && (text.includes('Google') || text.includes('Gmail'))) {
        googleBtn = b;
        break;
      }
    }

    if (!googleBtn) {
      throw new Error('❌ "Continue with Google / Gmail" button not found on login page!');
    }
    console.log('✅ Found Google / Gmail login button. Clicking it...');
    await googleBtn.click();
    await new Promise(r => setTimeout(r, 1000));

    // 2. Check that the Google Sign-In Sheet / Modal opened
    console.log('🔍 Verifying Google Sign-In Modal is visible...');
    const modalHeading = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h3'));
      return headings.map(h => h.innerText).find(t => t.includes('Google'));
    });

    if (!modalHeading) {
      throw new Error('❌ Google Sign-In Modal did not appear!');
    }
    console.log(`✅ Google Modal verified open: "${modalHeading}"`);

    // 3. Test clicking the Verified Seller preset (kvrao.hyderabad@gmail.com)
    console.log('🔑 Clicking verified Google account (kvrao.hyderabad@gmail.com)...');
    const presetBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('kvrao.hyderabad@gmail.com'));
    });

    if (!presetBtn) {
      throw new Error('❌ Preset account button for kvrao.hyderabad@gmail.com not found!');
    }
    await presetBtn.click();
    console.log('✅ Clicked account preset. Waiting for authentication and redirect...');
    await new Promise(r => setTimeout(r, 2000));

    const currentUrl = page.url();
    console.log('📍 Current URL after Google Login:', currentUrl);
    if (!currentUrl.includes('/dashboard/seller') && !currentUrl.includes('/login')) {
      console.log('ℹ️ Redirected to:', currentUrl);
    }

    // Check localStorage auth state
    const authData = await page.evaluate(() => {
      return {
        token: localStorage.getItem('trh_auth_token'),
        user: localStorage.getItem('trh_auth_user'),
      };
    });

    if (!authData.token || !authData.user) {
      throw new Error('❌ Token or user not persisted in localStorage after Google login!');
    }

    const parsedUser = JSON.parse(authData.user);
    console.log('👤 Authenticated Google User in storage:', parsedUser.name, `(${parsedUser.email})`, `Role: ${parsedUser.role}`);

    if (parsedUser.email !== 'kvrao.hyderabad@gmail.com') {
      throw new Error(`❌ Expected email kvrao.hyderabad@gmail.com, got ${parsedUser.email}`);
    }

    // 4. Test custom Gmail address submission
    console.log('🌐 Returning to login page to test custom Gmail address...');
    // Clear storage
    await page.evaluate(() => {
      localStorage.clear();
      document.cookie = 'trh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = 'trh_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    });
    await page.goto('http://localhost:3009/en/login', { waitUntil: 'networkidle2', timeout: 30000 });

    const buttons2 = await page.$$('button');
    let googleBtn2 = null;
    for (const b of buttons2) {
      const text = await page.evaluate(el => el.innerText, b);
      if (text && (text.includes('Google') || text.includes('Gmail'))) {
        googleBtn2 = b;
        break;
      }
    }
    await googleBtn2.click();
    await new Promise(r => setTimeout(r, 1000));

    console.log('✍️ Typing custom Gmail address...');
    await page.evaluate(() => {
      const emailEl = document.querySelector('input[placeholder="yourname@gmail.com"]');
      if (emailEl) {
        const proto = Object.getPrototypeOf(emailEl);
        const setVal = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
        if (setVal) {
          setVal.call(emailEl, 'siva.krishna.investor@gmail.com');
          emailEl.dispatchEvent(new Event('input', { bubbles: true }));
          emailEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      const nameEl = document.querySelector('input[placeholder*="Siva" i], input[placeholder*="పేరు" i]');
      if (nameEl) {
        const proto = Object.getPrototypeOf(nameEl);
        const setVal = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
        if (setVal) {
          setVal.call(nameEl, 'Siva Krishna');
          nameEl.dispatchEvent(new Event('input', { bubbles: true }));
          nameEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });

    await new Promise(r => setTimeout(r, 500));

    // Check button state and click
    const btnInfo = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(btn => btn.innerText.includes('Continue with this Gmail') || btn.innerText.includes('Gmail తో కొనసాగించండి'));
      if (!b) return { found: false };
      const disabled = b.disabled;
      if (!disabled) b.click();
      return { found: true, disabled, text: b.innerText };
    });
    console.log('🔘 Button Info:', btnInfo);
    console.log('✅ Clicked "Continue with this Gmail". Waiting for authentication...');
    await new Promise(r => setTimeout(r, 2000));

    const customAuthData = await page.evaluate(() => {
      return {
        token: localStorage.getItem('trh_auth_token'),
        user: localStorage.getItem('trh_auth_user'),
      };
    });

    if (!customAuthData.token || !customAuthData.user) {
      throw new Error('❌ Custom Gmail login token/user not persisted in localStorage!');
    }

    const parsedCustom = JSON.parse(customAuthData.user);
    console.log('👤 Custom Gmail Authenticated User:', parsedCustom.name, `(${parsedCustom.email})`, `Role: ${parsedCustom.role}`);

    if (parsedCustom.email !== 'siva.krishna.investor@gmail.com') {
      throw new Error(`❌ Expected email siva.krishna.investor@gmail.com, got ${parsedCustom.email}`);
    }

    console.log('🎉 ALL GMAIL / GOOGLE LOGIN TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Google Login test failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

testGoogleLogin();
