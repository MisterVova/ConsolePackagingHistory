

class MrClassOZON {
  constructor() {
    Logger.log(`MrClassOZON constructor`)
    // this.folderId = "17xJrQluGnmaTzfZhuUm4QlgWkcrKvZhz";
    this.folderId = "17O5q_MaosDw0tzPU6wTdUEu_hAG49-QO";
    // this.folderId = "https://drive.google.com/drive/folders/17N_9YdtXDdjJwA7XQLr6o90hsz6BshAH";
    this.url_OZON = "https://api-seller.ozon.ru/v2/posting/fbs/package-label";
    this.url_if_error = "Ошибка исполнения";
  }


  fetchAllByRequestArr(requestArr) {

    let responseArr = undefined;
    try {
      responseArr = UrlFetchApp.fetchAll(requestArr);
    } catch (err) {
      let err_str = mrErrToString(err);
      responseArr = new Array(requestArr.length);
      responseArr.fill(err_str);
      return responseArr;
    }

    responseArr = responseArr.map((response, i, arr) => {
      try {
        if (response.getBlob().getContentType() != "application/pdf") {
          Logger.log(`Не "application/pdf"`);
          return " НЕ application/pdf | " + `responseToJSON = ${this.responseToJSON(response)}`;
        }

        let d = new Date();
        // let tt = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}-${d.getMilliseconds()}`;
        let tt = JSON.parse(`${JSON.stringify(d)}`);
        let posting_number = (() => { try { return JSON.parse(requestArr[i]["payload"])[0] } catch { return undefined } })();
        let newName = `${tt} | ${posting_number}.pdf`

        let blob = response.getBlob();
        let nf = DriveApp.createFile(blob.setName(newName));

        let destination = DriveApp.getFolderById(this.folderId);
        nf.moveTo(destination);
        let ret_url_pdf = nf.getUrl();
        // Logger.log(ret_url_pdf)
        return ret_url_pdf;
      } catch (err) {
        return mrErrToString(err);
      }
    });
    return responseArr;
  }



  responseToJSON(response) {
    let ret = new Object();
    ret["ResponseCode"] = response.getResponseCode();
    ret["ContentText"] = response.getContentText();
    return JSON.stringify(ret);
  }

}

