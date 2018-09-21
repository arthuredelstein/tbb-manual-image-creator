## Setup

sudo apt-get install libx11-dev libxtst-dev libpng-dev nodejs npm

Now install the `n` package and use it to get the latest nodejs:
sudo npm install -g n
sudo n latest

There should be 3 directories in the same parent directory:

user-manual (https://gitweb.torproject.org/tor-browser/user-manual.git/)
tor-browser_en-US/ (download from https://torproject.org)
tbb-manual-image-creator/ (This directory; https://github.com/arthuredelstein/tbb-manual-image-creator)

## Operation

Enter:
  cd tbb-manul-image-creator
  npm start

If we are lucky, it should launch a browser window. The steps are as follows:

1. Enter screenshot name. This should describe what feature you want to illustrate. For example "circuit_display" or "security_slider". (Don't use spaces because this will be part of a filename.)

2. Click the "Start recording" button. After some seconds, a Tor Browser window should be visible. Use the mouse or keyboard to navigate to the feature of interest. When that feature is visible on screen, press Ctrl+Space. At this point, your mouse clicks and keypresses have been recorded and can be played back in other locales.

3. Crop the screenshot you have just taken to show the feature as you prefer. Then click "Done."

4. On a new page, you should see the cropped image (in en-US). Now click "Acquire all!" to start a series of screenshots, one for each locale in ../user-manual/. Some of these are likely to fail, especially the RTL languages. But if we are lucky, some of them will look good.

5. Once all locales have been acquires, you can go back and fix the ones that failed. The "recrop" button lets you choose new cropping bounds for the image already acquired. The "re-acquire" button lets you launch the browser for any locale you wish and take a new screenshot (Ctrl+Space again). Then you can crop that new image and it will replace the old one.

6. All images have been saved in the correct locations in the user-manual directory. Press the "git add" button at the bottom to make them ready for commit. Use the command line to commit them to user-manual.