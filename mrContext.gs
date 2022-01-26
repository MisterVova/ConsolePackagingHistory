
/**
 * @typedef {Object} InfoМагазина
 * @property {string} name	
 * @property {string} Api_Key	
 * @property {string} Client_Id	
 */


let СтатусыМП = {
  delivered: "delivered",
  cancelled: "cancelled",
  delivering: "delivering",
  awaiting_deliver: "awaiting_deliver",
  awaiting_packaging: "awaiting_packaging",
}


let СтатусУпаковки = {
  "МестоДляСтатуса": "МестоДляСтатусаИсторииУпаковки",
  "Новый": "Новый",
  "Выполнено": "Выполнено",
  "Пропущено": "Пропущено",
  "Распечатан": "Распечатан",
  "ОшибкаКритическая": "ОшибкаКритическая",
}


class MrClassSettings {
  constructor() {
    // this.constUrlSpreadsheetApp = "https://docs.google.com/spreadsheets/d/1AXjrCN0FC1769aR8Pvc7y-EEkaUpOxmQKIBCt7UPIt8/";
    this.constUrlSpreadsheetApp = undefined;

  }
  setSettings(newSettings) {
    for (let key in newSettings) {
      this[key] = newSettings[key];
      Logger.log(`setSettings  key ${key} =  ${newSettings[key]};`)
    }
    // Logger.log(`Версия настройки =  ${this.test}`);
  }



}

function setSettings(newSettings) {
  return getSettings().setSettings(newSettings);
}
let mrSettings = new MrClassSettings();
function getSettings() {
  return mrSettings;
}


class MrContext {
  constructor() { // class constructor

    // this.urlSpreadsheetApp = ConstUrlSpreadsheetApp;
    this.urlSpreadsheetApp = getSettings().constUrlSpreadsheetApp;
    this.sheetNameSetings = fl_str("Настройки");
    this.sheetNameИмпортДанных = fl_str("Импорт данных");
    this.sheetNameИсторияУпаковки = fl_str("История упаковки");
    this.timeConstruct = new Date();
    this.loadSettings();
    // this.sheetNameArr()
    Logger.log(`MrContext constructor this.sheetNameArr()= ${JSON.stringify(this.sheetNameArr())}}`);
    Logger.log(`MrContext constructor = ${JSON.stringify(this)}}`);

  }

  loadSettings() {
    let sheet = undefined
    try {
      sheet = this.getSheetByName(this.sheetNameSetings);

    } catch (err) { }

    if (!sheet) { return; }

    let dey = sheet.getRange("A2").getValue();

    // Logger.log(dey);
    try { dey.setHours(0, 0, 0, 0) } catch { dey = new Date(new Date().setHours(23, 59, 59, 1000)); }
    Logger.log(dey);

    this.workingDates = [dey];
    // dey = new Date(dey.setHours(0, 0, 0, 0)).valueOf();
    dey = JSON.stringify(dey);
    this.valueOfWorkingDates = [dey];

    // Logger.log(`${v[this.col_E].valueOf()}`);
    // let vDey = new Date(new Date(v[this.col_E]).setHours(0, 0, 0, 0));
    // let vDey = new Date(v[this.col_E]).setHours(0, 0, 0, 0);
    // let vDey = v[this.col_E];
    // Logger.log(`${v[this.col_A]} | ${vDey.valueOf() == this.collectOrdersDay.valueOf()} | ${vDey.valueOf()} | ${this.collectOrdersDay.valueOf()} | `);
    // return vDey.valueOf() == this.collectOrdersDay.valueOf();

    let col_B = nr("B");
    let col_D = nr("D");

    let row_BodyFirst = 2;
    let row_BodyLast = sheet.getLastRow()

    let vls = sheet.getRange(row_BodyFirst, col_B, row_BodyLast - row_BodyFirst + 1, col_D - col_B + 1).getValues();

    let map = new Map();
    vls = vls.filter(v => v[0] != "" && v[1] != "" && v[2] != "");
    // getContext().getЧерновик("черновик (копия)").setValues(vls);
    vls.forEach(v => map.set(fl_str(v[0]), { "name": fl_str(v[0]), "Api_Key": `${v[2]}`, "Client_Id": `${v[1]}` }));
    this.markMap = map;

    let mm = vls.map(v => { return fl_str(v[0]) });
    this.arrПриоритетМагазина = [].concat(mm.flat());  //  чем выше по списку тем приоритетней


    this.arrСтатусыМПкОтправке = [СтатусыМП.awaiting_deliver, СтатусыМП.awaiting_packaging];

  }

