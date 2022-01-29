


class MrClassPackagingHistory {
  constructor() {
    this.timeConstruct = new Date();
    // this.urlSpreadsheetApp = "https://docs.google.com/spreadsheets/d/1VRWmChjn5nZj7qJBbAM2vmhiZNFWvp-lvtLH5uLsBbc/edit#gid=294617235";
    // this.urlSpreadsheetApp = ConstUrlSpreadsheetApp;
    this.urlSpreadsheetApp = getSettings().constUrlSpreadsheetApp;
    this.sheetName = fl_str("История упаковки");
    this.sheet = this.getSheetByName(this.sheetName);
    this.makeCol();
    this.waitForUpdate();
  }

  /**
   * @param {Заказ[]} ВсеЗаказы
   */
  setВсеЗаказыArr(ВсеЗаказы) {
    this.arrs.ВсеЗаказы = ВсеЗаказы;

    this.convertOrdersToValues();

    this.startUpdate();
    this.clearBody();
    this.insertValues();

    this.finishUpdate();
  }

  startUpdate() {
    this.sheet.getRange(this.rangeStr.Обновляемся).setValue(true);
    SpreadsheetApp.flush();
  }

  clearBody() {
    this.sheet.getRange(this.rows.bodyFirst, this.cols.first, this.rows.bodyLast - this.rows.bodyFirst + 1, this.cols.last - this.cols.first + 1).clearContent();
  }

  insertValues() {
    if (this.arrs.value.length == 0) { return; }
    this.sheet.getRange(this.rows.bodyFirst, this.cols.first, this.arrs.value.length, this.arrs.value[0].length).setValues(this.arrs.value);
    this.sheet.getRange(this.rangeStr.Строка_1).setValue(undefined);
    this.sheet.getRange(this.rangeStr.ТекущийЗаказ).setValue(0);
    // this.sheet.getRange(this.rangeStr.СледующиеЗаказы).setValue(undefined);
    // this.sheet.getRange(this.rangeStr.ВсеВыполнено).setValue(undefined);
    // this.sheet.getRange(this.rangeStr.ЗаказыВРаботе).setValue(undefined);
  }


  finishUpdate() {
    // this.sheet.getRange(this.rangeStr.Обновляемся).setValue(false);
    this.sheet.getRange(this.rangeStr.Обновляемся).setValue(new Date());
    SpreadsheetApp.flush();
  }

  waitForUpdate() {
    let f = this.sheet.getRange(this.rangeStr.Обновляемся).getValue() === true;
    while (f) {
      Logger.log(`Обновляем Тоблицу Ждем ${new Date()} `)
      Utilities.sleep(1000 * 3);
      SpreadsheetApp.flush();
      f = this.sheet.getRange(this.rangeStr.Обновляемся).getValue() === true;
    }
  }


  convertOrdersToValues() {
    let nCol = this.cols.last - this.cols.first + 1;

    if (this.arrs.ВсеЗаказы.length == 0) { this.arrs.value = new Array(); }

    this.arrs.value = this.arrs.ВсеЗаказы.map((v, i, arr) => {
      let retArr = new Array(nCol);

      retArr[-1 + this.cols.Экпропт.json_private] = JSON.stringify(v);
      // retArr[-1 + this.cols.Экпропт.jsonЗаказа] = JSON.stringify(v.jsonЗаказа);
      retArr[-1 + this.cols.Экпропт.html] = v.htmlЗаказа;
      retArr[-1 + this.cols.Экпропт.НомерОтправления] = v.НомерОтправления;
      retArr[-1 + this.cols.Экпропт.pdf] = v.urlPdf;
      retArr[-1 + this.cols.ВсеЗаказы.ДатаОтгрузки] = v.ДатаОтгрузки;
      retArr[-1 + this.cols.ВсеЗаказы.НомерОтправления] = v.НомерОтправления;
      retArr[-1 + this.cols.ВсеЗаказы.Статус] = v.Статус;
      retArr[-1 + this.cols.ВсеЗаказы.МеткаМагазина] = v.МеткаМагазина;

      return retArr;
    });




  }



