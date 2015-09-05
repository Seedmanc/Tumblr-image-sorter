[русскоязычная версия](README.rus.md)
# Tumblr-image-sorter
A userscript & an addon for image file name and save path formatting based on tags.

## Table of contents
1. [Introduction](#introduction)
2. [How it works](#how-it-works)
  * [Folder decision logic](#folder-decision-logic)
3. [Script contents](#script-contents)
4. [Required data](#data-required-for-the-script)
5. [Compatibility](#compatibility)
6. [Additional features](#additional-features)
7. [Usage](#usage)
 * [First-time configuration](#first-time-configuration)
 * [Settings](#settings)
 * [Everyday usage](#everyday-usage)
 * [Managing unrecognized tags](#managing-unrecognized-tags)
8. [Project info](#project-info)
 * [Dependencies](#dependencies)
 * [Major TODOs](#major-todos)
 * [Challenges](#challenges)
 * [Future possibilities](#future-possibilities)

## Introduction
This userscript saves you time spent on renaming images and choosing the right directory for saving them in accordance with post tags. You provide a list of tags matching with folder names for them, the script analyzes tags in the post containing the image and chooses the right directory for you, as well as putting required tags into image file name in danbooru fashion (replacing spaces with underscores). In addition it can translate tags using the same matching list, indicate which images have been already saved and fix some common design problems of tumblr themes.

Suppose you save images from tumblr often and want to have them organized nicely on disk. You have a large enough folder tree, navigating which manually for every image might be a time consuming and boring task. Meanwhile the information that you're making your folder selection choices on is right there in the tags associated with posts, provided that the post author uses the tagging system responsibly. Even if you don't have any particular folder structure and just save everything into one folder, having tags put into filenames can be useful for searching. This userscript can do all that and more.

## How it works
The script collects tags associated with image posts as you navigate tumblr and puts that information into a database. When you open an image in a new tab it searches for its tags, looks at the folder structure you provided it with and makes decision which folder should the current image be saved to. Additionally, if multiple matching folders are found, the image can be put to a predefined "group" folder.  If there are any unrecognized tags (the ones you don't have assigned folders to) the image can be saved to another predefined folder for later manual sorting.

### Folder decision logic
Let's define some key terms. First, assume the majority of images you're dealing with are photos of people and as such tags mostly have people names in it, while your folder structure has separate directories for every person whose photos you're interested in. There can also be other tags aside from names. All the folders are located in a base folder which we'll refer to as 'root'.
Now, to the terms:
* **folder name** tag - a person's name that you have a dedicated folder for
* **name** tag - a person's name that you don't have a folder for but consider important enough to recognize and have it in the filename.
Both name tag categories are referred to as "primary tier" tags.
* **meta** tag - any recognized tag that is not a name
* **folder meta** tag - a non-name folder which can, for example, be used to group other name folders together by some attribute. Such folders should have a certain symbol as the first character in their name, by default '!'. Can also be referred to as "!meta" tag for short.
Both meta tag categories are "secondary tier" tags.
* **unknown** - any unrecognized tag, the tag that is not found in any database
* **group, solo and unsorted** - these are pointers to special folders that you might have for images having several people in them, only a single person that doesn't have own folder and finally, a folder for images having some unrecognized tags, respectively. Of course you can have all these pointers direct to a single folder if you don't have such a deliberate organization.

The table below shows all the possible combinations of tags in every category and the folder that will be assigned to an image in every case. Destination is relative to the root folder and assumes you have separate directories for every special folder pointer as described above.
Before '\' is the folder name, after is the filename composed by the script, followed by any meta tags if present. The original image filename is appended to the end of all that, ensuring uniqueness.

|folder !meta| folder name  | name  | unknown  |  destination | comments |
|:-:     |:-:|:-:|:-:|---     |---         |
|        |   |   |  >0  | unsorted \ [tags] names meta  | # of other tags doesn't matter |
| 0 or >1| 0 | 0 | 0 | \ meta | if present |
| 0 or >1| 0 | 1 | 0 | solo \ name | |
| 0 or >1 | 1 | 0 | 0 | name \ | direct hit |
| 0 or >1| >1 +|+ >1| 0 | group \ names | sum of name and folder tags >1 |
| 1 | 0 | 1 | 0 | !meta \ name | metafolder instead of solo|
| 1 | >1 +|+ >1 | 0 | !meta \ names | metafolder instead of group |

As you can see, the effect of having a single !meta tag is that it replaces solo or group folder if they were to be used in that particular case. Having more than one !meta tag, however, makes the script act like with the usual meta tags, because we can't choose any particular !meta folder among them.
In case of unrecognized tags presence they're all added to filename; if there are tags requiring translation they are enclosed in [ ] brackets for better searchability.

## Сontents
Currently the project consists of two userscripts, called "animage-post" and "animage-get". Note that despite having "animage" in the name they are configured to work with the majority of tumblr blogs, or, rather, popular themes, and also on the dashboard. "Animage" is there just for legacy and tribute reasons, because I started development of this project when I was only using http://animage.tumblr.com.
* animage-**post** runs on tumblr pages that have posts - including /search/, /tagged/, /dashboard and pretty much every page within a personal tumblr blog except for /archive so far. This script collects tag data for every post and *posts* it to the tag DB (thus the name) for later use. The script usually does not require user interaction; it shows a progressbar in page title that gets filled with numbers representing amount of images in every found photo post on page or empty space if no tags or photos are found. 
* animage-**get** runs on directly-linked images opened in separate tabs. It gets the tag data from the DB for the currently opened image, prepares filename and path and allows you to *get* the image and this information required to save it. The file name is formed with Downloadify flash button, the path is copied to system clipboard upon clicking it. 
The GET script provides a GUI, allowing the user to fill in missing tags and their translations if required. GUI also can be used to toggle debug mode and export or import auxiliary tag databases.

There's also an addon version with same functionality for Firefox that incorporates both scripts and provides a GUI, get it [here](https://github.com/Seedmanc/Tumblr-image-sorter/tree/master/!Firefox%20addon). 

## Data required for the script
In order to make proper decisions, the script needs to consult several databases of tags, namely, the folder, name and meta databases.
* **Folder** database must be prepared by the user to describe directory structure in their root folder. Consists of pairs "tag : path\\\\to\\\\folder name" with folders relative to root and including subdirs. In the current version this DB is contained within the second script code ("animage-get.js") itself as an object with fields, you will need to edit them to match your use case. This DB is used both for matching the tags with their folders and for translation of tags, because you can have foreign language tags matched with folder names in your language.
* **name** and **meta** databases (auxiliary DBs) are used to provide a list of recognized tags, differentiate between primary and secondary tiers of tags and also to translate tags as well. They are stored in flash cookies as objects and can be saved or loaded as well as filled in with required tag translations using GET's GUI.

There is also an additional smaller database of ignored tags, that is used to filter the tag list before further processing. You can use it to avoid having unneeded tags in the filename and decrease amount of unrecognized tags. It can be changed by editing the GET script.

## Compatibility

Currently there is support for many popular themes that don't have infinite scroll. For themes with it enabled the script will only process the first X posts before the scroll kicks in; however, even for unprocessed posts it would be able to retrieve data for single-image posts that link to the /image/ page of tumblr (and those usually are the majority). Having tile layout might decrease expected compatibility further. 

Below is the theme compatibility table. The percentage value shows how much I am sure that there will possibly be no problems with using the script in a blog with such theme. For example, if the script seems to be working fine after testing, but to make it work properly it took me a lot of tinkering I can't be sure that I didn't miss anything compared to themes where the script worked normally right away.

Basically, every theme that has post containers with `'class="post"'` and contains both post images and link to post within said node should be working fine.

| Theme name  | Theme URL  | Compatibility % |
|---|---|--:|
|?|	http://marumichannel.tumblr.com 	|90|
|alva|	http://www.tumblr.com/theme/36704 	|95|
|Catching Elephant|	http://www.tumblr.com/theme/7285 	|90|
|Effector|	http://www.tumblr.com/theme/17403 	|90|
|ER2|	http://cubicle17.com 	|100|
|Masonite|	http://hellodirty.com 	|85|
|Minimal by Artur Kim|	http://arturkim.com 	|100|
|o by inky|	http://www.tumblr.com/theme/1386 	|90|
|Optica|	http://www.tumblr.com/theme/37310 	|100|
|PixelUnion Fluid|	http://www.tumblr.com/theme/979	|65  |
|plain by selkas|	http://selkas.tumblr.com 	|80|
|redux|	http://thm--reducereuseandredux.tumblr.com 	|90|
|seigaku|	http://sakurane.tumblr.com/preview/seigaku 	|90|
|Simple Things|	http://singleatheme.tumblr.com	|100|
|Single A |	http://www.tumblr.com/theme/28638	|100|
|Tincture|	http://tincturetheme.tumblr.com 	|75|
|tuesday by selkas|	http://selkas.tumblr.com 	|85|
|Viwan theme|	http://viwan-th.tumblr.com	|95|

PixelUnion Fluid is very weird and I coudln't find enough blogs using it to test all features. The Minimalist theme might miss the saved images indication feature.

Themes with inbuilt WikPlayer are not supported. It seems that said player wraps the entire page into an iframe hosted elsewhere which breaks things.  
  Blogs with password-only access or custom domains aren't supported either due to API limitations.

## Additional features

Aside from main functionality the script also makes slight changes to tumblr design. The most noticeable one is the outline around images that were already saved with the script (not just "save as..."). This way you can keep track of pictures you have. Note that that this feature is cross-blog, meaning that if you saved a picture from one blog and then encountered it in a reblogged post in another tumblr it will still be marked as saved there.

Another important ability is linking inline images in all posts (not just photo ones) to either their HD version if available or to the Google reverse image search of the particular image. If the HD version of an image is available (which should be the majority of cases from now on) it will be processed just like any other image in a photo post. This allows for collecting image and data from any kind of post, increasing coverage.

Other features include changing destination of links on single image posts directly to the picture skipping the /image/ subpage of tumblr; linkifying even small images that usually don't have links over them (because GET script requires every image to be opened in a separate tab); and also fixing the particular problem in some themes where links to hi-res versions of the images in posts are covered by a transparent \<div\>, making them inaccessible.

## Usage
#### First-time configuration
Once you've installed the scripts (for instructions see README in the version folder of your choice) you'll need to fill in at least the **Folders** database which is located in the GET script. You can use the `dir /s/b/o:n/A:D > folders.txt` command from the root directory to get the list of all folders and subfolders in text format, then use software like Excel to format the list further.  Make sure to avoid using symbols illegal for file paths in your OS and don't forget to use double '\\' instead of single everywhere. Note that if you intend to use both unicode and ansi tags, you can avoid having to enter both variations of a single tag pointing to one folder. Just enter the unicode tag : roman folder name  pair and enable "useFolderNames" option in settings.

By default the DB has the configuration that I'm using myself, around 80 japanese name tags in kanji translating to folder names in English. Additionally you might want to fill in the auxiliary **name** and **meta** databases if your use case happens to be the same as mine. Use the import feature for that. From a tab with opened image  enable debug via `+settings+` menu in GUI. Then choose `import db` there, and select the [`names&meta tags DB.txt`](https://github.com/Seedmanc/Tumblr-image-sorter/blob/master/names%26meta%20tags%20DB.json.txt) file that I provided in the repository. You can edit it to your liking beforehand (use something better than just Notepad, I recommend Notepad++), just make sure not to violate it's structure. The auxiliary DB has around 150+ more names and 20 meta tags with translations. You might want to disable debug mode afterwards.

Note that if there are duplicating tag entries among these 3 DBs, the following hierarchy takes place: **Folders > names > meta**.

Another thing to note, there are limits on the amount of data stored in flash cookies. I believe the default value is 100kb. While every record for an image takes relatively little space (about 80 bytes per image), the data is continuously added as you navigate tumblr and encounter new posts. Eventually you'll hit the limit and will be notified about that by the POST script. You might want to set the limit to at least 1 megabyte since very beginning. Head over to http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager07.html look for your `storeUrl` host in the list (`dl.dropboxusercontent.com` by default) and change the value as you see fit.

#### Settings

In the userscript version most settings are changed via editing the values inside the scripts, no centralized GUI so far. Addon has a specialized GUI.

The settings area can be found in the beginning of each script, right after the userscript header. Default values should be fine for usage right away.

**Some settings are common for both scripts:**

* debug - initial debug mode state, is in effect until the flash DB is loaded, then it gets replaced by the value stored inside of DB (which is set via GUI in the GET script).

 The debug mode has the following effects on the scripts' behaviour:

 `-` enables error notifications via alert message, including errors from other scripts of the page. Without debug mode errors are directed back to console, user will only see an `✗` mark in the title upon encountering an error.  
 `-` brings the FlashDB window into view (top-left corner). This way if a size limit has been hit the user will see a flash notification about that and have the ability to change settings from there.

* storeUrl - address of the flash object controlling the databases. Must be the same in both scripts.

 You can rehost the flash objects somewhere else if you want, but keep in mind that every time you change the `storeUrl` variable the databases (except the inbuilt ones like Folders & ignore) are created from scratch. Previous versions are not deleted, so you can return to them by changing the url back.

**Other settings are script-specific:**

1. animage-post:

 * enableOnDashboard - applies processing to posts on dashboard the same way it works on individual blogs' posts.  
  Convenient if there's no support yet for a particular tumblr theme; the dashboard design is constant and straightforward, ensuring compatibility.

 * linkify - enables converting of all found images to links if they don't have links yet.  
  Tumblr does not put links over inline images or small photos that don't have hi-res versions. This option fixes that, making every image link to either itself (small images in photo posts), its larger version (inline images with HD) or its reverse image search on Google (inline images without HD).  
   This feature is still in testing and might probably break themes like Pixel Union Fluid.

2. animage-get:

 * root  - path to the base folder, containing all other folder in your photo collection.  
  Use double backslashes instead of single ones, must end with them too.

 * ms - metasymbol, a character that differentiates meta folders, containing name folders, from name folders themselves.  
  Must be present in the names of meta folders as their first symbol. Equals to an exclamation mark by default.

 * Folders - database of tags and matching folders for saving the corresponding images to.  
 * ignore - list of tags skipped from processing, each tag pairs with 'true' for enabled ignoring or 'false' for disabled.

 * allowUnicode - do not block the user from entering translations of unknown tags in unicode.  
  Disabled by default, because the idea of the script is to produce file names in a booru-compatible way without fancy characters, use at your own risk.

 * useFolderNames - automatically expands the Folder database to match also every folder name as a tag in addition to tags provided by the user.  
  Assuming that the database consists of foreign tags paired with translated folder names this will allow for entering only one entry per tag while being able to recognize both versions of it.
 * downloadifySwf - address of the flash button used to downloading the image and copying the prepared save path to clipboard.
  

Yet other settings are version-specific, see the readme inside the version folder of your choice for them.

#### Everyday usage
The workflow is as follows: make sure the page with posts you're navigating has at least initiated the processing by the POST script (`▶[` has appeared in the page title), then open the images in a new tab (usually with middle click). During or after the image loading the GET script will indicate whether it has succeeded in recognizing all the tags for the image by changing image tab's title. In case there was a direct hit (only one person on the photo and there's a dedicated folder) it'll show [`✓` followed by the path to needed folder](http://puu.sh/icpab/79cfdefd81.jpg). If there were some unrecognized tags detected, it'll show [`?` and the tags](http://puu.sh/icpkv/d9a4677d68.jpg). Finally, if that particular image had no tags at all, the GET script will not be activated, unless the debug mode was enabled. 

Assuming there are tags and all of them were recognized, just click the `Save to disk` button. [Save dialog will appear](http://puu.sh/icpyP/31b9dc542f.jpg), paste the path into the filename text field (I usually do that with `Shift-Insert`), click `Save` (or hit `Enter`) and you're done. Much better than having to navigate between many folders before saving, isn't it? Even better, if you find yourself often reuploading saved images somewhere else, you can paste same path into open dialog and have last saved image selected automatically without having to look for it. If you're saving several images in a row into a single folder, there's no need to paste the path every time, the previous save path will be used.

#### Managing unrecognized tags
The script provides a convenient GUI for dealing with tags missing from any DBs. On image page they will be listed at the left side under `Save to disk` button. From there you'll have a choice to select a category (name or meta) for every tag, additionally entering translation for tags in Unicode (usually kanji), or to simply ignore those tags and remove them from analysis for now (see the [picture](http://puu.sh/icqzU/38e349afa8.jpg)). To ignore a tag click on it and it will be hidden until page reload. After you made your choices, click the `Submit` button to apply them and look at the [difference it made](http://puu.sh/icqDa/9bb74cfb84.jpg) to the page title.

A few things to consider:
* The script tries to accommodate for the way some bloggers try to increase visibility of their posts by entering many permutations of a single tag, such as entering names in direct and reverse order, entering both kanji name and its translation, entering kanji names with and without spaces and so on. Where possible, the script will only [leave one version, omitting duplicates](http://puu.sh/icpOE/664c69c799.jpg). If the tag is already present in any of databases in its kanji form with translation, while the blogger put both kanji and translation versions into tags, the latter will be skipped automatically, because it is already known. 
* If, however, neither of kanji or translated versions are known, but [both kanji and roman tags are in the list](http://puu.sh/icqaa/eca9cb623d.jpg), the script will show all of them, and will also allow you to [quickly input translations](http://puu.sh/icq4W/37316ee795.jpg) to kanji tags by selecting them from drop-down lists populated by all unrecognized roman tags. This way even if you don't know the translation exactly, but at least know some kanji symbols you can reliably fill in translations for tags by choosing among most fitting options. I find this very useful.
* The script is also able to detect different writings of 'ō' as o/ou at the end of names in favor of 'o'.
* Any characters illegal for use in file paths and the `%` sign will be replaced by dashes.

## Project info
The code is thoroughly commented, I tried to explain everything I'm doing there. However I'm a newbie programmer so formatting might be weird and the code is rather messy.

### Dependencies
This userscript uses the following libraries:
* [jQuery](https://github.com/jquery/jquery) v1.5-1.11 for general DOM manipulation
* [Javascript Flash Cookies](https://github.com/nfriedly/Javascript-Flash-Cookies) v2.1 by Nfriedly for crossdomain data storage. Without this library my userscript wouldn't have been possible.
* [Downloadify](https://github.com/Seedmanc/Downloadify) v0.22 by Dcneiner, forked by me. This library is used to provide force download capability as well as formatting of filename and copying the save path to clipboard (the latter is the functionality added in my fork).
* This goes without saying, but the last two libraries require [Adobe Flash](https://get.adobe.com/ru/flashplayer/). Just deal with it.

By default the script is configured to use pre-hosted libraries and media linked to my Dropbox, so you don't have to worry about hosting them yourself, unless specified otherwise in the installation notes of a particular script version. Should you want to do that regardless, take a look at the [dependencies](https://github.com/Seedmanc/Tumblr-image-sorter/tree/master/dependencies) and [media](https://github.com/Seedmanc/Tumblr-image-sorter/tree/master/media) folders, they have the necessary files or links to repositories containing them.

### Current status

v[1.2](https://github.com/Seedmanc/Tumblr-image-sorter/releases)

* [Opera Native](https://github.com/Seedmanc/Tumblr-image-sorter/tree/master/Opera%20native) version - **released**
* [Chrome port](https://github.com/Seedmanc/Tumblr-image-sorter/tree/master/Chrome%20tampermonkey) - **released**
* [Firefox addon](https://github.com/Seedmanc/Tumblr-image-sorter/tree/master/!Firefox%20addon) - **release**. You can also use Chrome userscript version in Greasemonkey.

### Major TODOs  
  (aka "How you can help")

* Make the Folder database into a separate file instead of it being inside the script. If impossible, have it stored in a flashDB with a decent GUI for editing (actual for userscript version, in addon you can export and import it as text)

I still have yet to find a way for a userscript to load information from a file on HDD automatically.

* Implement traversal of reblog tree back to the origin in search for tags if no tags were found initially.

Should help with lazy rebloggers never properly tagging anything.

* Add support for infinite scroll

Will probably have to hook on the post retrieval events or something. Oh the glitches. You can use no-scroll addons so far.

* Add ability to enter new tags in addition to editing existing, plus implement propagation of changes among images of same post. 

This will help when a large photoset has no tags, rendering the script (and the post) useless. Dunno how to make that propagation live across tabs though, something about messages maybe.

### Challenges

* Make simplified generalized version without translation capabilities for use cases with English-only tags.

Will have to think of a way to store folder lists more efficiently than in an object.

* Make a no-flash version, depending entirely on HTML5 and *monkey API for its functionality

Already done in addon version.  

## Future possibilities
* Add a third script which would create and show a statistics page about information collected over time. For example, it would track the amount of images collected to every folder as well as the most saved tags without a folder and make suggestions about making a directory for that particular tag. Such a page would also allow for a more functional GUI than the one the GET script has to offer.
* With tag database collected and stored it will be potentially possible to implement a sorting algorithm for images already saved to disk from tumblr. All that the current algo needs is an image file name and the matching DB as input, while it outputs the path for the particular file. It should be trivial to make it [run in a loop over multiple files](http://41.media.tumblr.com/fd583df17bc7c8a645a98f553eb1798a/tumblr_nr58vaEpAu1u0defzo1_1280.png) selected from HDD. While Javascript has no capability of moving around files on disk it can create a batch command file with necessary instructions to be performed by the OS. 
* Add support for more sites with tags, not just Tumblr, thus increasing use case coverage and popularity. Potential candidates are soup.io, egloos.com and perhaps even Pixiv. Along with the aforementioned local file sorting feature it would  make it possible to bring the entire online tagging system to help with image organization and categorization on disk.

#### License
Blah-blah MIT blah, you know the stuff. Just don't claim authorship and it'll be fine.
