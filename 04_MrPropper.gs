// Это не трогать это функция очистки гугл диска




function mrPropper() {   

  var arrayOfFileIDs = [];

  var ThirtyDaysBeforeNow = new Date().getTime()-3600*1000*24*30;
    // 30 это количество дней 
    // (3600 секунд = 1 час, 1000 миллисекунд = 1 секунда, 24 часа = 1 день и 30 дней - это продолжительность, которую вы хотели
    // необходимо в формате год-месяц-день

  var cutOffDate = new Date(ThirtyDaysBeforeNow);
  var cutOffDateAsString = Utilities.formatDate(cutOffDate, "GMT", "yyyy-MM-dd");
  //Logger.log(cutOffDateAsString);

  var theFileID = "";

  //Создать массив идентификаторов файлов по критериям даты
  var files = DriveApp.searchFiles(
     'modifiedDate < "' + cutOffDateAsString + '"');

  while (files.hasNext()) {
    var file = files.next();
    theFileID = file.getId();

    arrayOfFileIDs.push(theFileID);
    //Logger.log('theFileID: ' + theFileID);
    //Logger.log('date last updated: ' + file.getLastUpdated());
  }

  return arrayOfFileIDs;
  //Logger.log('arrayOfFileIDs: ' + arrayOfFileIDs);
};