  getSpreadsheetApp() {
    if (!this.urlSpreadsheetApp) {
      return SpreadsheetApp.getActive();
    }
    return SpreadsheetApp.openByUrl(this.urlSpreadsheetApp);
  }


  getSheetByName(sheetName) {
    let ss = this.getSpreadsheetApp();
    // let ss = SpreadsheetApp.getActive();
    let sh = ss.getSheetByName(sheetName);
    if (!sh) { throw new Error(`нет листа с именем ${sheetName}`); }
    return sh;
  }

  //----------------------------------------------------------------------------
  // блок ответов на запросы 


  /** @param {Task} task   */
  setСтатусУпаковки(task, статусУпаковки = СтатусУпаковки.МестоДляСтатуса) {
    if (task.row < this.rows.bodyFirst) { return; }
    task.sheetRowArr[this.cols.ВсеЗаказы.Статус] = статусУпаковки;
    task.sheetRowArr[this.cols.Выполнения.КтоВыполнил] = task.avtor;
    task.sheetRowArr[this.cols.Выполнения.ДатаВыполнения] = new Date();
    this.sheet.getRange(task.row, this.cols.ВсеЗаказы.Статус).setValue(статусУпаковки);
    this.sheet.getRange(task.row, this.cols.Выполнения.КтоВыполнил).setValue(task.avtor);
    this.sheet.getRange(task.row, this.cols.Выполнения.ДатаВыполнения).setValue(new Date());

    // SpreadsheetApp.flush();
  }

  /** @param {Task} task   */
  setРаспечатан(task, flag = true) {
    this.setСтатусУпаковки(task, СтатусУпаковки.Распечатан);

    // task.sheetRowArr[this.cols.Заметки.Распечатан] = flag;
    // this.sheet.getRange(task.row, this.cols.Заметки.Распечатан).setValue(true);
    // SpreadsheetApp.flush();


  }
  /** @param {Task} task   */
  setОшибкаКритеческая(task, str) {
    // task.sheetRowArr[this.cols.Заметки.ОшибкаКритеческая] = str;
    // this.sheet.getRange(task.row, this.cols.Заметки.ОшибкаКритеческая).setValue(str);
    task.ОшибкаКритеческая = true;
    this.setСтатусУпаковки(task, СтатусУпаковки.ОшибкаКритическая);
    this.setЗаказВРаботе(task.avtor, undefined);
    // SpreadsheetApp.flush();
  }




  /** @param {Task} task */
  setUrlPdf(task, urlPdf) {
    if (!this.isUrl(urlPdf)) {
      urlPdf = undefined;
    }
    Logger.log(`MrClassPackagingHistory setUrlPdf |  url=| ${urlPdf}  |`);
    task.sheetRowArr[this.cols.Экпропт.pdf] = urlPdf;
    this.sheet.getRange(task.row, this.cols.Экпропт.pdf).setValue(urlPdf);
  }

  isUrl(url) {

    let ssa = "https://drive.google.com/file/"
    // Logger.log(`MrClassPackagingHistory isUrl | ${`${url}`.slice(0, ssa.length) == ssa} | url=| ${url}  | ${`${url}`.slice(0, ssa.length)}  | ssa = | ${ssa} |`);
    // Logger.log(`MrClassPackagingHistory isUrl | ${`${url}`.slice(0, ssa.length) == ssa} | ${`${url}`.slice(0, ssa.length)}`);
    if (`${url}`.slice(0, ssa.length) == ssa) { return true; }
    return false;
  }

