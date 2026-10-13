
const { remote } = require('webdriverio');

const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
  const driver = await remote({
    logLevel: 'warn',
    hostname: '127.0.0.1',
    port: 4723,
    capabilities: {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Samsung',
      'appium:appPackage': 'io.appium.android.apis',
      'appium:appActivity': '.ApiDemos',
      'appium:noReset': true,
      'appium:appWaitDuration': 30000,
    },
  });

  try {
    await driver.activateApp('io.appium.android.apis');
    await driver.pause(2000);
    console.log('Berhasil terhubung ke ApiDemos!');

    // Ambil hierarchy elemen pada layar
    let pageSource;
    
    // Simpan page source ke file XML
    pageSource = await driver.getPageSource();
    const filePath = path.join(__dirname, 'pagesource.xml');
    await fs.appendFile(filePath, pageSource, 'utf8');


    // Menemukan teks Api Demos
    const title = await driver.$('android=new UiSelector().text("API Demos")');
    const pageText = await title.getText();
    console.log('Teks yang ditemukan:', pageText);

    // Klik menu "Views"
    const viewsMenu = await driver.$('android=new UiSelector().description("Views")');
    await viewsMenu.click();
    
    pageSource = await driver.getPageSource();
    await fs.appendFile(filePath, pageSource, 'utf8');

    // Klik Button di dalam menu Views
    let buttonMenu = await driver.$('android=new UiSelector().description("Buttons")');
    await buttonMenu.click();

    pageSource = await driver.getPageSource();
    await fs.appendFile(filePath, pageSource, 'utf8');

    // Kembali ke halaman sebelumnya (Views)
    await driver.back();

    // Scroll ke Webview
    const webViewMenu = await driver.$(
      'android=new UiScrollable(' +
        'new UiSelector().scrollable(true)' +
      ').scrollIntoView(' +
        'new UiSelector().text("WebView")' +
      ')'
    );
    await webViewMenu.click();

    // Kembali ke halaman sebelumnya (Views)
    await driver.back();

    // Scroll ke Webview
    buttonMenu = await driver.$(
      'android=new UiScrollable(' +
        'new UiSelector().scrollable(true)' +
      ').scrollIntoView(' +
        'new UiSelector().text("Buttons")' +
      ')'
    );
    await buttonMenu.click();

  } catch (error) {
    console.error('Test gagal:', error.message);
  } finally {
    await driver.deleteSession();
  }
}

main();