class MrClassConsole {
  constructor() {
    this.sheetNameConsole = "Консоль";
    this.sheetNameMem = "mem";
    this.sheetName = this.getSheetNameActiveSheetConsole();

    Logger.log(`MrClassConsole sheetName=${this.sheetName}`);
    this.isConsole = true;
    if (!this.sheetName) {
      this.isConsole = false;
      return;
    }

    this.avtor = `${this.sheetName}`
    this.sheet = this.getSheetByName(this.sheetName);
    this.postingNumber = this.getCurentPostingNumber();
    this.hasError = false;

    this.init();
  }

  init() {
    this.event = { parameter: {} }
    this.event.parameter[web.parameters.task] = ``;
    this.event.parameter[web.parameters.ret_format] = `${web.value.ret.json}`;
    this.event.parameter[web.parameters.avtor] = `${this.avtor}`;
    this.event.parameter[web.parameters.posting_number] = `${this.postingNumber}`;
  }

  getSheetNameActiveSheetConsole(testName = undefined) {
    let ss = this.getSpreadsheetApp();
    let sheetName = ss.getActiveSheet().getSheetName();
    if (!this.isSheetConsole(sheetName)) { return testName; }
    return sheetName;
  }

  isSheetConsole(sheetName) {
    return this.getSheetNamesConsole().includes(fl_str(sheetName));
  }

  getSheetNamesConsole() {
    let strConsole = fl_str(this.sheetNameConsole);
    let sheets = this.getSpreadsheetApp().getSheets();
    let sheetNames = sheets.map(s => fl_str(s.getName()));
    sheetNames = sheetNames.filter(sn => sn.includes(strConsole));
    Logger.log(`getSheetNamesConsole=${sheetNames}`);
    return sheetNames;
  }

  getSpreadsheetApp() {
    if (!this.urlSpreadsheetApp) {
      return SpreadsheetApp.getActive();
    }
    return SpreadsheetApp.openByUrl(this.urlSpreadsheetApp);
  }


  getSheetByName(sheetName) {
    let ss = this.getSpreadsheetApp();
    let sh = ss.getSheetByName(sheetName);
    if (!sh) { throw new Error(`нет листа с именем ${sheetName}`); }
    return sh;
  }



  /** @param {Array} commands */
  executeCommands(commandArr) {
    if (!this.isConsole) {
      Logger.log(`MrClassConsole executeCommands  не лист Консоли`);
      return;
    }

    let lock = LockService.getScriptLock();
    try {
      lock.waitLock(1000 * 60 * 29); // подождите 60 * 29 секунд, пока другие не воспользуются разделом кода, и заблокируйте его, чтобы остановить, а затем продолжите



      /** @type {JsonЗаказа} */
      let jsonЗаказа = undefined;
      Logger.log(`MrClassConsole executeCommands commands=${commandArr}`);
      for (let i = 0; i < commandArr.length; i++) {
        let command = commandArr[i];
        Logger.log(`MrClassConsole executeCommands Следуящая command=${command}`);
        switch (command) {
          case commands.get: jsonЗаказа = this.get(); break;
          case commands.showPdf: jsonЗаказа = this.showPdf(jsonЗаказа); break;
          case commands.print: jsonЗаказа = this.print(); break;
          case commands.next: jsonЗаказа = this.next(); break;
          case commands.skip: jsonЗаказа = this.skip(); break;
          case commands.done: jsonЗаказа = this.done(); break;
          case commands.skip_and_next: jsonЗаказа = this.skip_and_next(); break;
          case commands.done_and_next: jsonЗаказа = this.done_and_next(); break;
        }
        this.checkErrors(jsonЗаказа);
        if (this.hasError) { break; }
      }

      this.updateSheet(jsonЗаказа);


    } catch (err) {
      mrErrToString(err);
      let str = "Наверное очередь занята";
      Logger.log(str);
      task.addError(str);
    } finally {
      lock.releaseLock();
    }
  }


  getCurentPostingNumber() {
    return this.sheet.getRange(rangesStr.postingNumber).getValue();
  }


  /** @param {JsonЗаказа} jsonЗаказа @returns {JsonЗаказа} */
  showPdf(jsonЗаказа) {
    print_pdf_by_url(jsonЗаказа.СсылкаНаPDF);
    return jsonЗаказа;
  }

  /** @returns {JsonЗаказа} */
  print() {
    this.event.parameter[web.parameters.task] = `${web.value.task.print}`;
    let ret = executeEvent(this.event);
    return ret;
  }


  /** @returns {JsonЗаказа} */
  skip() {
    if (!this.postingNumber) { return; }
    this.event.parameter[web.parameters.task] = `${web.value.task.skip}`;

    let ret = executeEvent(this.event);
    return ret;

  }

  /** @returns {JsonЗаказа} */
  skip_and_next() {
    if (!this.postingNumber) { return; }
    this.event.parameter[web.parameters.task] = `${web.value.task.skip_and_next}`;

    let ret = executeEvent(this.event);
    return ret;

  }