  getRowЗаказа(НомерОтправления) {
    let vls = this.sheet.getRange(this.rows.bodyFirst, this.cols.ВсеЗаказы.НомерОтправления, this.rows.bodyLast - this.rows.bodyFirst + 1, 1).getValues();
    vls = vls.flat();
    let ind = vls.indexOf(`${НомерОтправления}`);
    let row = ind + this.rows.bodyFirst;
    Logger.log(` НомерОтправления=${НомерОтправления} row=${row}`);
    return row;
  }


  getНомерОтправленияByRow(row) {
    if (row == this.rows.finish) {
      row = this.getRowЗаказа(DefНомерОтправления.ВСЕ_ВЫПОЛНЕННО);
      // return this.sheet.getRange(row, this.cols.ВсеЗаказы.НомерОтправления).getValue();
    }

    if (row < this.rows.bodyFirst) { return undefined; }
    if (row > this.rows.bodyLast) { return undefined; }
    return this.sheet.getRange(row, this.cols.ВсеЗаказы.НомерОтправления).getValue();
  }
  /** @param {Task} task */
  complement(task) {
    let НомерОтправления = task.posting_number;
    if (!НомерОтправления) {
      task.addError(` Номером Отправления="${НомерОтправления}", не определен`);
    }

    task.row = this.getRowЗаказа(НомерОтправления);
    if (task.row < this.rows.bodyFirst) {
      task.ОшибкаКритеческая = true;
      task.addError(`Не найден Заказ с Номером Отправления="${НомерОтправления}"`);
      // task.row = this.getRowForNextTask();
      task.task = web.value.task.get;
      task.onlyGet = true;
    }
    if (task.onlyGet) { return };
    task.sheetRowArr = [task.row].concat(this.sheet.getRange(task.row, this.cols.first, 1, this.cols.last - this.cols.first + 1).getValues()[0]);
    // Logger.log(`complement task.sheetRowArr=${task.sheetRowArr} `);
    task.Заказ = JSON.parse(this.getJsonForTask(task));


  }

  /** @param {Task} task */
  command_print(task) {
    // let допустимыеСтатусы = [СтатусУпаковки.Выполнено, СтатусУпаковки.Распечатан, СтатусУпаковки.Пропущено, СтатусУпаковки.Новый]; //статусы при которых можно пометить как СтатусУпаковки.Выполнено
    let допустимыеСтатусы = [СтатусУпаковки.Распечатан, СтатусУпаковки.Пропущено, СтатусУпаковки.Новый]; //статусы при которых можно пометить как СтатусУпаковки.Выполнено
    let текСтатус = task.sheetRowArr[this.cols.ВсеЗаказы.Статус]; // текуший статус
    // let распечатан = task.sheetRowArr[this.cols.Заметки.Распечатан]; // распечатан


    if (!допустимыеСтатусы.includes(текСтатус)) {
      task.addError(`Для Номера Отправления "${task.posting_number}" текущий статус "${текСтатус}", вы пытаетесь установить "${СтатусУпаковки.Распечатан}"`);
      return;
    }

    //if (!допустимыеСтатусы.includes(текСтатус)) {
    //  task.addError(`Для Номера Отправления "${task.posting_number}" текущий статус "${текСтатус}", вы пытаетесь установить "${СтатусУпаковки.Распечатан}"`);
    //  return;
    //}

    // if (распечатан === true) {
    //   task.addError(`Для Номера Отправления "${task.posting_number}" ШК  уже был Распечатан!`);
    //   return;
    // }

    this.setРаспечатан(task);

  }

