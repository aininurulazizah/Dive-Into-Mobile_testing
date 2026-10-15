
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

    // Step 7: Login
    const usernameField = await driver.$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/nameET"]');
    const passwordField = await driver.$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/passwordET"]');
    const loginButton = await driver.$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/loginBtn"]');
    await usernameField.setValue("qctiketux");
    await passwordField.setValue("qctiketux");
    await loginButton.click();

    // Step 8: Isi Data Pengiriman
    const fullNameField = await driver.$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/fullNameET"]');
    const addressField = await driver.$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/address1ET"]');
    const cityField = await driver.$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/cityET"]');
    const regionField = await driver.$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/stateET"]');
    const zipCodeField = await driver.$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/zipET"]');
    const countryField = await driver.$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/countryET"]');
    const toPaymentButton = await driver.$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/paymentBtn"]');
    await fullNameField.setValue("QC Tiketux");
    await addressField.setValue("Jl. Purbasari");
    await cityField.setValue("Cimahi");
    await regionField.setValue("Jawa Barat");
    await zipCodeField.setValue("1234");
    await countryField.setValue("Indonesia");
    await toPaymentButton.click();

    // Step 9: Isi Data Metode Payment
    const cardNumberField = await driver.$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/cardNumberET"]');
    const expirationDateField = await driver.$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/expirationDateET"]');
    const securityCodeField = await driver.$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/securityCodeET"]');
    await usernameField.setValue("QC Tiketux");
    await cardNumberField.setValue("123456789090");
    await expirationDateField.setValue("10/26");
    await securityCodeField.setValue("1234");
    await toPaymentButton.click();

    // Step 10: Review Pesanan
    const delivery_fee_elm = await driver.$('//*[@text="DHL Standard Delivery"]/following-sibling::*[@resource-id="com.saucelabs.mydemoapp.android:id/amountTV"]');
    await delivery_fee_elm.scrollIntoView();
    const delivery_fee = convertPriceToNumber(await delivery_fee_elm.getText());
    const total_payment = convertPriceToNumber(
      await driver
        .$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/totalAmountTV"]')
        .getText()
    )
    assert.equal(total_payment, total_price+delivery_fee, "Total bayar saat review pesanan tidak sesuai");
    await toPaymentButton.click();

    // Validasi berhasil pesan
    const coCompleteText = await driver.$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/completeTV"]');
    await coCompleteText.isExisting();

  } catch (error) {
    console.error('Test gagal:', error.message);
  } finally {
    await driver.deleteSession();
  }
}

main();