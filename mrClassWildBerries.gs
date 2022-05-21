// "Поставки WB"

function Заказы_WB() {
  new MrClassSheetWB("Поставки WB").Заказы_WB();
}




function get_menu_WB() {
  let menu = SpreadsheetApp.getUi().createMenu("Поставки WB");

  // //GET /api/v2/supplies  // Возвращает список поставок   // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/get_api_v2_supplies
  // get_supplies: "/api/v2/supplies",
  menu.addItem("Все поставки", "menu_Все_поставки");

  // // POST  /api/v2/supplies // Создаёт новую поставку; // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/post_api_v2_supplies
  // post_supplies: "/api/v2/supplies",
  menu.addItem("Создать поставку", "menu_Создать_поставку");

  // // PUT /api/v2/supplies/{id} // Добавляет к поставке заказы // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/put_api_v2_supplies__id_
  // put_supplies_id: "/api/v2/supplies/{id}",
  // menu.addItem("Добавить заказ", "menu_Добавить_заказ");

  // // POST  /​api/v2/supplies/{id}/close  // Закрывает поставку //  https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/post_api_v2_supplies__id__close
  // post_supplies_id_close: "/api/v2/supplies/{id}/close",
  menu.addItem("Закрыть поставку", "menu_Закрыть_поставку");

  // // GET /api/v2/supplies/{id}/barcode // Возвращает штрихкод поставки в заданном формате // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/get_api_v2_supplies__id__barcode
  // get_supplies_id_barcode: "/api/v2/supplies",
  menu.addItem("Штрихкод поставки", "menu_Штрихкод_поставки");

  // // GET ​/api​/v2​/supplies​/{id}​/orders // Возвращает список заказов, закреплённых за поставкой  // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/get_api_v2_supplies__id__orders
  // get_supplies_id_orders: "/api​/v2​/supplies​/{id}​/orders",
  menu.addItem("Список заказов", "menu_Список_заказов");

  // menu.addSeparator();
  // menu.addItem("Этикетки Заказов", "menu_Этикетки_Заказов");
  // menu.addItem("Список заказов", "menu_Список_заказов");

  return menu;
}

function menu_Все_поставки() { new MrClassSheetWB("Поставки WB").Все_поставки(); }  // get_supplies:
function menu_Создать_поставку() { new MrClassSheetWB("Поставки WB").Создать_поставку(); } // post_supplies:
function menu_Добавить_заказ() {   // put_supplies_id:
  let sheetWB = new MrClassSheetWB("Поставки WB");
  let supplyId = sheetWB.getIdАктивнойПоставки();
  // let orders = 298190212;
  // let orders = 298185516;
  let orders = 298190587;
  sheetWB.Добавить_заказ(supplyId, [orders]);
}
function menu_Закрыть_поставку() {
  let sheetWB = new MrClassSheetWB("Поставки WB");
  let supplyId = sheetWB.getIdАктивнойПоставки();
  sheetWB.Закрыть_поставку(supplyId);
  // new MrClassSheetWB("Поставки WB").Закрыть_поставку();
}  // post_supplies_id_close: 
function menu_Штрихкод_поставки() {

  let sheetWB = new MrClassSheetWB("Поставки WB");
  let supplyId = sheetWB.getIdАктивнойПоставки();
  sheetWB.Штрихкод_поставки(supplyId, "pdf");
}  // get_supplies_id_barcode:
function menu_Список_заказов() { // get_supplies_id_orders
  let sheetWB = new MrClassSheetWB("Поставки WB");
  let supplyId = sheetWB.getIdАктивнойПоставки();
  sheetWB.Список_заказов(supplyId);
}

function menu_Этикетки_Заказов() {   // put_supplies_id:
  let sheetWB = new MrClassSheetWB("Поставки WB");
  let orderIds = [298190212, 298185516, 298190587];
  // let orderIds = [298190587,];
  let vls = orderIds.map(v => [v, sheetWB.Этикетки_Заказов(v, "pdf")]);
  sheetWB.sheet.getRange(sheetWB.rowBodyLast + 1, sheetWB.col.заказы.pdf, vls.length, vls[0].length).setValues(vls);
  // sheetWB.Этикетки_Заказов(orderIds,"svg");
  // sheetWB.Этикетки_Заказов(orderIds,"pdf");
}