  /** @param {Task} task */
  command_skip(task) {
    // let допустимыеСтатусы = [СтатусУпаковки.Пропущено, СтатусУпаковки.Новый]; //статусы при которых можно пометить как СтатусУпаковки.Выполнено
    let допустимыеСтатусы = [СтатусУпаковки.Пропущено, СтатусУпаковки.Новый]; //статусы при которых можно пометить как СтатусУпаковки.Выполнено
    let текСтатус = task.sheetRowArr[this.cols.ВсеЗаказы.Статус]; // текуший статус
    
    if (!допустимыеСтатусы.includes(текСтатус)) {
      task.addError(`ШК был распечатан!`);
      return;
    }

    //if (!допустимыеСтатусы.includes(текСтатус)) {
    //  task.addError(`Для Номера Отправления "${task.posting_number}" текущий статус "${текСтатус}", вы пытаетесь установить "${СтатусУпаковки.Пропущено}"`);
    //  return;
    //}

    // let распечатан = task.sheetRowArr[this.cols.Заметки.Распечатан]; // распечатан

    // // if (распечатан !== true) {
    // if (распечатан) {
    //   // task.addError(`${распечатан}| ${task.sheetRowArr}| Для Номера Отправления "${task.posting_number}" ШК не распечатан!`);
    //   task.addError(`Для Номера Отправления "${task.posting_number}" БЫЛ РАПЕЧАТАН ШК!`);
    //   return;
    // }




    this.setСтатусУпаковки(task, СтатусУпаковки.Пропущено);
    this.setЗаказВРаботе(task.avtor, undefined);
  }



  /** @param {Task} task */
  command_done(task) {
    // let допустимыеСтатусы = [СтатусУпаковки.Пропущено, СтатусУпаковки.Новый, СтатусУпаковки.Выполнено]; //статусы при которых можно пометить как СтатусУпаковки.Выполнено
    let допустимыеСтатусы = [СтатусУпаковки.Распечатан, СтатусУпаковки.Выполнено]; //статусы при которых можно пометить как СтатусУпаковки.Выполнено
    let текСтатус = task.sheetRowArr[this.cols.ВсеЗаказы.Статус]; // текуший статус
    // let распечатан = task.sheetRowArr[this.cols.Заметки.Распечатан]; // распечатан


    if (!допустимыеСтатусы.includes(текСтатус)) {
      task.addError(`ШК не был распечатан!`);
      return;
    }

    //if (!допустимыеСтатусы.includes(текСтатус)) {
    //  task.addError(`Для Номера Отправления "${task.posting_number}" текуший статут "${текСтатус}", вы пытаетесь установить "${СтатусУпаковки.Выполнено}"`);
    //  return;
    //}

    // // if (распечатан !== true) {
    // if (!распечатан) {
    //   // task.addError(`${распечатан}| ${task.sheetRowArr}| Для Номера Отправления "${task.posting_number}" ШК не распечатан!`);
    //   task.addError(`Для Номера Отправления "${task.posting_number}" ШК не распечатан!`);
    //   return;
    // }

    this.setЗаказВРаботе(task.avtor, undefined);
    if (текСтатус == СтатусУпаковки.Выполнено) {
      return;
    }
    this.setСтатусУпаковки(task, СтатусУпаковки.Выполнено);
  }



  getЗаказыВРаботе() {
    let заказыВРаботе = (() => { try { return JSON.parse(this.sheet.getRange(this.rangeStr.ЗаказыВРаботе).getValue()) } catch (err) { return new Object() } })();
    return заказыВРаботе;
  }

  getRowsЗаказовВРаботе() {
    let заказыВРаботе = this.getЗаказыВРаботе();
    let retArr = new Array()
    for (let key in заказыВРаботе) {
      retArr.push(заказыВРаботе[key]["row"]);
    }

    // Logger.log(`getRowsЗаказовВРаботе  retArr=${retArr}`);
    return retArr;
  }


  setЗаказВРаботе(avtor, row) {
    let заказыВРаботе = this.getЗаказыВРаботе();
    if (row == undefined) {
      заказыВРаботе[avtor] = undefined;
    } else {
      заказыВРаботе[avtor] = { "row": row, "date": new Date() };
    }
    this.sheet.getRange(this.rangeStr.ЗаказыВРаботе).setValue(JSON.stringify(заказыВРаботе));
  }

