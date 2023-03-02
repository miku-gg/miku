---
label: Load bots
icon: desktop-download
order: 1790
---

Once you have a bot config created by you or someone else, you can load it to the bot database.

## Using the bot directory

To load a bot, go to your local `https://localhost:8585/` where the bot directory is.

![](/assets/bot_directory.png)

To load a bot, select the `.miku` file of you download or created. and then click on **"Upload"**

And that's it! You can now click on the bot name to start using it.

!!!danger Be Aware!
Be careful when you install bots from external sources. Make sure it's from a trusted bot developer and that the bot is not malicious. I only recomend downloading bots from discord that have been reviewed by the community.

There will be a Share/Download bot server where you will be able to download all the trusted bots, but it's not ready yet.
!!!

## Doing it manually

If you want to understand how the bot loading works under the hood, you can do it manually.

### Instruction to load a bot

1. Make sure that your local bot-directory server is running at `http://localhost:8585`
2. Download [postman](https://www.postman.com/downloads/)
3. Open postman and create a new POST request to `http://localhost:8585/bot` with the bot config as the body.

![](/assets/add_bot.png)

Make sure to have the header
```
Content-Type: application/json
```

4. Once you clicked on send, the server should return the bot hash:
![](/assets/add_bot_response.png)


5. Once you have bot hash, just paste it in the webapp url as a `?bot=` parameter; refresh and it should work.
![](/assets/add_bot_url.png)

### Add bot images

You'll likely need upload the images to the bot server too, because you'll reference them their by hash. 
The process is similar, just sent a file to `http://localhost:8585/image` using postman and you will be returned the hash of the image.

![](/assets/image-upload.png)

For the headers:
```
Content-Type: multipart/form-data
```
