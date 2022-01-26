


class MrClassImportData {
  constructor() {
    this.sheet = getContext().getSheetByName(getContext().sheetNameИмпортДанных);
    this.mrClassPackagingHistory = getContext().getMrClassPackagingHistory();
    this.makeCol();

    this.url = new MrClassOZON().url_OZON;
    Logger.log(`MrClassImportData constructor = ${JSON.stringify(this)}}`);

  }

  getValues() {
    // Logger.log(`MrClassImportData getValues`);
    if (!this.values) {
      // Logger.log(`MrClassImportData getValues INIT`);
      let vls = this.sheet.getRange(this.rows.bodyFirst, this.cols.ВсеЗаказы.first, this.rows.bodyLast - this.rows.bodyFirst + 1, this.cols.ВсеЗаказы.last - this.cols.ВсеЗаказы.first + 1).getValues();
      vls = vls.map((v, i, arr) => { return [i + this.rows.bodyFirst].concat(v); }); //  добавляем номер строки  

      // блок фильтрации
      vls = vls.filter((v, i, arr) => { return v[this.cols.ВсеЗаказы.НомерОтправления] != "" });


      let arrДатыОтгрузки = getContext().valueOfWorkingDates;
      // vls = vls.filter((v, i, arr) => { return arrДатыОтгрузки.includes(new Date(v[this.cols.ВсеЗаказы.ДатаОтгрузки]).setHours(0, 0, 0, 0)) });
      vls = vls.filter((v, i, arr) => {
        let dey = new Date(new Date(v[this.cols.ВсеЗаказы.ДатаОтгрузки]).setHours(0, 0, 0, 0));
        // let dey = new Date(v[this.cols.ВсеЗаказы.ДатаОтгрузки]).setHours(0, 0, 0, 0);
        dey = JSON.stringify(dey);
        // Logger.log(`MrClassImportData getValues dd=${dey}`);
        // return arrДатыОтгрузки.includes(new Date(new Date(v[this.cols.ВсеЗаказы.ДатаОтгрузки]).setHours(0, 0, 0, 0)));
        return arrДатыОтгрузки.includes(dey);
      });


      let arrМеткиМагазинов = getContext().arrПриоритетМагазина;
      vls = vls.filter((v, i, arr) => { return arrМеткиМагазинов.includes(fl_str(v[this.cols.ВсеЗаказы.МеткаМагазина])) });


      let arrСтатусыМПкОтправке = getContext().arrСтатусыМПкОтправке;
      vls = vls.filter((v, i, arr) => { return arrСтатусыМПкОтправке.includes(v[this.cols.ВсеЗаказы.СтатусМП]) });


      // блок коректировки  и добовления карточки 


      for (let i = 0; i < vls.length; i++) {
        vls[i][this.cols.ВсеЗаказы.НомерОтправления] = `${vls[i][this.cols.ВсеЗаказы.НомерОтправления]}`;
        vls[i][this.cols.ВсеЗаказы.МеткаМагазина] = `${fl_str(vls[i][this.cols.ВсеЗаказы.МеткаМагазина])}`;
      }
      let ВсеКарточки = this.getВсеКарточки();
      vls = vls.map((v, i, arr) => {

        let АртикулМП = `${v[this.cols.ВсеЗаказы.АртикулМП]}`;
        // Logger.log(АртикулМП);
        // let карточка = ВсеКарточки.get(АртикулМП)
        let vk = [].concat(ВсеКарточки.get(АртикулМП)).slice(1);
        return [].concat(v, vk);
      }); //  добавляем из карточки



      // проверки  блок
      // vls.forEach((v, i, arr) => Logger.log(`row=${v[0]} | v =${JSON.stringify(v)}`));
      // getContext().getSheetByName(getContext().sheetNameLogs).clearContents();
      // if (vls.length > 0) { getContext().getSheetByName(getContext().sheetNameLogs).getRange(1, 1, vls.length, vls[0].length).setValues(vls); } else { getContext().getSheetByName(getContext().sheetNameLogs).getRange(1, 1).setValue("пусто") }


      this.values = vls;
    }
    Logger.log(`MrClassImportData getValues this.values.length=${this.values.length}`);
    return this.values;
  }


