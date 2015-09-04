# Firefox addon version

Finally a version with an actual GUI, ability to save/load both folder and name lists and all that without Flash.

## Installation instructions

Until the [AMO version](https://addons.mozilla.org/en-US/firefox/addon/tumblr-image-sorter/) gets approved you can download the .xpi file from here and drop it on your browser's window, that'll install it. Note that for FF starting with 41 it'll refuse launching unsigned addons at all, so you'll need to go to about:config#xpinstall.signatures.required and change that to false.

After installation (no restart required) addon's icon will appear either on the right side of the address panel or in the menu.  
  ![http://puu.sh/jZy8f/8bfddda662.png](http://puu.sh/jZy8f/8bfddda662.png)  
  
The icon allows you to access addon settings and enter the [required info](https://github.com/Seedmanc/Tumblr-image-sorter/blob/master/README.md#data-required-for-the-script).

From there you can fill in the Ignore, Folders and Names & Meta lists either manually or by importing a .json file.

![http://puu.sh/jZz0Z/fa7d1ea701.png](http://puu.sh/jZz0Z/fa7d1ea701.png)

Addons provides input validation for all fields. The rules are as follows:

|Input field  |Rules| Error behaviour | 
|:-:          |:-:  |:-:              |
|Root| Full path to a folder inlcuding disc letter  |Marked red, input ignored until fixed by user   |  
|Metasymbol|Characters legal for file names, except space, not empty| Marked orange, replaced by '!'|
|Folders left pane| Any characters except comma, not empty|Marked orange, comma removed. Marked red on empty, whole row discarded|
|Folders right pane|Characters legal for file paths (including backslash), not empty|Marked orange, illegal characters replaced by dashes. Marked red on empty, whole row discarded|
|Name & meta left pane|Same as folders|Same as folders|
|Name & meta right pane|Same as folders (excluding backslash)|Same as folders|

https://addons.mozilla.org/en-US/firefox/addon/anti-tumblr-infinite-scroll/?src=search