  getRowForNextTask(task) {
    let nextRow = 0;
    // Logger.log(` getRowForNextTask `);

    let всеВыполнено = this.sheet.getRange(this.rangeStr.ВсеВыполнено).getValue();
    if (всеВыполнено == true) { return this.getRowЗаказа(DefНомерОтправления.ВСЕ_ВЫПОЛНЕННО); }

    let rowТекущийЗаказ = this.sheet.getRange(this.rangeStr.ТекущийЗаказ).getValue();
    if (rowТекущийЗаказ == this.rows.finish) { return this.getRowЗаказа(DefНомерОтправления.ВСЕ_ВЫПОЛНЕННО); }



    let lock = LockService.getScriptLock();
    try {
      lock.waitLock(1000 * 60 * 29); // подождите 60 * 29 секунд, пока другие не воспользуются разделом кода, и заблокируйте его, чтобы остановить, а затем продолжите

      try {
        SpreadsheetApp.flush();
        /** @type {Array} */
        let следующиеЗаказы = (() => { try { return JSON.parse(this.sheet.getRange(this.rangeStr.СледующиеЗаказы).getValue()) } catch (err) { return undefined } })();


        if (!Array.isArray(следующиеЗаказы)) {
          следующиеЗаказы = new Array();
        }
        if (следующиеЗаказы.length == 0) {
          let mrClassShops = new MrClassShops(this.getValues(), this);
          следующиеЗаказы = mrClassShops.getСледующиеЗаказы();
        }


        if (следующиеЗаказы.length == 0) {
          следующиеЗаказы = [this.rows.finish];
          //  нет болше заказов на упаковку
        }

        // rowТекущийЗаказ = this.sheet.getRange(this.rangeStr.ТекущийЗаказ).getValue();
        // rowТекущийЗаказ = parseInt(rowТекущийЗаказ);


        nextRow = parseInt(следующиеЗаказы.shift());
        if (!Number.isInteger(nextRow)) {
          nextRow = this.rows.finish;
        }

        this.sheet.getRange(this.rangeStr.СледующиеЗаказы).setValue(JSON.stringify(следующиеЗаказы));
        this.sheet.getRange(this.rangeStr.ТекущийЗаказ).setValue(nextRow);
        SpreadsheetApp.flush();

      } catch (err) {
        let str = mrErrToString(err);
        Logger.log(str);
        task.addError(str);
      }

    } catch (err) {
      let str = "наверное очередь занята";
      Logger.log(str);
      task.addError(str);
    } finally {
      lock.releaseLock();
    }

    // Logger.log(` getRowForNextTask  rowТекущийЗаказ=${rowТекущийЗаказ} | nextRow=${nextRow}`);


    if (nextRow == this.rows.finish) {
      this.sheet.getRange(this.rangeStr.ВсеВыполнено).setValue(true);
      nextRow = this.getRowЗаказа(DefНомерОтправления.ВСЕ_ВЫПОЛНЕННО);
    }
    return nextRow;
  }


  /** @param {Task} task @returns {Task} */
  command_next(task) {
    while (true) {
      task.posting_number = undefined;
      this.command_get(task);
      if (task.ОшибкаКритеческая) { continue; }
      break;
    }




  }


  /** @param {Task} task */
  command_get(task) {
    task.ОшибкаКритеческая = false;
    let НомерОтправления = task.posting_number;
    if (!НомерОтправления) {
      task.row = 0;
    } else {
      task.row = this.getRowЗаказа(НомерОтправления);
    }

    if (task.row < this.rows.bodyFirst) {
      task.row = this.getRowForNextTask(task);

      if (task.row == undefined) {
        task.ОшибкаКритеческая = true;
        return;
      }

      task.posting_number = this.getНомерОтправленияByRow(task.row);
      if (!task.posting_number) { task.ОшибкаКритеческая = true; }
      task.task = web.value.task.get;
      task.onlyGet = true;
      task.arrError = new Array();
    }

    task.sheetRowArr = [task.row].concat(this.sheet.getRange(task.row, this.cols.first, 1, this.cols.last - this.cols.first + 1).getValues()[0]);
    task.Заказ = JSON.parse(this.getJsonForTask(task));
    task.posting_number = task.Заказ.НомерОтправления;
    this.setЗаказВРаботе(task.avtor, task.row);
  }




