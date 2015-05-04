# Opera native version

This version is designed to make use of Opera's native userscript support and must be compatible with Opera versions up to 12.17. It doesn't require installation of Violentmonkey or a similar userscript engine.

## Installation instructions

1. Make a folder on your HDD where you plan to install the script. 
2. Put both scripts and files from the [dependencies](https://github.com/Seedmanc/Tumblr-image-sorter/tree/master/dependencies) folder there (make sure to follow the .url link to obtain actual files if applicable).
3. Then go to tumlbr and access `Edit site preferences` option in Opera (Tools menu or F12 context menu). From there go to the `Scripting` tab and set the "User Javascript folder" to the folder you've just created. Note that you might have to repeat this step for every site that the particular tumblr blog might link to when hosting their images, such as with animage.
4. If you have flash plugins disabled by default or requiring activation on demand you will need to go to the `Content` tab and enable them for those sites as well. 
5. Go to any tumblr blog or your dashboard and see if the page title is being marked with "Ready:[ " after loading, this indicates that the POST script works. Then trying accessing any image from a photo post with tags and see if the download button appears on the image page, this would indicate that the GET script works as well.

I also recommend installing the [No Click to Activate](https://addons.opera.com/en/extensions/details/no-click-to-activate/) addon, because having to click the flash button twice every time might be annoying.
