const fs = require('fs');
const readline = require('readline');
const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
let driver;
let login;
let url;

//login logout

async function login_logout() {
  driver = await new Builder().forBrowser('chrome')
  .build();
  await driver.manage().setTimeouts( { implicit: 25000, pageLoad: 
    25000, script: 25000 } )
  fs.readFile('login.json', 'utf8', function (err, data) {
      if (err) throw err;
      login = JSON.parse(data);
    });
  try {
    await driver.get('https://www.linkedin.com/');
    await driver.findElement(By.id('login-email')).sendKeys(login.email);
    await driver.findElement(By.id('login-password')).sendKeys(login.password);
    await driver.findElement(By.id('login-submit')).click();
    url = await driver.getCurrentUrl();
    await assert.strictEqual(url, 'https://www.linkedin.com/feed/');
    await driver.findElement(By.id('nav-settings__dropdown-trigger')).click();
    await driver.findElement(By.className("nav-dropdown__item nav-settings__dropdown-item nav-dropdown__action t-14 t-black t-bold")).click();
    url = await driver.getCurrentUrl();
    await assert.equal(url, 'https://www.linkedin.com/');
  } finally {
    console.log("login-logout test passed!");
    await driver.quit();
    upload();
  }
}

login_logout();
//keypad();
//upload files

function create_file(file, content)
{
  fs.appendFile('test/test_files/' + file, content, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
}
function delete_file(file)
{
  fs.unlink('test/test_files/' + file, function (err) {
    if (err) throw err;
    console.log('Deleted!');
  });
}


async function upload() {
  driver = await new Builder().forBrowser('firefox').build();
  await driver.manage().setTimeouts( { implicit: 25000, pageLoad:
    25000, script: 25000 } )
  await  create_file("test_1.txt", "test1");
  await  create_file("test_2.txt", "test2");
  await  create_file("test_3.txt", "test3");
  try {
    await driver.get('http://uitestpractice.com/Students/Widgets');
    let upl = await driver.findElement(By.id('image_file'));
    let but = driver.findElement(By.xpath("//input[@type='button']"));
    await upl.sendKeys(process.cwd() + '/test/test_files/test_1.txt');
    await but.click();
    await driver.wait(until.elementLocated(By.className("ContactUs")), 50000);
    await upl.sendKeys(process.cwd() + '/test/test_files/test_2.txt');
    await but.click();
    await driver.wait(until.elementLocated(By.className("ContactUs")), 50000);
    await upl.sendKeys(process.cwd() + '/test/test_files/test_3.txt');
    await but.click();
  } finally {
    await  delete_file("test_1.txt");
    await  delete_file("test_2.txt");
    await  delete_file("test_3.txt");
    console.log("upload files test passed!");
    await driver.quit();
    keypad();
  }
}

//test keypad

async function keypad() {
  driver = await new Builder().forBrowser('chrome').build();
  await driver.manage().setTimeouts( { implicit: 15000, pageLoad: 
    15000, script: 15000 } )
  try {
    await driver.get('https://stackoverflow.com/');
    let ac = await driver.switchTo().activeElement();
    for(let i = 0;i < 10;i++)
      await ac.sendKeys(Key.ARROW_DOWN);
    for(let i = 0;i < 10;i++)
      await ac.sendKeys(Key.ARROW_UP);
    await driver.findElement(By.id('display-name')).click();
    await driver.findElement(By.id('display-name')).sendKeys("Ihor");
    for(let i = 0;i < 10;i++)
      await ac.sendKeys(Key.TAB);
    for(let i = 0;i < 10;i++)
      await ac.sendKeys(Key.SHIFT,Key.TAB);
    await driver.findElement(By.id('display-name')).sendKeys(Key.BACK_SPACE); 
  } finally {
    console.log("keypad test passed!");
    await driver.quit();
    screenshots();
  }
}

//screenshots in browser

function write_screen(file, driver)
{
  driver.takeScreenshot().then(
    function(image, err) {
        fs.writeFile('screenshots/' + file, image, 'base64', function(err) {
            if(err)
              throw err;
        });
    }
  )
}

async function screenshots() {
  driver = await new Builder().forBrowser('chrome').build();
  await driver.manage().setTimeouts( { implicit: 15000, pageLoad: 
    15000, script: 15000 } )
  try {
    let tabs;
    await driver.get('https://www.linkedin.com/');
    await driver.executeScript('window.open("https://www.google.com.ua/");');
    await driver.executeScript('window.open("https://www.w3schools.com/");');
    tabs = await driver.getAllWindowHandles();
    for(let i = 0;i < tabs.length;i++)
    {
      await driver.switchTo().window(tabs[i]);
      await write_screen('screen_' + i + '.png', driver);
    }
  } finally {
    console.log("screenshoots test passed!");
    await driver.quit();
    headless();
  }
}

//headless enviroment

async function headless() {
  driver = await new Builder().forBrowser('chrome')
  .setChromeOptions(new chrome.Options().headless())
  .build();
  await driver.manage().setTimeouts( { implicit: 25000, pageLoad: 
    25000, script: 25000 } )
  try {
    await driver.get('https://www.google.com/ncr');
    await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
    await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
    await driver.get('http://www.google.com/ncr');
    let url = await driver.getCurrentUrl();
    assert.equal(url, 'https://www.google.com/');
  } finally {
    console.log("headless mode test passed!")
    await driver.quit();
    frames_alerts();
  }
}

// frames_alerts

async function frames_alerts() {
  driver = await new Builder().forBrowser('chrome')
  .build();
  await driver.manage().setTimeouts( { implicit: 25000, pageLoad: 
    25000, script: 25000 } )
  try {
    await driver.get('http://uitestpractice.com/Students/Switchto');
    await driver.findElement(By.id("alert")).click();
    await driver.switchTo().alert().accept();
    await driver.findElement(By.id("confirm")).click();
    await driver.switchTo().alert().dismiss();
    await driver.findElement(By.id("prompt")).click();
    await driver.switchTo().alert().sendKeys("Ihor");
    await driver.switchTo().alert().accept();
    await driver.switchTo().frame("iframe_a");
    await driver.findElement(By.id("name")).sendKeys("Ihor");
  } finally {
    console.log("Frames and alerts test passed!");
    await driver.quit();
    js_inside();
  }
};

//js_inside

async function js_inside() {
  driver = await new Builder().forBrowser('chrome')
  .build();
  await driver.manage().setTimeouts( { implicit: 15000, pageLoad: 
    15000, script: 15000 } )
  try {
    await driver.get('http://uitestpractice.com/Students/Select');
    await driver.executeScript("document.getElementById('countriesSingle').selectedIndex = 1");
    await driver.executeScript("let sel = document.getElementById('countriesMultiple');for( let i = 0; i < sel.options.length; i++){sel.options[i].selected = true;}");
    await driver.executeScript("document.getElementById('dropdownMenu1').click();");
  } finally {
    console.log("Javascript-inside test passed!");
    await driver.quit();
  }
}