class MrClassSheetWB {
  constructor(sheetName) {
    this.sheetName = sheetName;
    this.sheet = SpreadsheetApp.getActive().getSheetByName(this.sheetName)


    this.rowHeadKey = 3;
    this.rowBodyFirst = 4;
    this.rowBodyLast = this.sheet.getLastRow();

    if (this.rowBodyLast < this.rowBodyFirst) { this.rowBodyLast = this.rowBodyFirst; }


    this.col_first = this.nr("A");
    this.col_Last = this.sheet.getLastColumn();


    this.col = {
      поставки: {
        first: nr("A"),
      },
      заказы: {
        first: nr("G"),
        pdf: nr("D"),
      }

    }

    this.ranges = {
      timeRange: "B1",
      текущая_поставка: "A1",
      штрихкод_поставки: "D1",
      штрихкод_поставки_url: "E1",
    }


  }

  nr(A1) {
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



  getTimeRange() {
    let timeRangeStr = this.sheet.getRange(this.ranges.timeRange).getValue();

    Logger.log("getTimeRange | " + timeRangeStr);
    let time_from = (() => { try { let tt = `${timeRangeStr}`.split("=", 2)[0]; return new Date(tt); } catch { return new Date(); } })();
    let time_to = (() => { try { let tt = `${timeRangeStr}`.split("=", 2)[1]; if (fl_str(tt) != fl_str("сегодня")) return new Date(tt); return new Date(); } catch { return new Date(); } })();

    let ret = new Object()

    ret.time_from = time_from;
    ret.time_to = time_to;

    // Logger.log("getTimeRange | " + JSON.stringify(ret));

    return ret;
  }

  getColKeys() {
    return this.sheet.getRange(this.rowHeadKey, this.col_first, 1, this.col_Last - this.col_first + 1).getValues()[0];
  }


  Заказы_WB() {

    let allItems = new Array();

    let timeRange = this.getTimeRange()

    let dateFrom = JSON.stringify(timeRange.time_from).slice(1, -1);
    let dateTo = JSON.stringify(timeRange.time_to).slice(1, -1);

    let skip = 0
    let take = 100



    while (true) {

      let url = `${urls.заказы.get_orders}?date_start=${dateFrom}&date_end=${dateTo}&skip=${skip}&take=${take}`;
      Logger.log(`url | ${url}`);
      let wb = new MrClassWildBerries();
      let response = wb.fetch_json(url, undefined, "GET", "Инфо_остатков_WB");
      Logger.log(response);
      let items = JSON.parse(response)["orders"];
      let total = JSON.parse(response)["total"];

      if (!Array.isArray(items)) {
        Logger.log(items);
        throw new Error("что то пошло не так")
        //что то пошло не так
        return;
      }
      allItems = [].concat(allItems, items);
      if (allItems.length >= total) { break }
    }

    this.sheet.getRange(this.rowBodyFirst, this.col_first, this.rowBodyLast - this.rowBodyFirst + 1, this.col_Last - this.col_first + 1).clearContent();
    let vls = allItems.map((item, i, arr) => {
      let retArr = new Array();
      let date = new Date(item["dateCreated"]);
      retArr.push(item["orderId"]);
      retArr.push(date);
      retArr.push(undefined);
      retArr.push(undefined);
      retArr.push(item["barcode"]);
      retArr.push(item["status"]);
      retArr.push(item["userStatus"]);
      retArr.push(date.getTime());
      return retArr;
    });


    Logger.log(vls);

    if (vls.length == 0) { return; }
    this.sheet.getRange(this.rowBodyFirst, this.col_first, vls.length, vls[0].length).setValues(vls);

  }





  // //GET /api/v2/supplies  // Возвращает список поставок   // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/get_api_v2_supplies
  // get_supplies: "/api/v2/supplies",
  Все_поставки() {
    let vls = new Array();
    let wb = new MrClassWildBerries();

    let url = `${urls.поставки.get_supplies}?status=${wb.статус.поставки.ACTIVE}`;
    let response = wb.fetch_json(url, undefined, "GET", "Все_поставки");
    Logger.log(response);
    let supplies = JSON.parse(response)["supplies"];
    if (Array.isArray(supplies)) {
      supplies.forEach(v => vls.push([v["supplyId"], wb.статус.поставки.ACTIVE]))
    }

    url = `${urls.поставки.get_supplies}?status=${wb.статус.поставки.ON_DELIVERY}`;
    response = wb.fetch_json(url, undefined, "GET", "Все_поставки");
    Logger.log(response);
    supplies = JSON.parse(response)["supplies"];
    if (Array.isArray(supplies)) {
      supplies.forEach(v => vls.push([v["supplyId"], wb.статус.поставки.ON_DELIVERY]))
    }
    Logger.log(vls);

    this.sheet.getRange(this.rowBodyFirst, this.col.поставки.first, this.rowBodyLast - this.rowBodyFirst + 1, 2).clearContent();
    if (vls.length == 0) { return; }
    this.sheet.getRange(this.rowBodyFirst, this.col.поставки.first, vls.length, vls[0].length).setValues(vls);

  }

  // // POST  /api/v2/supplies // Создаёт новую поставку; // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/post_api_v2_supplies
  // post_supplies: "/api/v2/supplies",
  Создать_поставку() {
    let wb = new MrClassWildBerries();

    let url = `${urls.поставки.post_supplies}`;
    let response = wb.fetch_json(url, undefined, "POST", "Создать_поставку", 201);
    Logger.log(response);
    let supplyId = JSON.parse(response)["supplyId"];
    this.sheet.getRange(this.ranges.текущая_поставка).setValue(supplyId);

  }

  getIdАктивнойПоставки() {
    let ret = this.sheet.getRange(this.ranges.текущая_поставка).getValue();
    if (!ret){ throw "Нет Активной поставки"}
    return ret; 
  }

  // // PUT /api/v2/supplies/{id} // Добавляет к поставке заказы // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/put_api_v2_supplies__id_
  // put_supplies_id: "/api/v2/supplies/{id}",
  /** @param {string} supplyId  @param {[string]} orders   */
  Добавить_заказ(supplyId, orders) {
    if (!supplyId) { throw new Error("supplyId ID_Поставки не может быть пустым"); }
    if (!orders) { throw new Error("orders список заказов не могут быть пустыми"); }
    if (!Array.isArray(orders)) { orders = [orders]; }
    if (orders.length == 0) { throw new Error("orders список заказов не могут быть пустыми"); }

    orders = orders.map(v => `${v}`);
    let data = {
      "orders": orders,
    }

    let url = `${urls.поставки.put_supplies_id}`.replace("{id}", supplyId);
    let wb = new MrClassWildBerries();
    let response = wb.fetch_json(url, data, "PUT", "Добавить_заказ", 204);
    Logger.log(response);

  }

  // // POST  /​api/v2/supplies/{id}/close  // Закрывает поставку //  https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/post_api_v2_supplies__id__close
  // post_supplies_id_close: "/api/v2/supplies/{id}/close",
  Закрыть_поставку(supplyId) {
    if (!supplyId) { throw new Error("supplyId ID_Поставки не может быть пустым"); }
    let url = `${urls.поставки.post_supplies_id_close}`.replace("{id}", supplyId);
    let wb = new MrClassWildBerries();
    let response = wb.fetch_json(url, undefined, "POST", "Закрыть_поставку", 204);
    this.sheet.getRange(this.ranges.текущая_поставка).setValue(undefined);
    Logger.log(response);
  }

  // // GET /api/v2/supplies/{id}/barcode // Возвращает штрихкод поставки в заданном формате // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/get_api_v2_supplies__id__barcode
  // get_supplies_id_barcode: "/api/v2/supplies",   // pdf, svg
  Штрихкод_поставки(supplyId, type = "pdf") {
    if (!supplyId) { throw new Error("supplyId ID_Поставки не может быть пустым"); }
    let url = `${urls.поставки.get_supplies_id_barcode}?type=${type}`.replace("{id}", supplyId);
    let wb = new MrClassWildBerries();
    let response = wb.fetch_json(url, undefined, "GET", "Штрихкод_поставки", 200);
    Logger.log(response);
    this.sheet.getRange(this.ranges.штрихкод_поставки).setValue(response);
  
    let response_pdf_base64 = JSON.parse(response);
    let base64String = response_pdf_base64.file;
    let folderId = new MrClassOZON().folderId;
    let name = `${supplyId}`;
    let ret_url_pdf = base64_to_url_pdf(base64String, name, folderId);
    this.sheet.getRange(this.ranges.штрихкод_поставки_url).setValue(ret_url_pdf);
    print_pdf_by_url(ret_url_pdf);
    return ret_url_pdf;


  }

  // // GET ​/api​/v2​/supplies​/{id}​/orders // Возвращает список заказов, закреплённых за поставкой  // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/get_api_v2_supplies__id__orders
  // get_supplies_id_orders: "/api​/v2​/supplies​/{id}​/orders",
  Список_заказов(supplyId) {
    if (!supplyId) { throw new Error("supplyId ID_Поставки не может быть пустым"); }
    let url = `${urls.поставки.get_supplies_id_orders}`.replace("{id}", supplyId);
    let wb = new MrClassWildBerries();
    let response = wb.fetch_json(url, undefined, "GET", "Список_заказов", 200);

    let allItems = JSON.parse(response)["orders"];

    this.sheet.getRange(this.rowBodyFirst, this.col.заказы.first, this.rowBodyLast - this.rowBodyFirst + 1, this.col_Last - this.col.заказы.first + 1).clearContent();
    let vls = allItems.map((item, i, arr) => {
      let retArr = new Array();
      retArr.push(undefined);
      retArr.push(item["orderId"]);
      retArr.push(item["dateCreated"]);
      retArr.push(item["storeId"]);
      retArr.push(item["wbWhId"]);
      retArr.push(item["pid"]);
      retArr.push(item["officeAddress"]);
      retArr.push(item["chrtId"]);
      retArr.push(item["barcodes"]);
      retArr.push(item["status"]);
      retArr.push(item["userStatus"]);
      retArr.push(item["rid"]);
      retArr.push(item["totalPrice"]);
      retArr.push(item["currencyCode"]);
      retArr.push(item["orderUID"]);
      retArr.push(item["deliveryType"]);
      return retArr;
    });

    Logger.log(vls);
    if (vls.length == 0) { return; }
    this.sheet.getRange(this.rowBodyFirst, this.col.заказы.first, vls.length, vls[0].length).setValues(vls);

  }

  Этикетки_Заказов(orderIds, type = "pdf") {
    if (!orderIds) { throw new Error("orders список заказов не могут быть пустыми"); }
    if (!Array.isArray(orderIds)) { orderIds = [orderIds]; }
    if (orderIds.length == 0) { throw new Error("orders список заказов не могут быть пустыми"); }

    orderIds = orderIds.map(v => Number.parseInt(`${v}`));
    let data = {
      "orderIds": orderIds,
      "type": "code128",
    }
    let url = (type != "pdf" ? `${urls.заказы.post_orders_stickers}` : `${urls.заказы.post_orders_stickers_pdf}`);
    let wb = new MrClassWildBerries();
    let response = wb.fetch_json(url, data, "POST", "Этикетки_Заказов", 200);
    Logger.log(response);
    return response;
  }




  getValueByKey(obj, key) {
    if (`${key}` == "") { return JSON.stringify(obj); }

    let ret = undefined;

    let key_arr = `${key}`.split(".");
    // Logger.log(key_arr);
    let key_loc = key_arr[0];


    try {
      ret = obj[key_loc];
    } catch { return ret; }

    key_arr = key_arr.slice(1);
    // Logger.log(key_arr.length);
    if (key_arr.length != 0) {
      // Logger.log(key_arr.join("."));
      ret = this.getValueByKey(ret, key_arr.join("."))
    }
    return ret;
  }

}




let urls = {
  цены: {
    // POST
    // Загрузка цен. За раз можно загрузить не более 1000 номенклатур.
    // https://suppliers-api.wildberries.ru/swagger/index.html#/%D0%A6%D0%B5%D0%BD%D1%8B/post_public_api_v1_prices
    // /public/api/v1/prices
    post_prices: "/public/api/v1/prices",

    // GET
    // Получение информации по номенклатурам, их ценам, скидкам и промокодам. Если не указывать фильтры, вернётся весь товар.
    // https://suppliers-api.wildberries.ru/swagger/index.html#/%D0%A6%D0%B5%D0%BD%D1%8B/get_public_api_v1_info
    // ​"/public​/api​/v1​/info",
    get_info: "/public/api/v1/info",

  },


  остатки: {
    // GET ​/api​/v2​/stocks
    // Возвращает список товаров поставщика с их остатками
    // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/get_api_v2_stocks
    get_stocks: "​/api/v2/stocks",


    // POST ​/api​/v2​/stocks
    // Обновляет остатки товаров
    // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/post_api_v2_stocks
    post_stocks: "/api/v2/stocks",
  },


  заказы: {
    //  GET  /api/v2/orders     // Возвращает список сборочных заданий поставщика.     // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/get_api_v2_orders​
    get_orders: "/api/v2/orders",

    // POST ​/api​/v2​/orders​/stickers  // Возвращает список стикеров по переданному массиву сборочных заданий.  // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/post_api_v2_orders_stickers
    post_orders_stickers: "/api/v2/orders/stickers",

    // POST ​/api​/v2​/orders​/stickers​/pdf // Возвращает список стикеров в формате pdf по переданному массиву сборочных заданий. // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/post_api_v2_orders_stickers_pdf
    post_orders_stickers_pdf: "/api/v2/orders/stickers/pdf",


  },


  статискика: {
    // Отчет о продажах по реализации
    // https://suppliersstats.wildberries.ru/api/v1/supplier/reportDetailByPeriod
    продаж: "/api/v1/supplier/reportDetailByPeriod",
  },

  поставки: {
    //GET /api/v2/supplies  // Возвращает список поставок   // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/get_api_v2_supplies
    get_supplies: "/api/v2/supplies",

    // POST  /api/v2/supplies // Создаёт новую поставку; // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/post_api_v2_supplies
    post_supplies: "/api/v2/supplies",

    // PUT /api/v2/supplies/{id} // Добавляет к поставке заказы // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/put_api_v2_supplies__id_
    put_supplies_id: "/api/v2/supplies/{id}",

    // POST  /​api/v2/supplies/{id}/close  // Закрывает поставку //  https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/post_api_v2_supplies__id__close
    post_supplies_id_close: "/api/v2/supplies/{id}/close",

    // GET /api/v2/supplies/{id}/barcode // Возвращает штрихкод поставки в заданном формате // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/get_api_v2_supplies__id__barcode
    get_supplies_id_barcode: "/api/v2/supplies/{id}/barcode",

    // GET ​/api​/v2​/supplies​/{id}​/orders // Возвращает список заказов, закреплённых за поставкой  // https://suppliers-api.wildberries.ru/swagger/index.html#/Marketplace/get_api_v2_supplies__id__orders
    get_supplies_id_orders: "/api/v2/supplies/{id}/orders",

  },


  DOMEN: {
    api: "https://suppliers-api.wildberries.ru",
    stats: "https://suppliers-stats.wildberries.ru",
  },

}

function get_api_key_wb_() {
  return getContext().getShopInfoForMark("WB").Api_Key;
}


class MrClassWildBerries { //MrClassWildBerries
  constructor(api_key_wb = get_api_key_wb_(), domen = "https://suppliers-api.wildberries.ru") {
    // this.API_KEY_WB = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NJRCI6Ijg3MmY5ZDQ0LTFkYzEtNGQ4OC1iYTJhLTk5MzUwZjE4NWMwMCJ9.RmipB45ST3RWx8a8jJdm8d4d3SAKrNshW1nf5HCIc40";
    // this.API_KEY_WB = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NJRCI6IjE5YjQ3Yjg1LTkwYzgtNDUxNi04ZDBmLTRmMmRhYjJiM2U0OSJ9.YqkD2FZ39iJ_X8x_URGHk4LG3n6HSK63Fmdp6_HZnok";
    this.API_KEY_WB = api_key_wb;
    // this.DOMEN = "https://suppliers-api.wildberries.ru";
    this.DOMEN = domen;
    // Logger.log(`MrClassWildBerries constructor`)
    this.статус = {
      поставки: {
        ACTIVE: "ACTIVE",
        ON_DELIVERY: "ON_DELIVERY",
      },
    }

  }



