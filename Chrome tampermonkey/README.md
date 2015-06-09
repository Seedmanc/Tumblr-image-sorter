[русскоязычная версия](README.rus.md)
# Chrome version for Tampermonkey

This version is designed for use with the Tampermonkey userscript engine of Chrome.  
  It appears to be working in Greasemonkey for Firefox as well.

## Installation instructions

1. Install [Tampermonkey](http://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
2. From there create a new script and copy-paste contents of one of the two scripts from here, overwriting the existing header, then save.
3. Repeat step 2 for the second script too.
4. Go to any tumblr blog or your dashboard and see if the page title is being marked with "▶[ " after loading, this indicates that the POST script works.  
  Then trying accessing any image from a photo post with tags and see if the download button appears on the image page, this would indicate that the GET script works as well.

For the rest of configuration, head over to the [main readme section](https://github.com/Seedmanc/Tumblr-image-sorter#usage).

## Version-specific settings

* **highlightColor** - Since Chrome is incapable of supporting "invert" as a color, which ensured visibility of the saved state of an image in a post regardless of background color, you'll have to select a fixed color and hope it won't blend.
* **fixMiddleClick** - Because Chrome is so *superior* it launches the tumblr photo viewer for photosets even on middle click, instead of opening image in a new tab, as required. This option disables any events bound to onClick event in photosets. That useless viewer never shows images in full size anyway.

### Firefox notes
  
For Firefox users having non-standard system font scaling: since apparently Firefox is even more stupid than Chrome, it scales page contents along with GUI itself, resulting in broken design. You can mitigate that by going to about:config and setting `layout.css.devPixelsPerPx` to 1.0 or setting zoom in Theme Font Size Changer addon to 1.0. 
