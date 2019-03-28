# SleepSafe
A site written in Nodejs with express,bootstrap 4 and mongodb to help homeless people find and share safer places to sleep. 
The example site is hosted on http://www.sleepsafe.space. Calling for contributions from the community for localisation, enhancements and advancements. 

The package.json file contains most of the dependances, on top of that you will need to have a running instance of mongo DB, redis for session management and nginx/another for your reverse proxy. By default the first user created on the site becomes the administrator so always create the first user offline. Multiple node servers can be automatically provisioned using... 

Features:

Integration with googlemaps, when a new space is created, the app may ask for your location or you can also type in a location and the maps API will look it up and pin it on the map and complete the address.

Rating system and features for spaces: Dog Friendly, Washing Facilities, Warm, Dry, Power points, costs, referals numbers, etc.

Comments, Images, Video and document support for spaces and links

Uses cloundary for image CDN so minimal and fast traffic, compresses and resizes images, works out faces and crops photos for user profiles.

Creates thumbnail images of sites added for links, converts them to base64 and stores them in the mongodb for rapid display

A SMS alerting service would be a nice feature so that homeless people can be alerted to new spaces and facilicities being offered in their are such as street vets, doctors, etc.  