  fetch_json(url, data = undefined, method = "GET", comment = "comment", responseCodeOk = 200) {
    url = `${this.DOMEN}${url}`;
    let ret = undefined;
    let headers = {
      "Authorization": `Bearer ${this.API_KEY_WB}`,
    }
    if (data) { headers["Content-Type"] = "application/json"; }

    let request = {
      'method': method,
      'muteHttpExceptions': true,
      "headers": headers,

    };
    if (data) { request["payload"] = JSON.stringify(data); }

    Logger.log(`MrClassWildBerries | ${comment} | url = ${url}`);
    Logger.log(`MrClassWildBerries | ${comment} | request = ${JSON.stringify(request)}`);
    Logger.log(`MrClassWildBerries | ${comment} | data = ${JSON.stringify(data)}`);

    // return JSON.stringify({"supplyId": "WB-GI-1234567"});
    // return JSON.stringify({
    //   "orders": [
    //     {
    //       "orderId": 13833711,
    //       "dateCreated": "2021-02-20T16:50:33.365+03:00",
    //       "storeId": 658434,
    //       "wbWhId": 119408,
    //       "pid": 0,
    //       "officeAddress": "г Ставрополь (Ставропольский край), Ленина 482/1",
    //       "chrtId": 11111111,
    //       "barcodes": [
    //         6665956397512
    //       ],
    //       "status": 2,
    //       "userStatus": 2,
    //       "rid": 100321840623,
    //       "totalPrice": 5600,
    //       "currencyCode": 643,
    //       "orderUID": "string",
    //       "deliveryType": 1
    //     },
    //     {
    //       "orderId": 13833711,
    //       "dateCreated": "2021-02-20T16:50:33.365+03:00",
    //       "storeId": 658434,
    //       "wbWhId": 119408,
    //       "pid": 0,
    //       "officeAddress": "г Ставрополь (Ставропольский край), Ленина 482/1",
    //       "chrtId": 11111111,
    //       "barcodes": [
    //         6665956397512
    //       ],
    //       "status": 2,
    //       "userStatus": 2,
    //       "rid": 100321840623,
    //       "totalPrice": 5600,
    //       "currencyCode": 643,
    //       "orderUID": "string",
    //       "deliveryType": 1
    //     },
    //     {
    //       "orderId": 13833711,
    //       "dateCreated": "2021-02-20T16:50:33.365+03:00",
    //       "storeId": 658434,
    //       "wbWhId": 119408,
    //       "pid": 0,
    //       "officeAddress": "г Ставрополь (Ставропольский край), Ленина 482/1",
    //       "chrtId": 11111111,
    //       "barcodes": [
    //         6665956397512
    //       ],
    //       "status": 2,
    //       "userStatus": 2,
    //       "rid": 100321840623,
    //       "totalPrice": 5600,
    //       "currencyCode": 643,
    //       "orderUID": "string",
    //       "deliveryType": 1
    //     }
    //   ]
    // });




    let response = undefined;
    try {
      response = UrlFetchApp.fetch(url, request); // в архив 

    } catch (err) {
      let err_str = mrErrToString(err);
      // return undefined;
    }
    if (!response) {
      throw new Error("Не удалось отправить запрос");
    }

    // Logger.log(`MrClassWildBerries | ${comment} | responseCode=${response.getResponseCode()}`)
    // Logger.log(`MrClassWildBerries | ${comment} | response.getContentText() = ${response.getContentText()}`);
    // Logger.log(`MrClassWildBerries | ${comment} | response = ${responseToJSON(response)}`);

    let responseCode = response.getResponseCode();
    Logger.log(`MrClassWildBerries | ${comment} | responseCode=${responseCode}`);
    if (responseCode != responseCodeOk) {
      Logger.log(`MrClassWildBerries ERROR | ${comment} | responseCode=${responseCode}`)
      Logger.log(`MrClassWildBerries ERROR | ${comment} | request = ${JSON.stringify(request)}`);
      Logger.log(`MrClassWildBerries ERROR | ${comment} | response.getContentText() = ${response.getContentText()}`);
      // Logger.log(`MrClassWildBerries | ${comment} | response = ${responseToJSON(response)}`);
      // if (responseCode == 409) throw new Error(" Error 409 : У данного поставщика уже есть активная поставка");
      // return ret;
      throw new Error(` Error ${responseCode} : ${response.getContentText()}`);
    }
    // Logger.log(`MrClassWildBerries | ${comment} | response.getContentText() = ${response.getContentText()}`);
    let responseText = response.getContentText();
    return responseText;
  }





