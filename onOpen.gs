
function onOpen() {

  var ui = SpreadsheetApp.getUi();
  var menu = ui.createMenu("Доп.Меню");

  menu.addSubMenu(SpreadsheetApp.getUi().createMenu('Консоль')
    .addItem('На Печать', 'menu_print')
    .addItem('Пропустить', 'menu_skip')
    .addItem('Выполнено', 'menu_done')
    .addItem('Следующий', 'menu_next')
  );

  menu.addSubMenu(SpreadsheetApp.getUi().createMenu('История упаковки')
    .addItem('Обновить', 'menuИмпортДанных')
    .addItem('Очистить Консоли', 'menuОчиститьКонсоли')
  );
  menu.addToUi();
  Logger.log(`onOpen.onOpen() menu заданно `);
}





