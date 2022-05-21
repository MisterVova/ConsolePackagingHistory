function test() {
  url = "https://script.google.com/macros/s/AKfycbxcN1n8XzLm1TtLuTPiWgyTuGKJZeWxIZV6Q4eRcyO0IVKwajwMom5oJfGhsw8-lFmu/exec?ret_format=json&avtor=Консоль(тест)&posting_number=02338018-0207-5&task=print";
  let cc = UrlFetchApp.fetch(url).getContentText();

  sas = ((strJson) => { try { return JSON.parse(strJson); } catch (err) { return { "не JSON": strJson }; } })(cc);

  for (let key in sas) {
    Logger.log(`test | ${key}  | ${JSON.stringify(sas[key])}`);
  }

}

class Task {
  /** @param {EventPostGet} event*/
  constructor(event) {
    let parameter = event.parameter;//получаем параметр "action"

    this.event = event;
    this.task = parameter[web.parameters.task];
    this.ret_format = parameter[web.parameters.ret_format];
    this.posting_number = parameter[web.parameters.posting_number];
    this.avtor = parameter[web.parameters.avtor];

    this.onlyGet = false;
    if (!this.task) {
      this.task = web.value.task.get;
      this.onlyGet = true;
    }

    this.arrError = new Array();
    // this.retValue = undefined;
    this.row = undefined;
    this.sheetRowArr = undefined;

    /** @type {JsonЗаказа} */
    this.Заказ = undefined;
    this.ОшибкаКритеческая = false;
    // Logger.log(`Task Constructor ${JSON.stringify(this)}`);


    // this.addError("А нет Ошибок Вот первая");
    this.log("Task Constructor");

  }




  hasError() {
    return this.arrError.length != 0;
  };

  addError(str) {
    this.arrError.push(str);
  }


  log(str) {
    return;
    Logger.log(`vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv`);
    for (let key in this) {

      // if (key == "jsonЗаказа") { continue; }
      Logger.log(`${str} | ${key}  | ${JSON.stringify(this[key])}`);
    }

    for (let key in this.Заказ) {
      Logger.log(`${str}  -- jsonЗаказа. | ${key}  | ${JSON.stringify(this.Заказ[key])}`);
    }

    Logger.log(`^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`);
  }
}


class MrClassTask {

  constructor() {

    this.packagingHistory = new MrClassPackagingHistory();
  }

  /** @param {EventPostGet} event*/
  doGet_doPost(event) {

    // Logger.log(`doGet_doPost ${JSON.stringify(event)}`);
    Logger.log(`event.parameter= ${JSON.stringify(event.parameter)}`);
    let task = this.executeByEvent(event);

    return ContentService.createTextOutput(`${JSON.stringify(this.getJsonЗаказа(task))}`);
  }


  /** @param {EventPostGet} event  @returns {JsonЗаказа}  */
  onLib(event) {
    let task = this.executeByEvent(event);

    return this.getJsonЗаказа(task);
    // return this.getJsonЗаказа(task);

  }


  /** @param {EventPostGet} event @returns {Task} */
  executeByEvent(event) {

    // Logger.log(`doGet_doPost ${JSON.stringify(event)}`);
    Logger.log(`event.parameter= ${JSON.stringify(event.parameter)}`);

    let task = new Task(event);
    this.packagingHistory.complement(task);

    // task.log("MrClassTask return |");


    if (task.onlyGet) {

      this.task_get(task);
    } else {
      switch (task.task) {
        case web.value.task.print: this.task_print(task); break;
        case web.value.task.skip: this.task_skip(task); break;
        case web.value.task.skip_and_next: this.task_skip_and_next(task); break;
        case web.value.task.done: this.task_done(task); break;
        case web.value.task.done_and_next: this.task_done_and_next(task); break;
        case web.value.task.next: this.task_next(task); break;
        case web.value.task.get: this.task_get(task); break;
        default: this.task_def(task);
      }
    }

    this.task_error(task);
    // if (!this.isOk(task)) {
    //   this.task_error(task);
    // }

    task.log("MrClassTask return |");
    // for (let key in task.jsonЗаказа) {
    //   Logger.log(`MrClassTask  return jsonЗаказа | ${key}  | ${JSON.stringify(task.jsonЗаказа[key])}`);
    // }
    return task;
  }