  getВсеЗаказыMap() {
    // Logger.log(`MrClassImportData getВсеЗаказыMap `);
    if (this.maps.ВсеЗаказы.size == 0) {
      // Logger.log(`MrClassImportData getВсеЗаказыMap this.maps.ВсеЗаказы.size == 0  INIT`);

      let vls = this.getValues();

      vls.forEach((v, i, r) => {
        let НомерОтправления = v[this.cols.ВсеЗаказы.НомерОтправления]
        if (this.maps.ВсеЗаказы.has()) { return; }
        this.maps.ВсеЗаказы.set(НомерОтправления, new Заказ(НомерОтправления));
      });

      vls.forEach((v, i, r) => {
        let НомерОтправления = v[this.cols.ВсеЗаказы.НомерОтправления]
        this.maps.ВсеЗаказы.get(НомерОтправления).addСтроку(v);
      });
      Logger.log(`this.maps.ВсеЗаказы.size=${this.maps.ВсеЗаказы.size}`);
      // this.maps.ВсеЗаказы.forEach((value, key) => { Logger.log(`ВсеЗаказы key=${key} | value=${JSON.stringify(value)}`) });
    }

    return this.maps.ВсеЗаказы;
  }



  getВсеЗаказыArr() {
    // Logger.log(`MrClassImportData getВсеЗаказыArr `);
    if (this.arrs.ВсеЗаказы.length == 0) {
      // Logger.log(`MrClassImportData getВсеЗаказыArr this.arrs.ВсеЗаказы.length == 0  INIT`);

      // блок дозаполняем заказ
      // дозаполняем заказ  
      for (let [key, vls] of this.getВсеЗаказыMap().entries()) {
        // Logger.log(`key=${key} | vls =${JSON.stringify(vls)}`);
        /** @type  {Заказ}*/
        let заказ = vls;
        заказ.init(this, this.mrClassPackagingHistory);
        // if (!заказ.isValid()) { continue; }
        this.arrs.ВсеЗаказы.push(заказ);
      }

      // this.arrs.ВсеЗаказы = this.arrs.ВсеЗаказы.slice(-20);
      // готовим URL_PDF
      let requestArr = this.arrs.ВсеЗаказы.map(/** @param {Заказ} заказ */(заказ, i, arr) => {
        let headers = {
          "Client-Id": заказ.infoМагазина.Client_Id,
          "Api-Key": заказ.infoМагазина.Api_Key,
          "Content-Type": "application/json"
        }

        let data = {
          posting_number: [`${заказ.НомерОтправления}`],
          // headers: headers,
        }

        let request = {
          'url': this.url,
          'method': 'POST',
          'muteHttpExceptions': true,
          "headers": headers,
          'payload': JSON.stringify(data),
        };

        заказ.request = request;
        return request;
      });


      // разжировать (сортировать)
      this.arrs.ВсеЗаказы.sort(/** @param {Заказ} заказA @param {Заказ} заказB */(заказA, заказB) => {
        let dA = заказA.ДатаОтгрузки.valueOf();
        let dB = заказB.ДатаОтгрузки.valueOf();
        let indA = заказA.ПриоритетМагазина;
        let indB = заказB.ПриоритетМагазина;
        if (dA == dB) {
          if (indA != indB) {
            if (indA > indB) {
              return 1;
            }
            else {
              return -1;
            }
          }
        } else {
          if (dA < dB) {
            return 1;
          }
          else {
            return -1;
          }
        }
        return 0;
      })

      // this.arrs.ВсеЗаказы.push(new DefЗаказ(DefНомерОтправления.ВСЕ_ВЫПОЛНЕННО));
      this.arrs.ВсеЗаказы.unshift(new DefЗаказ(DefНомерОтправления.ВСЕ_ВЫПОЛНЕННО));
      this.arrs.ВсеЗаказы.unshift(new DefЗаказ(DefНомерОтправления.НЕ_ВЫБРАН_ЗАКАЗ));
      // подготовить к табличному виду 
      this.arrs.ВсеЗаказы.forEach(/** @param {Заказ} заказ */(заказ, i, arr) => {
        заказ.makeExport(this, this.mrClassPackagingHistory);

      });


    }

    Logger.log(`this.arrs.ВсеЗаказы.length=${this.arrs.ВсеЗаказы.length}`);

    // this.arrs.ВсеЗаказы.forEach(/** @param {Заказ} заказ */(заказ, i, arr) => {
    //   Logger.log(`заказ[${i}] | ${JSON.stringify(заказ)}`);
    // });

    return this.arrs.ВсеЗаказы;
  }

