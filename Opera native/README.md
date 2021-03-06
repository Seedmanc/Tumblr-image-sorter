[русскоязычная версия](README.rus.md)
# Opera native version

This version is designed to make use of Opera's native userscript support and must be compatible with Opera versions up to 12.17. It doesn't require Violentmonkey or a similar userscript engine.

## Installation instructions

1. Make a folder on your HDD where you plan to install the script. 
2. Put both scripts and files from the [dependencies](https://github.com/Seedmanc/Tumblr-image-sorter/tree/master/dependencies) folder there (make sure to follow the .url link to obtain actual files if applicable).
3. Then go to tumlbr and access `Edit site preferences` option in Opera (Tools menu or F12 context menu). From there go to the `Scripting` tab and set the "User Javascript folder" to the folder you've just created. Note that you might have to repeat this step for every site that the particular tumblr blog might link to when hosting their images, such as with animage.
4. If you have flash plugins disabled by default or requiring activation on demand you will need to go to the `Content` tab and enable them for those sites as well. 
5. Go to any tumblr blog or your dashboard and see if the page title is being marked with "▶[ " followed by a list of numbers representing amount of photos in every post with tags, this indicates that the POST script works. Then trying accessing any image from a photo post with tags and see if the download button appears on the image page, this would indicate that the GET script works as well.

For the rest of configuration, head over to the [main readme section](https://github.com/Seedmanc/Tumblr-image-sorter#usage).

I also recommend installing the [No Click to Activate](https://addons.opera.com/en/extensions/details/no-click-to-activate/) addon, to avoid having to click the flash button twice.

## Version-specific settings

* **debug** - in Opera Native version of the userscript debug also disables the inbuilt cleanup feature.

  This feature is specific to Opera Native version. What it does is removal of flash DB-related variables and actual flash content from memory after they're no longer needed (the processing was finished in POST script or the image was successfully saved in GET script). This is done to minimize the lag introduced by the userscript, that happens upon tab closing in Opera. Enabling debug turns off cleanup which allows for flashDB access at any time while the tab is still open.
