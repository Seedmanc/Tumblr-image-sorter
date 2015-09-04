# Версия для браузера Firefox в формате аддона

Теперь и пользовательским интерфейсом, возможностью сохранять и загружать списки тегов и папок, и все это без флэша.

## Установка

Пока [версия на AMO](https://addons.mozilla.org/en-US/firefox/addon/tumblr-image-sorter/) не пройдет проверку, можно скачивать .xpi файл из репозитория здесь и устанавливать перетаскиванием на окно браузера. Учтите, что начиная с версии 41, Firefox отказывается запускать неподписанные аддоны, поэтому при таком методе установки понадобится зайти в настройки about:config#xpinstall.signatures.required и установить этот параметр в false.

## Описание GUI

После установки (перезапуск не требуется) значок аддона появится справа на панели браузера, либо в меню.
  ![http://puu.sh/jZy8f/8bfddda662.png](http://puu.sh/jZy8f/8bfddda662.png)  
  
Эта кнопка открывает окно настроек, позволяющее ввести необходимые для работы [данные](https://github.com/Seedmanc/Tumblr-image-sorter/blob/master/README.rus.md#%D0%9D%D0%B5%D0%BE%D0%B1%D1%85%D0%BE%D0%B4%D0%B8%D0%BC%D1%8B%D0%B5-%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D0%B5).

### Списки

В их числе - игнорлист, список сопоставления тегов и папок, списки имен и метатегов. Они могут быть загружены из файла в формате JSON.

![http://puu.sh/jZz0Z/fa7d1ea701.png](http://puu.sh/jZz0Z/fa7d1ea701.png)

Аддон производит проверку вводимых данных по следующим правилам:

|Поле ввода  |Правила| Обработка ошибок | 
|:-:          |---  |---              |
|Ignore|Слова, разделенные запятыми|Лишние пробелы и запятые удаляются|
|Root| Полный путь к папке, включая букву диска |Выделяется красным, ввод пропускается|  
|Metasymbol|Допустимые для имен файлов символы кроме пробела| Выделяется оранжевым, заменяется на '!'|
|Folders левая часть| Любые символы кроме запятых, не пустое| Выделяется оранжевым, запятые удаляются. Пустое выделяется красным, вся строка пропускается |
|Folders правая часть|Допустимые для имен файлов символы (включая обратную косую черту), не пустое|Выделяется оранжевым, недопустимые символы заменяются на дефис. Пустое выделяется красным, вся строка пропускается|
|Name и meta левая часть|Как в folders|Как в folders|
|Name и meta правая часть|Как в folders (исключая обратную косую черту)|Как в folders|


In short, only the root and the three special folder entries (solo, group and unsorted) are essential and will be marked red if filled incorrectly/left blank. Other input mistakes are not critical and the addon will attempt to fix them by removing/replacing incorrect characters, while marking the input orange for user attention.

### Loading and saving databases.

Addon allows exporting and importing of folder list (including root folder and the metasymbol) and names+meta lists. Same data validation as above is applied when loading databases from a file. 

Before import user is asked to choose mode: add or replace data. Adding does not change records already present in the database.  
  File format is JSON-stringified Javascript objects, it is human-readable and can be edited before import (I recommend using something better than just Notepad). You can use my databases as an example: [folders.json.txt](https://github.com/Seedmanc/Tumblr-image-sorter/blob/master/!Firefox%20addon/folders.json.txt), [names & meta.json.txt](https://github.com/Seedmanc/Tumblr-image-sorter/blob/master/names%20%26%20meta.json.txt). Note that those databases are pretty large, over 250 entries in total.

### Options

![http://puu.sh/jZAhH/ba639a2632.png](http://puu.sh/jZAhH/ba639a2632.png)

This should be self-explanatory, I hope.

### About

![http://puu.sh/jZAjg/d5417807df.png](http://puu.sh/jZAjg/d5417807df.png)

Here is the `Reset` button.

### Compatibility

Note that so far this version is a more or less direct port of the existing userscript, with a couple of bugs fixed, but still very little to no new features (if you don't count the GUI itself), so the existing limitations apply.

No support for infinite scroll themes yet, you can use http://addons.mozilla.org/en-US/firefox/addon/anti-tumblr-infinite-scroll/ to compensate for that.

Still doesn't work for themes with Wikplayer installed, turned out it wasn't a flash issue, but the fact that player's script wraps the entire page into an iframe hosted somewhere else, which breaks things.

Refer to the [main readme entry](https://github.com/Seedmanc/Tumblr-image-sorter#compatibility) for more compatibility info.

### Version-specific TODOs

* Make the addon open save dialog directly at the determined folder, avoiding clipboard usage.
* Add ability to parse `dir /s/b/o:n/A:D > folders.txt` input to fill in right pane of the Folder List, saving time on entering it manually.
