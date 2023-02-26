---
label: Load bots
icon: desktop-download
order: 1790
---

Once you have a bot config created by you or someone else, you can load it to the bot database.

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
