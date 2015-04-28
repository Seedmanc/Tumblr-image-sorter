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

Look at the table, it shows all the possible combinations of tags in every category and the folder that will be assigned to an image having such tags. Destination is relative to the root folder and assumes you have separate directories for every special folder pointer as described above.
Before '\' is the folder name, after is the filename composed by the script, followed by any meta tags if present. The original image filename is appended to the end of all that, ensuring uniqueness.

| folder !meta  | folder name  | name  | unsorted  |  destination | comments |
|---|---|---|---|---|---|
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
Currently the project consists of two userscripts, called "animage-post" and "animage-get". Note that despite having "animage" in its name they are configured to work with the majority of tumblr blogs, or, rather, themes, and also on the dashboard. "Animage" is there just for legacy reasons, because I started development of this project when I was only using http://animage.tumblr.com.
* animage-**post** - the script that runs on tumblr pages that have posts - including /search/, /tagged/, /dashboard and pretty much every page within a personal tumblr blog except /archive so far. This script collects tag data for every post and *posts* it to the tag DB (thus the name) for later use. The script does not have any GUI and does not require user interaction; however it shows a progressbar in page's title that gets filled with numbers representing amount of images in every found photo post on page or empty space if no tags or photos are found. 
Currently there is support for the majority of most popular themes that don't have tile layout or infinite scroll. For themes with the latter enabled the script will only process the first X posts before the scroll kicks in; however, even for unprocessed posts it will be able to retrieve data for single-image posts that link to the /image/ page of tumblr (and those are usually the majority of posts).
* animage-**get** runs on the directly-linked images opened on separate tabs. It gets the tag data from DB for the currently opened image, prepares filename and path and allows you to *get* the image and this information required to save it. The file name is formed with Downloadify flash button, the path is copied to system clipboard upon clicking it. So, the workflow is as follows: click the button, paste the path into save dialog text field, click "Save" and you're done. Much better than having to navigate between many folders before saving, isn't it?

###Data required for the script
In order to make proper decisions, the script needs to consult several databases of tags, namely, the folder, name and meta databases.
* **Folder** database must be prepared by the user to describe directory structure in the root folder. Consists of pairs "tag : folder name" with folders relative to root and including subdirs. In the current version this DB is contained within the second script code ("animage-get.js") itself as an object with fields, you will need to edit them to match your case. Note that this DB is used both for matching the tags with their folders and for translation of tags, because you can have foreign language tags matched with folder names in your language.
* **name** and **meta** databases are used to provide a list of recognized tags, differentiate between primary and secondary tiers of tags and also to translate tags as well. They are stored in flash cookies as objects as well.
The GET script provides a GUI, allowing the user to fill in those databases with tags and their translations if required.
There is also an additional smaller database of ignored tags, that is used to filter the tag list before further processing. You can use it to avoid having unneeded tags in the filename and decrease amount of unrecognized tags.
