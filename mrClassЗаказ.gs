class Товар {

  /**
   * @param {Array} arr 
   * @param {MrClassImportData} mrClassImportData 
  * */
  constructor(arr, mrClassImportData) {
    for (let i = 0; i < arr.length; i++) {
      let key = `${mrClassImportData.heads.Товар[i]}`;
      let value = arr[i];
      this[key] = value;
    }
  }
}



class Заказ {
  constructor(НомерОтправления) {
    this.НомерОтправления = НомерОтправления;
    this.Статус = СтатусУпаковки.Новый;
    this.МеткаМагазина = undefined;
    /** @type {Date} */
    this.ДатаОтгрузки = undefined;
    /** @type {InfoМагазина} */
    this.infoМагазина = undefined;
    // this.urlPdf = "МестоДляВставкиАдресаPDFфайла";
    this.urlPdf = undefined;
    this.vls = new Array();
    /** @type {Товар[]} */
    this.Товары = new Array();

    /** @private */
    this.valid = false;


    /** @type {JsonЗаказа} */
    this.jsonЗаказа = new Object();
    /** @type {string} */
    this.htmlЗаказа = undefined;


    this.request = undefined;

  }

  addСтроку(строка) {
    this.vls.push(строка)
  }

  isValid() {
    return true;
  }
  /** 
   * @param {MrClassImportData} mrClassImportData 
   * @param {MrClassPackagingHistory} mrClassPackagingHistory 
   * */
  init(mrClassImportData, mrClassPackagingHistory) {
    if (this.vls.length == 0) { this.valid = false; return; }

    /** @type {Array} */
    let v = this.vls[0];
    this.МеткаМагазина = v[mrClassImportData.cols.ВсеЗаказы.МеткаМагазина];
    this.ДатаОтгрузки = v[mrClassImportData.cols.ВсеЗаказы.ДатаОтгрузки];
    this.infoМагазина = getContext().getShopInfoForMark(this.МеткаМагазина);
    this.ПриоритетМагазина = getContext().arrПриоритетМагазина.indexOf(this.МеткаМагазина);

  }


  setUrlPdf(url) {
    this.urlPdf = url;
  }

  makeExport(mrClassImportData, mrClassPackagingHistory) {
    this.makeТовары(mrClassImportData, mrClassPackagingHistory);
    this.makeJson();
    // this.makeHtml();
  }

  makeТовары(mrClassImportData, mrClassPackagingHistory) {
    this.Товары = this.vls.map((v, i, arr) => { return new Товар(v, mrClassImportData) });
  }

  makeJson() {
    this.jsonЗаказа.НомерОтправления = this.НомерОтправления;
    // this.jsonЗаказа.Статус = СтатусИсторииУпаковки.МестоДляСтатуса;
    this.jsonЗаказа.Статус = this.Статус;
    this.jsonЗаказа.МеткаМагазина = this.МеткаМагазина;
    this.jsonЗаказа.СсылкаНаPDF = this.urlPdf;
    this.jsonЗаказа.ДатаОтгрузки = this.ДатаОтгрузки;
    this.jsonЗаказа.Кол_Во_Товаров = this.Товары.length;
    this.jsonЗаказа.Товары = this.Товары;
  }

  makeHtml() {
    // https://developers.google.com/apps-script/reference/html/html-template
    // https://developers.google.com/apps-script/guides/html/templates#index.html


    // A template which evaluates to whatever is bound to 'foo'.
    // var template = HtmlService.createTemplate('<?= foo ?>');
    // template.foo = 'Hello World!';
    // Logger.log(template.evaluate().getContent());  // will log 'Hello World!'




    // <table border="1" width="100%" cellpadding="5">
    //  <tr>
    //   <th>Ячейка 1</th>
    //   <th>Ячейка 2</th>
    //  </tr>
    //  <tr>
    //   <td>Ячейка 3</td>
    //   <td>Ячейка 4</td>
    // </tr>

    let templateТоваров = this.Товары.map((v, i, arr) => {
      let template = HtmlService.createTemplate(` 
    <tr>
    <th>  <?= col_1 ?>   </th>
    <th>  <?= col_2 ?>   </th>
    <th>  <?= col_3 ?>   </th>
    <th>  <?= col_4 ?>   </th>
    <th>  <?= col_5 ?>   </th>
   </tr>
   `);
      template.col_1 = `${v["Артикул МП"]}`
      template.col_2 = `${v["Наименование"]}`
      template.col_3 = `${v["Кол-во"]}`
      template.col_4 = `${v["Артикул товара"]}`
      template.col_5 = `${v["Фото"]}`
      return template.evaluate().getContent();
    });

    let retTemplate = HtmlService.createTemplate(`

    <h2> <?= v_1 ?>  </h2>
    <h2> <?= v_2 ?>  </h2>
    <h2> <?= v_3 ?>  </h2>
    <h2>  Всего в отправлении <?= v_4 ?>  </h2>
    
    <table border="1" width="100%" cellpadding="5">
    ${templateТоваров.join("")}
    </table>
    
    `);

    retTemplate.v_1 = this.jsonЗаказа.НомерОтправления;
    retTemplate.v_2 = this.jsonЗаказа.МеткаМагазина;
    retTemplate.v_3 = this.jsonЗаказа.ДатаОтгрузки;
    retTemplate.v_4 = this.jsonЗаказа.Кол_Во_Товаров;

    this.htmlЗаказа = retTemplate.evaluate().getContent();

  }









}

let DefНомерОтправления = {
  ВСЕ_ВЫПОЛНЕННО: "ВСЕ_ВЫПОЛНЕННО",
  НЕ_ВЫБРАН_ЗАКАЗ: "НЕ ВЫБРАН ЗАКАЗ",
}


class DefЗаказ extends Заказ {
  constructor(НомерОтправления) {
    super(НомерОтправления);

    this.Статус = СтатусУпаковки.Выполнено;
    this.МеткаМагазина = "ГОТОВО";
    /** @type {Date} */
    this.ДатаОтгрузки = new Date();
    /** @type {InfoМагазина} */
    this.infoМагазина = undefined;
    // this.urlPdf = "МестоДляВставкиАдресаPDFфайла";
    this.urlPdf = "https://drive.google.com/file/d/";
    this.vls = new Array();
    /** @type {Товар[]} */
    this.Товары = new Array();

    /** @private */
    this.valid = true;

    /** @type {JsonЗаказа} */
    this.jsonЗаказа = new Object();
    /** @type {string} */
    this.htmlЗаказа = undefined;
    this.request = undefined;
  }

}



/**
 * @typedef {Object} JsonЗаказа
 * @property {string} НомерОтправления
 * @property {string} Статус
 * @property {boolean} Распечатан
 * @property {string} МеткаМагазина
 * @property {string} СсылкаНаPDF
 * @property {Date} ДатаОтгрузки
 * @property {number} Кол_Во_Товаров
 * @property {Товар[]} Товары
 * @property {Strung[]} Ошибки
 * @property {Date} ДатаВремяФормерованияJSON
 * @property {boolean} onlyGet
 * @property {number} row
 * 
 */



 




