  /** @returns {JsonЗаказа} */
  done() {
    if (!this.postingNumber) { return; }
    this.event.parameter[web.parameters.task] = `${web.value.task.done}`;

    let ret = executeEvent(this.event);
    return ret;

  }
  /** @returns {JsonЗаказа} */
  done_and_next() {
    if (!this.postingNumber) { return; }
    this.event.parameter[web.parameters.task] = `${web.value.task.done_and_next}`;
    let ret = executeEvent(this.event);
    return ret;
  }


  /** @returns {JsonЗаказа} */
  next() {

    let curentPostingNumber = this.getCurentPostingNumber();
    if (DefНомерОтправления.НЕ_ВЫБРАН_ЗАКАЗ != curentPostingNumber) { return; }

    this.event.parameter[web.parameters.task] = `${web.value.task.next}`;
    let ret = executeEvent(this.event);
    return ret;
    // this.saveJson(executeEvent(this.event));
  }
  /** @returns {JsonЗаказа} */
  get() {
    if (!this.postingNumber) { return; }
    this.event.parameter[web.parameters.task] = `${web.value.task.get}`;
    let ret = executeEvent(this.event);
    return ret;
  }



  /** @param  {JsonЗаказа} jsonЗаказа */
  updateSheet(jsonЗаказа) {
    if (!jsonЗаказа) {
      // this.showErrors([`Нет Данных Для ${this.sheetName} или Они не в формате JSON | json=${json}`]);
      return;
    }
    this.postingNumber = jsonЗаказа.НомерОтправления;
    this.sheet.getRange(rangesStr.postingNumber).setValue(jsonЗаказа.НомерОтправления);
    Logger.log(`MrClassConsole  jsonЗаказа.НомерОтправления =${jsonЗаказа.НомерОтправления} | row${jsonЗаказа.row}`);
    SpreadsheetApp.flush();
    if (jsonЗаказа.Ошибки.length != 0) {
      this.hasError = true;
      this.showErrors(jsonЗаказа.Ошибки);
    }
  }

  /** @param  {JsonЗаказа} jsonЗаказа */
  checkErrors(jsonЗаказа) {
    if (!jsonЗаказа) {
      this.hasError = true;
      return;
    }
    if (jsonЗаказа.Ошибки.length != 0) {
      this.hasError = true;
      return;
    }
    this.hasError = false;
  }

  /** @param {string[]} errors */
  showErrors(errors) {

    // let str = `Есть Ошибки:\n${errors.map((v, i, arr) => { return `  ${i + 1}: ${v}` }).join('\n')}`;
    let str = ` <h1>ВНИМАНИЕ!</h1>
      <h2>
        ${errors.map((v, i, arr) => { return `<li> ${v}  </li>` }).join('\n')}
      </h2>
    `;

    // Logger.log(str);

    var attention = HtmlService.createHtmlOutput('' + str + '<script>setTimeout(function () { google.script.host.close() }, 10000);</script>');
    SpreadsheetApp.getUi().showModalDialog(attention, " ");


  }
}

let commands = {
  print: "print", // пометить заказ как Пропущенный
  next: "next",  // получить следующий

  skip: "skip", // пометить заказ как Пропущенный
  done: "done", // пометить заказ как Выполненный 

  skip_and_next: "skip_and_next",  // пометить заказ как Пропущенный  и получить следующий
  done_and_next: "done_and_next",  // пометить заказ как Выполненный  и получить следующий

  get: "get",  // получить текущий
  showPdf: "showPdf",  // показать PDF

}


let rangesStr = {
  postingNumber: "C1",
  mem: "A1:B",

}



//-------------------------------------------------------------------------

function menu_print() { new MrClassConsole().executeCommands([commands.get, commands.showPdf, commands.print]); }   //  Напечатано
function menu_skip() { new MrClassConsole().executeCommands([commands.skip_and_next]); }    //  Пропустить
function menu_done() { new MrClassConsole().executeCommands([commands.done_and_next]); }   //   Выполнено
function menu_next() { new MrClassConsole().executeCommands([commands.next]); }   //   Следующий

/** @param {EventPostGet} event  @returns {JsonЗаказа}  */
function executeEvent(event) {
  return new MrClassTask().onLib(event);
}

function menuОчиститьКонсоли() {
  let mrClassConsole = new MrClassConsole();
  let sheetNamesConsole = mrClassConsole.getSheetNamesConsole();
  for (let i = 0; i < sheetNamesConsole.length; i++) {
    let sheetName = sheetNamesConsole[i];
    let sheet = mrClassConsole.getSheetByName(sheetName);
    sheet.getRange(rangesStr.postingNumber).setValue(DefНомерОтправления.НЕ_ВЫБРАН_ЗАКАЗ);
  }
}

