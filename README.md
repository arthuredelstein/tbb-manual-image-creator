## Setup

First, run
```
sudo apt-get install libx11-dev libxtst-dev libpng-dev nodejs npm
```

Now install the `n` package and use it to get the latest nodejs:
```
sudo npm install -g n
sudo n latest
```
There should be 3 directories in the same parent directory:
 * user-manual (https://gitweb.torproject.org/tor-browser/user-manual.git/)
 * tor-browser_en-US/ (download from https://torproject.org)
 * tbb-manual-image-creator/ (This directory; https://github.com/arthuredelstein/tbb-manual-image-creator)

## Operation

Enter:
```
  cd tbb-manul-image-creator
  npm install
  npm start
```
If we are lucky, it should launch a browser window. The steps are as follows:

1. Enter screenshot name. This should describe what feature you want to illustrate. For example "circuit_display" or "security_slider". (Don't use spaces because this will be part of a filename.)

2. Click the "Start recording" button. After some seconds, a Tor Browser window should be visible. Use the mouse or keyboard to navigate to the feature of interest. When that feature is visible on screen, press Ctrl+Space. At this point, your mouse clicks and keypresses have been recorded and can be played back again to get Tor Browser in other locales to show the same feature.

3. Crop the screenshot you have just taken to show the feature as you prefer. Then click "Done."

4. On a new page, you should see the cropped image (in en-US). Now click "Acquire all!" to start a series of screenshots, one for each locale in ../user-manual/. Please wait until they are all done (the last will be zh). Some of these locales are likely to fail, especially the RTL languages, such as Arabic. But don't worry, once the first pass of acquisition is complete, you can fix up the broken ones!

5. Once screenshots for all locales have been acquired, you can go back and fix the ones that failed. The "recrop" button lets you choose new cropping bounds for a screenshot already acquired. The "re-acquire" button lets you launch the Tor Browser for any locale you wish and take a new screenshot (Ctrl+Space again). Then you can crop that new image and it will replace the old one.

6. All images have been saved in the correct locations in the user-manual directory. Press the "git add" button at the bottom of the window to stage all cropped images for commit. Then you can use the command line "git commit" to commit them to the user-manual repository.