  /** @param {Task} task */
  getJsonForTask(task) {

    // let jsonЗаказа = task.sheetRowArr[this.cols.Экпропт.jsonЗаказа];

    // let ret_jsonЗаказа = ((json_str) => { try { return JSON.parse(json_str) } catch { return undefined } })(jsonЗаказа);

    /** @type {JsonЗаказа} */
    let ret_jsonЗаказа = undefined;


    /** @type {Заказ} */
    let json_private = task.sheetRowArr[this.cols.Экпропт.json_private];
    json_private = ((json_str) => { try { return JSON.parse(json_str) } catch { return undefined } })(json_private);
    if (!json_private) {
      task.addError(`Нет Данных для Номера Отправления ${task.posting_number}`);
    } else {
      ret_jsonЗаказа = json_private.jsonЗаказа;
    }



    if (!ret_jsonЗаказа) {
      // ret_jsonЗаказа = new Object();
      ret_jsonЗаказа = newEmptyJsonЗаказа();
      this.setОшибкаКритеческая(task, `Нет удалось получить jsonЗаказа`);
    }

    ret_jsonЗаказа.Статус = task.sheetRowArr[this.cols.ВсеЗаказы.Статус];
    ret_jsonЗаказа.СсылкаНаPDF = this.getPdfUrlForTask(task);

    // ret_jsonЗаказа.Распечатан = task.sheetRowArr[this.cols.Заметки.Распечатан];
    ret_jsonЗаказа.Распечатан = (ret_jsonЗаказа.Статус == СтатусУпаковки.Распечатан);



    // task.sheetRowArr[this.cols.Экпропт.jsonЗаказа] = JSON.stringify(ret_jsonЗаказа);
    // this.sheet.getRange(task.row, this.cols.Экпропт.jsonЗаказа).setValue(task.sheetRowArr[this.cols.Экпропт.jsonЗаказа]);


    return JSON.stringify(ret_jsonЗаказа);

  }


  /** @param {Task} task */
  getPdfUrlForTask(task) {
    let urlPdf = task.sheetRowArr[this.cols.Экпропт.pdf];

    if (!this.isUrl(urlPdf)) {
      /** @type {Заказ} */
      let json_private = task.sheetRowArr[this.cols.Экпропт.json_private];
      json_private = ((json_str) => { try { return JSON.parse(json_str) } catch { return undefined } })(json_private);
      if (!json_private) {
        task.addError(`Нет Данных для Номера Отправления ${task.posting_number}`);
      } else {



        let request = json_private.request;
        urlPdf = this.fetchAllByRequestArr([request])[0];



      }

    }


    if (!this.isUrl(urlPdf)) {
      task.addError(`Нет удалось получить PDF response| ${urlPdf}`);
      this.setОшибкаКритеческая(task, `Нет удалось получить PDF response| ${urlPdf}`);
      urlPdf = undefined;

    } else {
      if (urlPdf != task.sheetRowArr[this.cols.Экпропт.pdf]) {
        this.setUrlPdf(task, urlPdf);
      }
    }


    return urlPdf;
  }

  /** @returns { UrlFetchApp.HTTPResponse[]	} */
  fetchAllByRequestArr(requestArr) {
    // requestArr.forEach(r => Logger.log(`MrClassPackagingHistory fetchAllByrequestArr  requestArr |\n ${JSON.stringify(r)}`));
    // Logger.log(`MrClassPackagingHistory fetchAllByrequestArr UrlFetchApp.fetchAll START`);


    // let responseArr = UrlFetchApp.fetchAll(requestArr);
    let mrClassOZON = new MrClassOZON();
    let responseArr = mrClassOZON.fetchAllByRequestArr(requestArr);



    // Logger.log(`MrClassPackagingHistory fetchAllByrequestArr UrlFetchApp.fetchAll FINISH`);
    // responseArr.forEach(r => Logger.log(`MrClassPackagingHistory fetchAllByrequestArr  responseArr |\n ${JSON.stringify(r)}`));

    return responseArr;
  }


