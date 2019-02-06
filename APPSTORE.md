# Homey app for basic control of Twinkly Christmas Lights
This Homey app allows you to control Twinkly christmas lighting. It uses an unsupported method for communication between Homey and Twinkly devices so no garantees can be given. The app is currently limited to turning the lights on or off.

## Instructions
Make sure you have your Twinkly Lights configured using the app and connected to your home network. Assign a static IP address to your Twinkly Lights in your router. Add your Twinkly as device in Homey using this IP address and configure the polling frequency. This is used to read the status of the device at the set interval to keep the Homey device in sync with the actual Twinkly device when using the Twinkly smartphone app for instance.

## Support topic
For support please use the official support topic on the forum [here](https://community.athom.com/t/4386).

## Changelog
### v1.0.3 - 2019-02-xx
* FIX: improvements to pairing template for firmware 2.x
