# DESCRIPTION
Twitter API interfaced and dockerized application that (actually) can fetch and console log followers and tweets' mentions of a target user.
Data are stored in a MongoDB Collection.
Edit the docker-compose.yml and replace the API_KEY value with your personally obtained api key (https://developer.twitter.com/en/docs/authentication/oauth-2-0), then simply lauch it with:

``` 
    docker compose up
``` 
and you should see the 4 simple tests passing.
other functions are available by editing the Dockerfile changing the RUN line with one of the following commands:
    
```    
    npm run download-tweets "@TargetUser"
``` 
updates downloaded tweets from Twitter API if already stored and fetch eventually new ones, or download them anew

```
    npm run get-mentions "@TargetUser"
``` 
print out TargetUser mentioned accounts in its tweets from stored tweets

```    
    npm run download-followers "@TargetUser"
``` 
updates followers from Twitter API if already stored and fetch eventually new ones, or download them anew

```    
    npm run get-followers "@TargetUser"
``` 
print out TargetUser followers from stored account

Replace "@TargetUser" with your username of choice, quotes and "@" are mandatory.
ASlso be sure to rebuild the the image, it should looks like this "twitter-catcher_app:latest"
if you list your images with docker image ls.