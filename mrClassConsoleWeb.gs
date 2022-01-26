
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

function triggerИмпортДанных(info = undefined, duration = 1 / 24 / 60 * 5) {
  MrLib.triggerИмпортДанных(info, duration);
}


function menuИмпортДанных() {
  MrLib.menuИмпортДанных();
}

function menuОчиститьКонсоли() {
  MrLib.menuОчиститьКонсоли();
}

function triggerHelpИсторияУаковки(info = undefined, duration = 1 / 24 / 60 * 5) {
  
  MrLib.triggerHelpИсторияУаковки(info, duration);
}



function menu_print(){ MrLib.menu_lib_print(); }   //  Напечатано
function menu_skip() { MrLib.menu_lib_skip(); }    //  Пропустить
function menu_done() { MrLib.menu_lib_done(); }   //   Выполнено
function menu_next() { MrLib.menu_lib_next(); }   //   Следующий




