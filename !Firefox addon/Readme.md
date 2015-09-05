[русскоязычная версия](https://github.com/Seedmanc/Tumblr-image-sorter/blob/master/!Firefox%20addon/README.rus.md)

# Firefox addon version

Finally a version with an actual GUI, ability to save/load both folder and name lists and all that without Flash.

## Installation instructions

Until the [AMO version](https://addons.mozilla.org/en-US/firefox/addon/tumblr-image-sorter/) gets approved you can download the .xpi file from here and drop it on your browser's window, that'll install it. Note that for FF starting with 41 it'll refuse launching unsigned addons at all, so you'll need to go to about:config#xpinstall.signatures.required and change that to false.

## GUI manual

After installation (no restart required) addon's icon will appear either on the right side of the address panel or in the menu.  
  ![http://puu.sh/jZy8f/8bfddda662.png](http://puu.sh/jZy8f/8bfddda662.png)  
  
The icon allows you to access addon settings and enter the [required info](https://github.com/Seedmanc/Tumblr-image-sorter/blob/master/README.md#data-required-for-the-script).

### Lists

From there you can fill in the Ignore, Folders and Names & Meta lists either manually or by importing a .json file.

![http://puu.sh/jZz0Z/fa7d1ea701.png](http://puu.sh/jZz0Z/fa7d1ea701.png)

Addon provides input validation for all fields. The rules are as follows:

|Input field  |Rules| Error behaviour | 
|:-:          |---  |---              |
|Ignore|Words separated by commas|Trailing whitespace and extra commas removed|
|Root| Full path to a folder including disc letter  |Marked red, input discarded|  
|Metasymbol|Characters legal for file names, except space| Marked orange, replaced by '!'|
|Folders left pane| Any characters except commas, not empty|Marked orange, commas replaced by spaces. Marked red on empty, whole row discarded|
|Folders right pane|Characters legal for file paths (including backslash), not empty|Marked orange, illegal characters replaced by dashes. Marked red on empty, whole row discarded|
|Name & meta left pane|Same as folders|Same as folders|
|Name & meta right pane|Same as folders (excluding backslash)|Same as folders|

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
* Add ability to parse `dir /s/b/o:n/A:D > folders.txt` output to fill in right pane of the Folder List, saving time on entering it manually.