  /** @param {Task} task @returns boolean*/
  isOk(task) {
    return !task.hasError();
  }

  /** @param {Task} task @returns {JsonЗаказа} */
  getJsonЗаказа(task) {
    task.Заказ.Распечатан = task.sheetRowArr[this.packagingHistory.cols.Заметки.Распечатан];
    task.Заказ.Статус = task.sheetRowArr[this.packagingHistory.cols.ВсеЗаказы.Статус];
    task.Заказ.СсылкаНаPDF = task.sheetRowArr[this.packagingHistory.cols.Экпропт.pdf];
    task.Заказ.ДатаВремяФормерованияJSON = new Date();
    task.Заказ.onlyGet = task.onlyGet;
    task.Заказ.row = task.row;
    return task.Заказ;
  }


  /** @param {Task} task*/
  task_def(task) {


    task.addError(`Спасибо doGet_doPost, для параметра task="${JSON.stringify(task)}", нет задачи`);
  }

  /** @param {Task} task*/
  task_error(task) {
    // Logger.log(`task_error  = ${JSON.stringify(task.arrError)}`);

    // if (!Array.isArray(task.jsonЗаказа.Ошибки)) {
    //   task.jsonЗаказа.Ошибки = new Array();
    // }

    task.Заказ.Ошибки = task.arrError;
  }

  /** @param {Task} task*/
  task_get(task) {
    // if (!this.isOk(task)) { return; }
    this.packagingHistory.command_get(task);



  }

  /** @param {Task} task*/
  task_next(task) {
    // if (!this.isOk(task)) { return; }
    this.packagingHistory.command_next(task);
  }


  /** @param {Task} task*/
  task_print(task) {
    // if (!this.isOk(task)) { return; }
    this.packagingHistory.command_print(task);
  }


  /** @param {Task} task*/
  task_skip(task) {
    // if (!this.isOk(task)) { return; }
    this.packagingHistory.command_skip(task);
  }


  /** @param {Task} task*/
  task_done(task) {
    // if (!this.isOk(task)) { return; }
    this.packagingHistory.command_done(task);
  }



  /** @param {Task} task*/
  task_skip_and_next(task) {
    // if (!this.isOk(task)) { return; }
    this.packagingHistory.command_skip(task);
    if (task.hasError()) { return; }
    this.packagingHistory.command_next(task);
  }

  /** @param {Task} task*/
  task_done_and_next(task) {
    // if (!this.isOk(task)) { return; }
    this.packagingHistory.command_done(task);

    if (task.hasError()) { return; }

    this.packagingHistory.command_next(task);
  }



}


let web = {
  parameters: {
    task: "task", // задача 
    ret_format: "ret_format",  // формат ответа
    posting_number: "posting_number", // номер отправления   
    avtor: "avtor", // автор 
  },
  value: {
    task: {
      get: "get", // следующий заказ  после текущего
      next: "next", // следующий заказ  после текущего
      print: "print",  // пометить заказ как распечатанный
      skip: "skip",  // пометить заказ как Пропущенный
      done: "done",  // пометить заказ как Выполненный
      skip_and_next: "skip_and_next",  // пометить заказ как Пропущенный
      done_and_next: "done_and_next",  // пометить заказ как Выполненный
    },
    ret: {
      pdfUrl: "pdf", // только ссылку на Pdf
      json: "json",  // только json заказа
      html: "html",  // только html заказа
      posting_number: "posting_number",  // только номер отправления    
    },

  }
}




/**
 * https://developers.google.com/apps-script/guides/web
 * When a user visits an app or a program sends the app an HTTP GET request, Apps Script runs the function doGet(e).
 * When a program sends the app an HTTP POST request, Apps Script runs doPost(e) instead.
 * In both cases, the e argument represents an event parameter that can contain information about any request parameters.
 * The structure of the event object is shown in the table below:
 * @typedef {Object} EventPostGet
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
