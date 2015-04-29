# Tumblr-image-sorter
Userscript for image file name and save path formatting based on tags.

This userscript saves you time spent on renaming images and choosing the right directory for saving them in accordance to post tags. You provide a list of matching tags and subfolder names, the script analyzes tags in the post containing the image and chooses the right directory for you, as well as putting required tags into image file name. In addition it can translate tags using the same matching list, indicate which images have been already saved this way and fix some common design problems of tumblr themes.

Suppose you save images from tumblr regularly and want to have them organized nicely on disk. You have a large enough folder tree, navigating which manually to select save destination for every image might be quite a time consuming and boring task. Meanwhile the information that you're making your folder selection choices on is right there in the tags associated with posts containing the images, provided that the post author uses the tagging system responsibly. Even if you don't have any particular folder structure and just save everything into one folder, having tags put into filenames can be quite an improvement for searching, especially if tags happen to be in a foreign language. This userscript can do all that and more.

## How it works
The script collects tags associated with image posts as you navigate tumblr and puts that information into a database. When you open an image in a new tab it searches for its tags, looks at the folder structure you provided it with and makes decision which folder should the current image be saved to. Additionally, if multiple matching folders are found, the image can be put to a predefined "group" folder.  If there are any unrecognized tags (the ones you don't have assigned folders to or the tags requiring translation) the image can be saved to another predefined folder for later manual sorting.

###Folder decision logic
Let's define some key terms. First, assume the majority of images you're dealing with are photos of people and as such tags mostly have people names in it, while your folder structure has separate directories for every person whose photos you're interested in. There can also be other tags aside from names. All the folders are located into one base folder which we'll refer to as 'root'.
Now, to the terms:
* **folder name** tag - a person's name that you have a dedicated folder for
* **name** tag - a person's name that you don't have a folder for but consider important enough to recognize and have in the filename.
Both name tag categories are considered as "primary tier" tags.
* **meta** tag - any recognized tag that is not a name
* **folder meta** tag - a non-name folder which can, for example, be used to group other name folders together by a certain attribute. Such folders should have a certain symbol as the first character in their name, by default '!'. Can also be referred to as "!meta" tag for short.
Both meta tag categories are "secondary tier" tags.
* **unsorted** - any unrecognized tag, the tag that is not found in any database
* **group, solo and unsorted** - these are pointers to special folders that you might have for images having several people in them, only a single person that doesn't have own folder and finally, a folder for images having some unrecognized tags, correspondingly. Of course you can have all these pointers direct to a single folder if you don't have such deliberate organization (note that in the current version pointers can't direct to the root folder itself, only a subdir).

The table below shows all the possible combinations of tags in every category and the folder that will be assigned to an image having such tags. Destination is relative to the root folder and assumes you have separate directories for every special folder pointer as described above.
Before '\' is the folder name, after is the filename composed by the script, followed by any meta tags if present. The original image filename is appended to the end of all that, ensuring uniqueness.

| folder !meta  | folder name  | name  | unsorted  |  destination | comments |
|:-:|:-:|:-:|:-:|---|---|
|            |                      |   |  >0  | unsorted \ [tags] names meta  | tags in other categories don't matter |
| 0 or >1| 0 | 0 | 0 | \ meta | if present |
| 0 or >1| 0 | 1 | 0 | solo \ name | |
| 0 or >1 | 1 | 0 | 0 | name \ | direct hit |
| 0 or >1| >1 +|+ >1| 0 | group \ names | sum of name and folder tags >1 |
| 1 | 0 | 1 | 0 | !meta \ name | metafolder instead of solo|
| 1 | >1 +|+ >1 | 0 | !meta \ names | metafolder instead of group |

As you can see, the effect of having a single !meta tag is that it replaces solo or group folder if they were to be used in that particular case. Having more than one !meta tag, however, makes the script act like with usual meta tags, because we can't choose any particular !meta folder to be used that way.
In case of unrecognized tags presence they're all added to filename; if there are tags requiring translation they are enclosed in [ ] brackets for better searchability.

##Script contents
Currently the project consists of two userscripts, called "animage-post" and "animage-get". Note that despite having "animage" in the name they are configured to work with the majority of tumblr blogs, or, rather, themes, and also on the dashboard. "Animage" is there just for legacy reasons, because I started development of this project when I was only using http://animage.tumblr.com.
* animage-**post** - the script that runs on tumblr pages that have posts - including /search/, /tagged/, /dashboard and pretty much every page within a personal tumblr blog except for /archive so far. This script collects tag data for every post and *posts* it to the tag DB (thus the name) for later use. The script does not have any GUI and does not require user interaction; however it shows a progressbar in page's title that gets filled with numbers representing amount of images in every found photo post on page or empty space if no tags or photos are found. 
* animage-**get** runs on the directly-linked images opened on separate tabs. It gets the tag data from DB for the currently opened image, prepares filename and path and allows you to *get* the image and this information required to save it. The file name is formed with Downloadify flash button, the path is copied to system clipboard upon clicking it. 
The GET script provides a GUI, allowing the user to fill in those databases with tags and their translations if required. GUI also can be used to toggle debug mode and export or import auxiliary tag databases.

## Data required for the script
In order to make proper decisions, the script needs to consult several databases of tags, namely, the folder, name and meta databases.
* **Folder** database must be prepared by the user to describe directory structure in the root folder. Consists of pairs "tag : folder name" with folders relative to root and including subdirs. In the current version this DB is contained within the second script code ("animage-get.js") itself as an object with fields, you will need to edit them to match your use case. Note that this DB is used both for matching the tags with their folders and for translation of tags, because you can have foreign language tags matched with folder names in your language.
* **name** and **meta** databases (auxiliary DBs) are used to provide a list of recognized tags, differentiate between primary and secondary tiers of tags and also to translate tags as well. They are stored in flash cookies as objects and can be saved or loaded as well as filled in with required tag translations using GET's GUI.

There is also an additional smaller database of ignored tags, that is used to filter the tag list before further processing. You can use it to avoid having unneeded tags in the filename and decrease amount of unrecognized tags. It can be changed by editing the GET script.

## Compatibility

Currently there is support for the majority of most popular themes that don't have tile layout or infinite scroll. For themes with the latter enabled the script will only process the first X posts before the scroll kicks in; however, even for unprocessed posts it will be able to retrieve data for single-image posts that link to the /image/ page of tumblr (and those are usually the majority of posts).

Below is the theme compatibility table. Note that the percentage value shows how much I am sure that there will possibly be no problems with using the script in a blog with such theme. For example, if the script seems to be working finely after testing, but to make it work properly it took me a lot of tinkering I can not be sure that I didn't miss anything compared to themes where the script worked normally right away.

Basically, every theme that has post containers with 'class=post' and contains both post images and post meta within said container should be working fine.

| Theme name  | Theme URL  | Compatibility % |
|---|---|--:|
|Single A	|http://www.tumblr.com/theme/28638	|100|
|Simple Things|	http://singleatheme.tumblr.com	|100|
|Minimal by Artur Kim	|http://arturkim.com|	100|
|Optica|	http://www.tumblr.com/theme/37310|	100|
|ER2|	http://cubicle17.com/|	100|
|Viwan theme|	http://viwan-th.tumblr.com/	|95|
|Masonite|	http://hellodirty.com/|	95|
|Catching Elephant	|http://www.tumblr.com/theme/7285/|	90|
|o by inky|	http://www.tumblr.com/theme/1386|	90|
|redux|	http://thm--reducereuseandredux.tumblr.com/|	90|
|?	|http://marumichannel.tumblr.com/|	90|
|Effector	|http://www.tumblr.com/theme/17403|	90|
|tuesday by selkas|	http://selkas.tumblr.com|	85|
|plain by selkas|	http://selkas.tumblr.com|	80|
|Tincture	|http://tincturetheme.tumblr.com|	75|
|PixelUnion Fluid|	http://www.tumblr.com/theme/979	|70  |

Themes with inbuilt flash content such as music players are not supported. It seem that flash presence makes flash cookies DB unable to load. There is a chance that it might not an issue of my script but rather of the flash cookies themselves. So far I have no idea how to fix this, but such themes are a minority anyway.

##Additional features

Aside from main functionality the script also makes slight changes to tumblr design. The most noticeable one is the outline around images that were already saved with the script (not just "save as"). This way you can keep track of pictures you have. Note that that this feature is cross-blog, meaning that if you saved a picture from one blog and then encountered it in a reblogged post in another tumblr it will still be marked as saved there.

Other features include changing destination of links on single image posts directly to the picture skipping the /image/ subpage of tumblr, linkifying even small images that usually don't have links over them (because GET script requires every image to be opened in a separate tab) and also fixing the particular problem in some themes where links to hi-res versions of the images in posts are covered by a transparent div, making them inaccessible.
So, the workflow is as follows: click the button, paste the path into save dialog text field, click "Save" and you're done. Much better than having to navigate between many folders before saving, isn't it?