  /** @returns {InfoМагазина} */
  getShopInfoForMark(mark) {
    mark = fl_str(mark);
    let ret = undefined;
    ret = this.markMap.get(mark);
    if (ret == undefined) { throw new Error(`'не найдены для ${mark}'"Api-Key" и "Client-Id"`) }
    return ret;
  }

  getSpreadsheetApp() {
    if (!this.urlSpreadsheetApp) {
      return SpreadsheetApp.getActive();
    }
    return SpreadsheetApp.openByUrl(this.urlSpreadsheetApp);
  }


  flush() {
    SpreadsheetApp.flush();
  }

  addLog(str) {
    if (this.addLog) {
      getContext().getSheetByName(getContext().sheetNameLogs).appendRow([undefined, new Date(), str]);
    }
  }

  getSheetByName(sheetName) {
    // let ss = SpreadsheetApp.getActive();
    let ss = this.getSpreadsheetApp();

    let sh = ss.getSheetByName(sheetName);
    if (!sh) { throw new Error(`нет листа с именем ${sheetName}`); }
    return sh;
  }

  addSheetByName(sheetName) {
    // let ss = SpreadsheetApp.getActive();
    let ss = this.getSpreadsheetApp()
    ss.insertSheet(sheetName);
  }


  getValueOr(sheetName, row, col, orValue = undefined) {
    let sheet = (() => { try { return this.getSheetByName(sheetName) } catch (err) { return undefined; } })();
    if (!sheet) { return orValue; }
    return sheet.getRange(row, col).getValue();
  }


  sheetNameArr() {
    let retArr = new Array();
    // let ss = SpreadsheetApp.getActive();
    let ss = this.getSpreadsheetApp()
    let shs = ss.getSheets();
    for (let i = 0; i < shs.length; i++) {
      retArr.push(fl_str(shs[i].getSheetName()));
    }
    return retArr;
  }


  getMrClassPackagingHistory() {
    if (!this.mrClassPackagingHistory) { this.mrClassPackagingHistory = new MrClassPackagingHistory(); }
    return this.mrClassPackagingHistory;
  }

  getMrClassImportData() {
    if (!this.mrClassImportData) { this.mrClassImportData = new MrClassImportData(); }
    return this.mrClassImportData;
  }

}

function fl_str(str) {
  if (!str) { return ""; }
  return str.toString().replace(/ +/g, ' ').trim().toUpperCase();
}

function mrErrToString(err) {
  let ret = "ОШИБКА ВЫПОЛНЕНИЯ СКРИПТА \n " + "\nдата время:" + new Date() + "\nname: " + err.name + "\nmessage: " + err.message + "\nstack: " + err.stack;
  Logger.log(ret);
  return ret;
}




// let mrContext = new MrContext();
let mrContext = undefined;


/** @returns {MrContext} */
function getContext() {
  if (!mrContext) { mrContext = new MrContext(); }
  return mrContext;
}

function nr(A1) {
  A1 = A1.replace(/\d/g, '')
  let i, l, chr,
    sum = 0,
    A = "A".charCodeAt(0),
    radix = "Z".charCodeAt(0) - A + 1;
  for (i = 0, l = A1.length; i < l; i++) {
    chr = A1.charCodeAt(i);
    sum = sum * radix + chr - A + 1
  }
  return sum;
}









