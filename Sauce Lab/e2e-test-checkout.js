
const { remote } = require('webdriverio');
const assert = require('node:assert/strict');

async function main() {
  const driver = await remote({
    logLevel: 'warn',
    hostname: '127.0.0.1',
    port: 4723,
    capabilities: {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Samsung',
      'appium:appPackage': 'com.saucelabs.mydemoapp.android',
      'appium:appActivity': '.view.activities.SplashActivity',
      'appium:appWaitActivity': '*',
      'appium:noReset': true,
      'appium:appWaitDuration': 30000,
    },
  });

  function convertPriceToNumber(price) {
    const numericPrice = price
      .replace('$', '')
      .trim()
      .replace(',', '.');
  
    return Number(numericPrice);
  }

  try {
    // Step 1 : Buka aplikasi
    await driver.activateApp('com.saucelabs.mydemoapp.android');
    await driver.pause(2000);
    console.log('Berhasil terhubung ke SauceLab!');

    // Step 2: Pilih produk
    const product = await driver.$('//*[@text="Sauce Labs Backpack"]/preceding-sibling::android.widget.ImageView');
    const product_price = 
      convertPriceToNumber (
        await driver
        .$('//*[@text="Sauce Labs Backpack"]/following-sibling::*[@resource-id="com.saucelabs.mydemoapp.android:id/priceTV"]')
        .getText()
      );

    await product.click();

    // Step 3: Tentukan kuantitas produk (2)
    let quantity = 3
    let current_total_item = Number(await driver.$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/noTV"]').getText());

    const increase_button = await driver.$('//*[@content-desc="Increase item quantity"]');

    while(current_total_item !== quantity) {
      await increase_button.click();
      current_total_item = Number(await driver.$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/noTV"]').getText());
    }

    // Step 4: Add to cart
    const add_to_cart_button = await driver.$('//*[@content-desc="Tap to add product to cart"]');
    const cart_button = await driver.$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/cartRL"]');
    await add_to_cart_button.click();
    await cart_button.click();

    // Step 5: Validasi harga di halaman cart
    const total_price = convertPriceToNumber( 
      await driver.$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/totalPriceTV"]').getText()
    );
    assert.equal(total_price, product_price*quantity, 'Total harga di cart tidak sesuai');

    // Step 6: Proses ke checkout
    const checkout_button = await driver.$('//*[@content-desc="Confirms products for checkout"]');
    await checkout_button.click();

    // To be continue...

  } catch (error) {
    console.error('Test gagal:', error.message);
  } finally {
    await driver.deleteSession();
  }
}

main();