function print_pdf() {
  
  // Блок настройки соединения с магазином

  let options = {
    method: "POST",
    "headers": {
      "Client-Id": `${shopInfo["Client-Id"]}`, // Сюда внести данные ID магазина к которому будет отправляться запрос
      "Api-Key": `${shopInfo["Api-Key"]}`,     // Сюда внести данные ключа магазина к которому будет отправляться запрос
      "Content-Type": "application/json"
    },
    'muteHttpExceptions': true,
    'payload': JSON.stringify(data)
  }

  var url = "https://api-seller.ozon.ru/v2/posting/fbs/package-label"; // Выполнение метода МП


  // Блок отправки данных на сервер

  let data = {
      posting_number: [`${pos_number}`] // Сюда внести откуда будет забираться номер отправления
    }
  

  // Блок приёма данных от сервера

  var response = UrlFetchApp.fetch(url, options)

  var blob_pdf = response.getBlob();

  var download_pdf = DriveApp.createFile(blob_pdf.setName('New_pdf_ozon')); // Задаём имена файлам

  let url_pdf = download_pdf.getUrl();


  // Блок отображения скачанного PDF

  var html = HtmlService.createHtmlOutput('<html><script>'
  +'window.close = function(){window.setTimeout(function(){google.script.host.close()},9)};'
  +'var a = document.createElement("a"); a.href="'+url_pdf+'"; a.target="_blank";'
  +'if(document.createEvent){'
  +'  var event=document.createEvent("MouseEvents");'
  +'  if(navigator.userAgent.toLowerCase().indexOf("firefox")>-1){window.document.body.append(a)}'                          
  +'  event.initEvent("click",true,true); a.dispatchEvent(event);'
  +'}else{ a.click() }'
  +'close();'
  +'</script>'
  // В случае сбоя приведенного выше кода, предложение альтернативы ниже.
  +'<body style="word-break:break-word;font-family:sans-serif;">Не удалось открыть автоматически. <a href="'+url_pdf+'" target="_blank" onclick="window.close()">Нажмите здесь, чтобы продолжить</a>.</body>'
  +'<script>google.script.host.setHeight(100);google.script.host.setWidth(410)</script>'
  +'</html>')
  .setWidth( 400 ).setHeight( 10 );
  SpreadsheetApp.getUi().showModalDialog( html, "Открываем...." );


}