  /** @returns {Array[]} */
  getValues() {
    let vls = this.sheet.getRange(this.rows.bodyFirst, this.cols.first, this.rows.bodyLast - this.rows.bodyFirst + 1, this.cols.last - this.cols.first + 1).getValues();
    vls = vls.map((v, i, arr) => { return [i + this.rows.bodyFirst].concat(v); });   // на нулевой позиции номер строки из таблици
    return vls;
  }


  makeCol() {
    this.rows = {
      bodyFirst: 3,
      bodyLast: this.sheet.getLastRow(),
      heads: 2,
      finish: -999,
    }


    if (this.rows.bodyLast < this.rows.bodyFirst) {
      this.rows.bodyLast = this.rows.bodyFirst;
    }

    // Номер отправления	
    // Статус	
    // Метка магазина	
    // Дата отгрузки	

    // Кто выполнил	
    // Дата выполнения + время

    let i = 0;
    let j = 0;
    let k = 0;
    let l = 0;

    this.cols = {
      first: nr("A"),
      last: nr("H"),
      ВсеЗаказы: {
        first: nr("A"),
        last: nr("D"),
        НомерОтправления: nr("A") + i++,
        Статус: nr("A") + i++,
        МеткаМагазина: nr("A") + i++,
        ДатаОтгрузки: nr("A") + i++,
      },

      Выполнения: {
        first: nr("E"),
        last: nr("F"),
        КтоВыполнил: nr("E") + j++,
        ДатаВыполнения: nr("E") + j++,
      },


      Экпропт: {
        first: nr("G"),
        last: nr("I"),

        // НомерОтправления: nr("G") + k++,
        // jsonЗаказа: nr("G") + k++,
        json_private: nr("G") + k++,
        pdf: nr("G") + k++,
      },

      Заметки: {
        first: nr("I"),
        last: nr("I"),
        // Распечатан: nr("J") + l++,
        ОшибкаКритеческая: nr("I") + l++,
        // КтоВыполняет: nr("L") + l++,
        // ДатаПолучения: nr("L") + l++,
      }

    }


    this.arrs = {
      /** @type {Заказ[]} */
      ВсеЗаказы: new Array(),
      value: new Array(),
    }


    this.rangeStr = {
      Строка_1: "1:1",
      ВсеВыполнено: "B1",
      Обновляемся: "D1",
      pdfЗагружены: "H1",
      ЗаказыВРаботе: "E1",

      ТекущийЗаказ: "F1",
      СледующиеЗаказы: "G1",
    }


  }





