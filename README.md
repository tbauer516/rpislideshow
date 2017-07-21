# RPI Slideshow

RPI Slideshow is a custom application that runs using NodeJS and Chromium Browser to pull images from a Google Drive account and display them in a "live picture frame" manner, with an additional column on the side that displays weather relevant to the user. It utilises Node and Express for a back-end that is used to pass data directly to the front end using a localhost connection (saving both time and external network requests). Specifically, the express back-end uses PassportJS to authenticate a user so that the images can be pulled directly from Google Drive and downloaded, Darknet as the weather api to get the weather information and a custom script utilising Google's crappy Drive V3 API. The front-end is written in React to boost performance on slow machines (like the raspberry pi zero).

## Contents
+ [Prerequisites](#prerequisites)
+ [Setup](#install-and-setup)
+ [Using the App](#using-the-app)

## Prerequisites
This application has several software dependencies that need to be resolved prior to installation:
+ NodeJS, preferably V6.0.0 or higher
+ Chromium-Browser
+ ImageMagick
+ LXTerminal as a terminal emulator (Raspberry Pi default)

## Install and Setup
To install this application, please type in the following after cloning the repo:
+ `$ cd rpislideshow`
+ `$ npm install`
+ `$ npm run setup`
  + This will `npm install` all the dependencies for both react and express
  + It will also create a file called `live.sh` which is used to run the application
  + Simply calling `./live.sh` will open chromium, open another terminal and start the application
  + Killing the application is as simple as closing the browser and killing the command in the new terminal
+ From here, you need three things:
  + `client-secret.json` which can be found in your google developer api console
  [HERE](https://console.developers.google.com/apis/dashboard)
    + Just create a project for your picture frame
    + You want an OAuth2.0 credential and the redirect URL to be `http://localhost:3001/auth/callback`
    + Then download the `client-secret.json` file and place it in `rpislideshow/express/app/config`
  + `darksky.json` which can be created from [HERE](https://darksky.net/dev/)
    + Create an account and get your secret API key
    + Create `darksky.json` which consists of
        ```
        {
            "secret": "<your secret here>"
        }
        ```
    + Place said json file in `rpislideshow/express/app/config`
  + `user-config.json` which is user created
    + Create the json file and fill it with
        ```
        {
            "address": "<your address to use for the Weather app"
        }
        ```
    + The app will generate your GPS coordinates to use with Darksky, but you can also use your own if you add a `lat` and `lng` field with your corresponding latitude and longitude
+ Finally, run `./live.sh` to start the application and log into your project's Google account you created from the `client-secret.json` step above

## Using the App
To use the app, just take your Google account that has your pictures, and create a folder that you then share to your project Google account. By default, the application cycles through pictures every 5 minutes and syncs with Google Drive every 24 hours.
