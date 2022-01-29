
class ShopPackagingHistory {
  /**  @param {string} меткаМагазина  @param {Array[]} vls   @param {MrClassPackagingHistory} packHistory  */
  constructor(меткаМагазина, vls, packHistory) {
    this.меткаМагазина = меткаМагазина;
    /** @type {Map.<string,Array[]>} */
    this.mapСтатусУпаковки = new Map();

    let vlsF = vls.filter(/** @param {Array} v */(v, i, arr) => { return v[packHistory.cols.ВсеЗаказы.МеткаМагазина] == this.меткаМагазина; });
    Logger.log(` ShopPackagingHistory constructor  vlsF=${vlsF.length} `);
    vlsF.forEach(/** @param {Array} v */(v, i, arr) => { this.addVlsByСтатусУпаковки(v[packHistory.cols.ВсеЗаказы.Статус], v); })
  }


  /**  @param {string} статус   @returns {Array[]} */
  getVlsByСтатусУпаковки(статус) {
    if (!this.mapСтатусУпаковки.has(статус)) {
      let ret = new Array()
      this.mapСтатусУпаковки.set(статус, ret);
    }
    return this.mapСтатусУпаковки.get(статус);
  }

  /** @param {string} статус  @param {Array} v */
  addVlsByСтатусУпаковки(статус, v) {
    this.getVlsByСтатусУпаковки(статус).push(v);
  }

  /** @param {String[]} приориты  @returns {number[]} */
  getСписокПозиций(приориты) {
    let ret = new Array();

    for (let i = 0; i < приориты.length; i++) {
      let статус = приориты[i];
      let vls = this.getVlsByСтатусУпаковки(статус);
      if (vls.length == 0) { continue; }

      let rows = vls.map(/** @param {Array} v */(v, i, arr) => {
        return v[0];   // на нулевой позиции номер строки из таблици
      });
      Logger.log(` ShopPackagingHistory getСписокПозиций  this.меткаМагазина=${this.меткаМагазина} | статус=${статус} |  rows=${JSON.stringify(rows)}`);
      ret = ret.concat(rows);

    }

    Logger.log(` ShopPackagingHistory getСписокПозиций  this.меткаМагазина=${this.меткаМагазина}    ret=${JSON.stringify(ret)}`);
    return ret;
  }


}


class MrClassShops {
  /**  @param {Array[]} vls   @param {MrClassPackagingHistory} packHistory  */
  constructor(vls, packHistory) {
    this.vls = vls;
    this.packHistory = packHistory;


    // построение приоритета магазина по листу "История упаковки"
    this.arrПриоритетМагазина = new Array();
    vls.forEach(/** @param {Array} v */(v, i, arr) => {
      let меткаМагазина = v[packHistory.cols.ВсеЗаказы.МеткаМагазина];
      if (this.arrПриоритетМагазина.includes(меткаМагазина)) { return; }
      this.arrПриоритетМагазина.push(меткаМагазина);
    });
    Logger.log(`this.arrПриоритетМагазина =${this.arrПриоритетМагазина}`);

  }


  /** @param {String[]}   @returns {[number]} */
  getСледующиеЗаказы(приориты = [СтатусУпаковки.Новый, СтатусУпаковки.Пропущено]) {
    // let приориты = [СтатусУпаковки.Новый, СтатусУпаковки.Пропущено];
    let rowsЗаказовВРаботе = this.packHistory.getRowsЗаказовВРаботе();

    let ret = undefined;
    let меткаМагазина = undefined;
    for (let i = 0; i < this.arrПриоритетМагазина.length; i++) {
      меткаМагазина = this.arrПриоритетМагазина[i];
      let магазин = new ShopPackagingHistory(меткаМагазина, this.vls, this.packHistory);
      let списокПозиций = магазин.getСписокПозиций(приориты);

      списокПозиций = списокПозиций.filter((v, i, arr) => { return !rowsЗаказовВРаботе.includes(v) });


      Logger.log(`MrClassShops getПриоритетУпакоки меткаМагазина=${меткаМагазина}    списокПозиций=${JSON.stringify(списокПозиций)}`);
      if (списокПозиций.length == 0) { continue; }  // для магазина все выполнили 
      ret = списокПозиций;
      break;
    }

    if (!Array.isArray(ret)) {
      ret = new Array(); // больше нет заказов;
    }

    Logger.log(`MrClassShops getПриоритетУпакоаки меткаМагазина=${меткаМагазина}    ret=${JSON.stringify(ret)}`);
    return ret;
  }

}