  triggerHelpИсторияУаковки(info, duration = 1 / 24 / 60 * 5) {
    Logger.log(`MrClassImportData triggerHelpИсторияУаковки | info =${info}  `);
    Logger.log(`MrClassImportData triggerHelpИсторияУаковки | duration =${duration}  `);

    let vls = this.getValues();

    let mrClassShops = new MrClassShops(vls, this);
    let следующиеЗаказы = mrClassShops.getСледующиеЗаказы();
    if (следующиеЗаказы.length == 0) {
    }
    this.sheet.getRange(this.rangeStr.СледующиеЗаказы).setValue(JSON.stringify(следующиеЗаказы));

    if (!this.hasTime(duration, 60 * 1000)) { Logger.log(`Мало времени выход из triggerHelpИсторияУаковки return`); return; }

    if (this.sheet.getRange(this.rangeStr.pdfЗагружены).getValue() === true) { return; }


    // выбираем те у которых нет pdf
    vls = vls.filter((v, i, arr) => {
      if (this.isUrl(v[this.cols.Экпропт.pdf])) { return false; }
      if (v[this.cols.ВсеЗаказы.Статус] != СтатусУпаковки.Новый) { return false; }
      return true;
    });


    // vls.forEach((v,i,arr)=>{
    //   Logger.log(` row= ${v[0]}  url ${v[this.cols.Экпропт.pdf]} `);
    // })



    if (vls.length == 0) {
      Logger.log(`triggerHelpИсторияУаковки  для всех заказов уже есть pdf return`);

      return;
    }

    // return;

    let fl_break = false;

    let num = 5;

    while (true) {
      if (!this.hasTime(duration, 60 * 1000)) { Logger.log(`Мало времени выход из triggerHelpИсторияУаковки break`); fl_break = true; break; }
      if (vls.length == 0) { Logger.log(` triggerHelpИсторияУаковки   vls.length == 0 break`); break; }

      let arr_vls = vls.slice(0, num);
      vls = vls.slice(num);

      let arr_request = arr_vls.map((v, i, arr) => {
        /** @type {Заказ} */
        let json_private = v[this.cols.Экпропт.json_private];
        json_private = ((json_str) => { try { return JSON.parse(json_str) } catch { return undefined } })(json_private);
        if (!json_private) {
          return undefined;
        }
        return {
          row: v[0],
          "request": json_private.request,
        }

      });




      // Logger.log(`lj dbkmnhf triggerHelpИсторияУаковки   arr_request.length ${arr_request.length}  | ${arr_request} `);

      arr_request.filter((v, i, arr) => { return v != undefined });



      if (arr_request.length == 0) { Logger.log(` triggerHelpИсторияУаковки   arr_request.length == 0 break`); continue; }
      // Logger.log(` triggerHelpИсторияУаковки   arr_request.length ${arr_request.length}  | ${arr_request} `);
      // continue;

      let arr_response = this.fetchAllByRequestArr(arr_request.map((v, i, arr) => { return v["request"] }));


      arr_response.forEach((urlPdf, i, arr) => {

        if (!this.isUrl(urlPdf)) {
          urlPdf = undefined;
        }
        Logger.log(` triggerHelpИсторияУаковки   arr_request[${i}] ${JSON.stringify(arr_request[i])}  urlPdf  ${urlPdf}  `);
        this.sheet.getRange(arr_request[i]["row"], this.cols.Экпропт.pdf).setValue(urlPdf);

      });
      // this.sheet.getRange(this.rangeStr.pdfЗагружены).setValue(true);
      SpreadsheetApp.flush();

      // Utilities.sleep(120*1000);


    }


    if (!fl_break) { this.sheet.getRange(this.rangeStr.pdfЗагружены).setValue(true); }


  }

  hasTime(duration, tMin = 20 * 1000) {
    let tDey = 24 * 60 * 60 * 1000;
    let tDuration = duration * tDey;
    // let tMin = 20 * 1000;
    let tStart = this.timeConstruct;
    let tNow = new Date();
    let tDef = tNow - tStart;
    let tHas = tDuration - tDef;

    // Logger.log(` 
    // duration=${duration}
    // tDuration=${tDuration}
    // tMim=${tMin}
    // tHas=${tHas}
    // `);

    if (tHas < tMin) { return false; }
    return true;
  }



}


function newEmptyJsonЗаказа() {
  /** @type {JsonЗаказа} */
  let jsonЗаказа = new Object();
  jsonЗаказа.Товары = new Array();
  jsonЗаказа.Ошибки = new Array();
  return jsonЗаказа;
}



function triggerHelpИсторияУаковки(info = undefined, duration = 1 / 24 / 60 * 5) {
  let packagingHistory = new MrClassPackagingHistory();
  packagingHistory.triggerHelpИсторияУаковки(info, duration);
}

function menuHelpИсторияУаковки() {
  triggerHelpИсторияУаковки(`Вызов Триггера из меню ${new Date()}`);
}















