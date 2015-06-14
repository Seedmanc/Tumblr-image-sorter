# Name recognition

It all started when I noticed that animage.tumblr.com hosts most of his images on 3rd party servers instead of the tumblr itself, and that those servers keep the original filenames intact.  
  I found out that he often follows a certain pattern when naming the photos, like (digit)(shortened person name).jpg  
  ![just a few images out of 22k I dumped from his blog](http://puu.sh/iovRp/449fc41bbe.jpg)
  
This gave me an idea to create a script that would be able to match all the different ways a single name is being shortened (sometimes a nickname was used too) to the name itself.  
  At first the database had multiple records of partial names pointing to a single full name. However probably only a third or a quarter of all images were following this structure, so the use was ratehr limited.
  
  It was at that time that I realized I could use the tags themselves to unambiguously define the names of people on the pictures and more. Fortunately animage was quite responsible in his approach to posting images and every picture he shared had all the required tags attached. Many bloggers have a lot to learn from his ways, I believe. Although at that time I didn't know about tumblr API yet so I was trying to collect the tags from the page itself. It was trivial when using only a single blog, but when I decided to make it universally applicable, detecting tags in all kinds of different tumblr themes became near impossible.
  
  Fortunately, the discovery of publicly available tumblr API allowed to solve this problem. Still, requesting post info from there requires having the post ID and currently it has to be collected from the page anyway, involving search for the post container regardless of different and often faulty designs. Sometimes the post contents and post meta are in two different containers with separate parent nodes, which further complicates the search. Perhaps I should come up with something even more independent from local designs; something that would figure out which series of post the user is currently viewing and request info from API with the appropriate offset and post amount. Don't really know how to do that now, the address bar contains current page number relative to start, but every tumblr might have individual amout of posts per page, and in case of dashboard it's not applicable at all. 

# Filename formatting 

The idea to translate and format the found tags in a certain way while appending them to the filename came from long ago when I discovered a [mass booru uploader script](https://ibsearch.xxx/mass-upload/). It required the image file names to have tags already in danbooru-esques style with spaces replaced by underscores and of course without any unicode characters. To have my image collection follow this pattern it'd have required a manual or semi-automatic renaming of all images. While I had some ideas about creating a set of software tools that would have simplified this task (I even made a POC version of quick image sorted back then) it largely remained a prospect, not a reality.  
  Back to now, I realized I can simply use the exising tagging system of sites like tumblr and automatically convert their tag structure into the one I need. It can be achieved by having existing tags coupled with their version in another notation, such as names in kanji with danbooru-styled names in ANSI. Even better, since many images in my collection come from there anyway, I might as well assign a folder to every tag and have the collection sort itself.  
  Ain't that a cool idea?