  getВсеКарточки() {
    // Logger.log(`MrClassImportData getВсеКарточки `);

    if (this.maps.ВсеКарточки.size == 0) {
      // Logger.log(`MrClassImportData getВсеКарточки this.maps.ВсеКарточки.size == 0 INIT`);
      // this.maps.ВсеКарточки = new Map();

      let vls = this.sheet.getRange(this.rows.bodyFirst, this.cols.ВсеКарточки.first, this.rows.bodyLast - this.rows.bodyFirst + 1, this.cols.ВсеКарточки.last - this.cols.ВсеКарточки.first + 1).getValues();


      vls = vls.map((v, i, arr) => { return [i + this.rows.bodyFirst].concat(v); });
      // Logger.log(`MrClassImportData getВсеКарточки vls=${vls}`);
      vls.forEach((v, i, arr) => {

        let col_АртикулМП = this.cols.ВсеКарточки.АртикулМП - this.cols.ВсеКарточки.first + 1;
        // if (!v[this.cols.ВсеКарточки.АртикулМП-this.cols.ВсеКарточки.first+1]) { return; }
        // let key = `${v[this.cols.ВсеКарточки.АртикулМП]}`;
        if (!v[col_АртикулМП]) { return; }
        let key = `${v[col_АртикулМП]}`;
        this.maps.ВсеКарточки.set(key, v);
      })
    }

    Logger.log(`MrClassImportData getВсеКарточки this.maps.ВсеКарточки.size =${this.maps.ВсеКарточки.size}`);
    // this.maps.ВсеКарточки.forEach((value, key) => { Logger.log(`ВсеКарточки key=${key} | value=${value}`) })

    return this.maps.ВсеКарточки;
  }






  triggerИмпортДанных(info, duration = 1 / 24 / 60 * 5) {
    Logger.log(`MrClassImportData triggerИмпортДанных | info =${info}  `);
    Logger.log(`MrClassImportData triggerИмпортДанных | duration =${duration}  `);

    // this, this.mrClassPackagingHistory

    this.getВсеКарточки();
    this.getValues();
    this.getВсеЗаказыMap();
    this.getВсеЗаказыArr();
    this.mrClassPackagingHistory.setВсеЗаказыArr(this.getВсеЗаказыArr());

  }


  makeCol() {
    this.rows = {
      bodyFirst: 3,
      bodyLast: this.sheet.getLastRow(),
      heads: 2,
    }


    if (this.rows.bodyLast < this.rows.bodyFirst) {
      this.rows.bodyLast = this.rows.bodyFirst;
    }


    let i = 0;
    let j = 0;
    this.cols = {
      ВсеЗаказы: {
        first: nr("A"),
        last: nr("G"),
        МеткаМагазина: nr("A") + i++,
        АртикулМП: nr("A") + i++,
        НомерОтправления: nr("A") + i++,
        Наименование: nr("A") + i++,
        СтатусМП: nr("A") + i++,
        Кол_во: nr("A") + i++,
        ДатаОтгрузки: nr("A") + i++,
      },

      ВсеКарточки: {
        first: nr("H"),
        last: nr("J"),
        АртикулМП: nr("H") + j++,
        АртикулТовара: nr("H") + j++,
        Фото: nr("H") + j++,
      },
    }


    this.heads = {
      ВсеЗаказы: ["headsВсеЗаказы"].concat(this.sheet.getRange(this.rows.heads, this.cols.ВсеЗаказы.first, 1, this.cols.ВсеЗаказы.last - this.cols.ВсеЗаказы.first + 1).getValues()[0]),
      ВсеКарточки: ["headsВсеКарточки"].concat(this.sheet.getRange(this.rows.heads, this.cols.ВсеКарточки.first, 1, this.cols.ВсеКарточки.last - this.cols.ВсеКарточки.first + 1).getValues()[0]),
      Товар: ["строка"].concat(
        this.sheet.getRange(this.rows.heads, this.cols.ВсеЗаказы.first, 1, this.cols.ВсеЗаказы.last - this.cols.ВсеЗаказы.first + 1).getValues()[0],
        this.sheet.getRange(this.rows.heads, this.cols.ВсеКарточки.first, 1, this.cols.ВсеКарточки.last - this.cols.ВсеКарточки.first + 1).getValues()[0]
      ),
    }

    this.maps = {
      ВсеЗаказы: new Map(),
      ВсеКарточки: new Map(),
    }

    this.arrs = {
      ВсеЗаказы: new Array(),
    }
  }




}





function triggerИмпортДанных(info = undefined, duration = 1 / 24 / 60 * 5) {
  let classImportData = new MrClassImportData();
  classImportData.triggerИмпортДанных(info, duration);
  menuОчиститьКонсоли();
}

function menuИмпортДанных() {
  triggerИмпортДанных(`Вызов Триггера из меню ${new Date()}`);
}







