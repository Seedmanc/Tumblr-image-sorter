# Firefox addon version

Finally a version with an actual GUI, ability to save/load both folder and name lists and all that without Flash.

## Installation instructions

Until the [AMO version](https://addons.mozilla.org/en-US/firefox/addon/tumblr-image-sorter/) gets approved you can download the .xpi file from here and drop it on your browser's window, that'll install it. Note that for FF starting with 41 it'll refuse launching unsigned addons at all, so you'll need to go to about:config#xpinstall.signatures.required and change that to false.

## GUI manual

After installation (no restart required) addon's icon will appear either on the right side of the address panel or in the menu.  
  ![http://puu.sh/jZy8f/8bfddda662.png](http://puu.sh/jZy8f/8bfddda662.png)  
  
The icon allows you to access addon settings and enter the [required info](https://github.com/Seedmanc/Tumblr-image-sorter/blob/master/README.md#data-required-for-the-script).

From there you can fill in the Ignore, Folders and Names & Meta lists either manually or by importing a .json file.

![http://puu.sh/jZz0Z/fa7d1ea701.png](http://puu.sh/jZz0Z/fa7d1ea701.png)

Addons provides input validation for all fields. The rules are as follows:

|Input field  |Rules| Error behaviour | 
|:-:          |---  |---              |
|Ignore|Words separated by commas|Trailing whitespace and extra commas removed|
|Root| Full path to a folder inlcuding disc letter  |Marked red, input discarded|  
|Metasymbol|Characters legal for file names, except space| Marked orange, replaced by '!'|
|Folders left pane| Any characters except comma, not empty|Marked orange, comma removed. Marked red on empty, whole row discarded|
|Folders right pane|Characters legal for file paths (including backslash), not empty|Marked orange, illegal characters replaced by dashes. Marked red on empty, whole row discarded|
|Name & meta left pane|Same as folders|Same as folders|
|Name & meta right pane|Same as folders (excluding backslash)|Same as folders|

In short, only the root and the three special folder entries (solo, group and unsorted) are essential and will be marked red if filled incorrectly/left blank. Other input mistakes are not critical and the addon will attempt to fix them by removing/replacing incorrect characters, while marking the input orange for user attention.

### Loading and saving databases.

Addon allows exporting and importing of folder list (including root folder and the metasymbol) and names+meta lists. Same data validation as above is applied when loading databases from a file. 

Before import user is asked to choose mode: add or replace data. Adding does not change records already present in the database.  
  File format is JSON-stringified Javascript objects, it is human-readable and can be edited before import (I recommend using something better than just Notepad). You can use my databases as an example: [folders.json.txt](https://github.com/Seedmanc/Tumblr-image-sorter/blob/master/!Firefox%20addon/folders.json.txt), [names & meta.json.txt](https://github.com/Seedmanc/Tumblr-image-sorter/blob/master/names%20%26%20meta.json.txt). Note that those databases are pretty large, over 200 entries in total.



https://addons.mozilla.org/en-US/firefox/addon/anti-tumblr-infinite-scroll/?src=search