  responseToJSON(response) {
    let ret = new Object();
    ret["ResponseCode"] = response.getResponseCode();
    ret["ContentText"] = response.getContentText();
    return JSON.stringify(ret);
  }



}



class MrClassTaskWB {

  /** @param {string} меткаМагазина*/
  isOrderWB(МеткаМагазина) {
    let метки_WB = ["WB",]
    let ret = false;
    // let МеткаМагазина = task.Заказ.МеткаМагазина;
    if (метки_WB.includes(fl_str(МеткаМагазина))) { ret = true; }
    return ret
  }



  /** @param {Task} task*/
  command_done(task) {
    if (!this.isOrderWB(task.Заказ.МеткаМагазина)) { return; }
    Logger.log(`MrClassTaskWB  command_done | Заказ.НомерОтправления=${task.Заказ.НомерОтправления}`);

    let sheetWB = new MrClassSheetWB("Поставки WB");
    let supplyId = sheetWB.getIdАктивнойПоставки();
    let orders = task.Заказ.НомерОтправления;
    sheetWB.Добавить_заказ(supplyId, [orders]);

  }


  /** @param {Task} task */
  getPdfUrlForTask(task) {
    Logger.log(`MrClassTaskWB  getPdfUrlForTask | Заказ.НомерОтправления=${task.sheetRowArr[1]}`);
    let sheetWB = new MrClassSheetWB("Поставки WB");

    let orderIds = [task.sheetRowArr[1],];
    /** @type ResponseFilePdfЭтикетки */
    let response_pdf_base64 = JSON.parse(sheetWB.Этикетки_Заказов(orderIds, "pdf"));

    let base64String = response_pdf_base64.data.file;
    let folderId = new MrClassOZON().folderId;
    let name = orderIds.join("_");
    let ret_url_pdf = base64_to_url_pdf(base64String, name, folderId);
    return ret_url_pdf;
  }



}

/**
 * @typedef {Object} ResponseFilePdfЭтикетки
 * @property {boolean} error	-
 * @property {string} errorText	-
 * @property {Object} data	-
 * @property {string} data.file - 
 * @property {string} data.name - 
 * @property {string} data.mimeType - 

 */


function base64_to_url_pdf(base64String, name, folderId) {
  // Logger.log(`base64_to_url_pdf | ${JSON.stringify({ base64String, name, folderId })}`);
  // return "https://drive.google.com/file/d/";
  let d = new Date();
  let tt = JSON.parse(`${JSON.stringify(d)}`);
  let newName = `${tt} | ${name}.pdf`
  // const base64String = await PDFLibDocument.saveAsBase64()
  const data = Utilities.base64Decode(base64String)
  let blob = Utilities.newBlob(data);
  blob.setName(newName);
  // blob.setContentType("application/pdf");
  let nf = DriveApp.createFile(blob);
  let destination = DriveApp.getFolderById(folderId);
  nf.moveTo(destination);
  let ret_url_pdf = nf.getUrl();
  Logger.log(ret_url_pdf)
  return ret_url_pdf;

}


function test_base64_to_url_pdf() {
  let json = `{"base64String":"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","name":"298190587","folderId":"1eOve2Aowgd65-YVlaj-kdT-YPCViI67p"}`
  json = JSON.parse(json);
  let base64String = json["base64String"];
  let name = json["name"];
  let folderId = "1eOve2Aowgd65-YVlaj-kdT-YPCViI67p";
  base64_to_url_pdf(base64String, name, folderId)

}

