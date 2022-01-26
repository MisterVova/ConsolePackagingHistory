function refresh_new_orders_packing_console() {

  // Получение доступа к таблице Консоли упаковки
  var sheet_history_packing = SpreadsheetApp.openById('1-Iqv5hPXzKiDur9mn_zT9DvfzZHb8qF3cAoV6sR5mFM').getSheetByName('История упаковки');
  clear_history_packing = sheet_history_packing.getRange("A2:B").clearContent();  // Очистка от предыдущих данных
  
  var sheet_orders_packing = SpreadsheetApp.openById('1-Iqv5hPXzKiDur9mn_zT9DvfzZHb8qF3cAoV6sR5mFM').getSheetByName('Импорт данных');

  // Блок получения данных для обработки
  var lastRow = sheet_history_packing.getLastRow();
  var check_orders = sheet_orders_packing.getRange("K3:L").getValues();

  // Блок обновления данных по новым заказам
  for(i=0, iLen=check_orders.length; i<iLen; i++) {
    
    // Пустые строки пропускаем
    if(check_orders[i][0] == ""){continue}   

    // Если находим тогда переносим на историю упаковки
    if(check_orders[i][1] == "awaiting_deliver" || check_orders[i][1] == "awaiting_packaging" ){
                                            
      sheet_history_packing.getRange(lastRow+1,1).setValue(check_orders[i][0])   // Номер отправления
      sheet_history_packing.getRange(lastRow+1,2).setValue("Новый")              // Статус
      lastRow++
    }
  }
}