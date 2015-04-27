# Tumblr-image-sorter
Userscript for image file name and save path formatting based on tags.

This userscript saves you time spent on renaming images and choosing the right directory for saving them in accordance to post tags. You provide a list of matching tags and subfolder names, the script analyzes tags in the post containing the image and chooses the right directory for you, as well as putting required tags into image file name. In addition it can translate tags using the same matching list, indicate which images have been already saved this way and fix some common design problems of tumblr themes.

Suppose you save images from tumblr regularly and want to have them organized nicely on disk. You have a large enough folder tree, navigating which manually to select save destination for every image might be quite a time consuming and boring task. Meanwhile the information that you're making your folder selection choices on is right there in the tags associated with posts containing the images, provided that the post author uses the tagging system responsibly. Even if you don't have any particular folder structure and just save everything into one folder, having tags put into filenames can be quite an improvement for searching, especially if tags happen to be in a foreign language. This userscript can do all that and more.

## How it works
The script collects tags associated with image posts as you navigate tumblr and puts that information into a database. When you open an image in a new tab it searches for its tags, looks at the folder structure you provided it with and makes decision which folder should the current image be saved to. Additionally, if multiple matching folders are found, the image can be put to a predefined "group" folder.  If there are any unrecognized tags (the ones you don't have assigned folders to or the tags requiring translation) the image can be saved to another predefined folder for later manual sorting.

##Folder decision logic
Let's define some key terms. First, assume the majority of images you're dealing with are photos of people and as such tags mostly have people names in it, while your folder structure has separate folders for every person whose photos you're interested in. There can also be other tags aside from names. All the folders are located into one base folder which we'll refer to as 'root'.
Now, to the terms:
* **folder name** tag - a person's name that you have a dedicated folder for
* **name** tag - a person's name that you don't have a folder for but consider important enough to recognize and have in the filename
* **meta** tag - any recognized tag that is not a name
* **folder meta** tag - a non-name folder which can, for example, be used to group other name folders together by a certain attribute. Such folders should have a certain symbol as the first character in their name, by default '!'. Can also be referred to as "!meta" tag for short.
* **unsorted** - any unrecognized tag, the tag that is not found in any database
* **group, solo and unsorted** - these are pointers to special folders that you might have for images having several people in them, only a single person that doesn't have own folder and finally, a folder for images having some unrecognized tags, correspondingly. Of course you can have all these pointers direct to a single folder if you don't have such deliberate organization.

Look at the table, it shows all the possible combinations of tags into every category and the folder that will be assigned to an image having these tags. Destination is relative to the root folder and assumes you have separate folders for every pointer to special folders as described above.

| folder !meta  | folder name  | name  | unsorted  |  destination |
|---|---|---|---|---|
|   |   |   |   |   |