function nc(column) {
  column = parseInt("" + column);
  if (isNaN(column)) { throw ('файл mrColumnToNr функция nrCol(): не найдено буквенное обозначение для колонки "' + column + '"'); }

  column = column - 1;
  switch (column) {
    case 0: { return "A"; }
    case 1: { return "B"; }
    case 2: { return "C"; }
    case 3: { return "D"; }
    case 4: { return "E"; }
    case 5: { return "F"; }
    case 6: { return "G"; }
    case 7: { return "H"; }
    case 8: { return "I"; }
    case 9: { return "J"; }
    case 10: { return "K"; }
    case 11: { return "L"; }
    case 12: { return "M"; }
    case 13: { return "N"; }
    case 14: { return "O"; }
    case 15: { return "P"; }
    case 16: { return "Q"; }
    case 17: { return "R"; }
    case 18: { return "S"; }
    case 19: { return "T"; }
    case 20: { return "U"; }
    case 21: { return "V"; }
    case 22: { return "W"; }
    case 23: { return "X"; }
    case 24: { return "Y"; }
    case 25: { return "Z"; }

    default: {
      if (column > 25) { return `${nc(column / 26)}${nc((column % 26) + 1)}`; }
    }
  }

  throw new Error('файл mrColumnToNr функция nc(): не найдено буквенное обозначение для колонки "' + column + '"');

}
function responseToJSON(response) {
  let ret = new Object();

  ret["ResponseCode"] = response.getResponseCode();
  ret["Headers"] = response.getHeaders();
  ret["ContentText"] = response.getContentText();
  ret["Content"] = response.getContent();
  ret["Blob"] = response.getBlob();
  ret["AllHeaders"] = response.getAllHeaders();
  return JSON.stringify(ret);
}

function print_pdf_by_url(url_pdf) {
  Logger.log(`print_pdf_by_url ${url_pdf}`);
  // Блок отображения скачанного PDF

  var html = HtmlService.createHtmlOutput('<html><script>'
    + 'window.close = function(){window.setTimeout(function(){google.script.host.close()},9)};'
    + 'var a = document.createElement("a"); a.href="' + url_pdf + '"; a.target="_blank";'
    + 'if(document.createEvent){'
    + '  var event=document.createEvent("MouseEvents");'
    + '  if(navigator.userAgent.toLowerCase().indexOf("firefox")>-1){window.document.body.append(a)}'
    + '  event.initEvent("click",true,true); a.dispatchEvent(event);'
    + '}else{ a.click() }'
    + 'close();'
    + '</script>'
    // В случае сбоя приведенного выше кода, предложение альтернативы ниже.
    + '<body style="word-break:break-word;font-family:sans-serif;">Не удалось открыть автоматически. <a href="' + url_pdf + '" target="_blank" onclick="window.close()">Нажмите здесь, чтобы продолжить</a>.</body>'
    + '<script>google.script.host.setHeight(100);google.script.host.setWidth(410)</script>'
    + '</html>')
    .setWidth(400).setHeight(10);
  SpreadsheetApp.getUi().showModalDialog(html, "Открываем....");


}





























/**
 * https://developers.google.com/apps-script/guides/web
 * When a user visits an app or a program sends the app an HTTP GET request, Apps Script runs the function doGet(e).
 * When a program sends the app an HTTP POST request, Apps Script runs doPost(e) instead.
 * In both cases, the e argument represents an event parameter that can contain information about any request parameters.
 * The structure of the event object is shown in the table below:
 * @typedef {Object} Event
 * @property {string} queryString	- The value of the query string portion of the URL, or null if no query string is specified  // name=alice&n=1&n=2
 * @property {string} parameter	- An object of key/value pairs that correspond to the request parameters. Only the first value is returned for parameters that have multiple values.//  {"name": "alice", "n": "1"}
 * @property {Object} parameters	- An object similar to e.parameter, but with an array of values for each key// {"name": ["alice"], "n": ["1", "2"]}
 * @property {string} contextPath	Not used, always the empty string.
 * @property {namber} contentLength	- The length of the request body for POST requests, or -1 for GET requests // 332
 *
 * @property {Object} postData	- postData
 * @property {namber} postData.length	- The same as e.contentLength // 332
 * @property {string} postData.type	- The MIME type of the POST body // text/csv
 * @property {string} postData.contents	- The content text of the POST body  //  Alice,21
 * @property {string} postData.name	-Always the value "postData"  //  postData

 */





























