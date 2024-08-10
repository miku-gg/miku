---
label: Create bot emotions
icon: accessibility
order: 1000
---

This guide explains how to create the chracter expression for a mikugg character using stable diffusion.

### Prerequisites

- Automatic1111 Stable Diffusion Web UI for generating images
- Latest version of ControlNet installed
- An anime model, e.g. meinamix

### 1. Prepare the concept image

The first thing you need to have is the character concept image. You don't need to have an reference image, but you need to generate one.

![Tutorial example with "failed experiment cat girl"](/assets/emotion_tutorial_1.jpg)

The basic method is to:

- Describe your character in the prompt of Automatic 1111.
- Generate multiple images until you find one that aligns with your character.

You can also use another image as a reference if you are unsure about the prompt. For example, here I used some random concept image I found an pass it through ControlNet's Canny method to get a better result

||| text2img prompt
![](/assets/emotion_tutorial_2_1.png)
||| ControlNET config
![ref image credit to @grapesliime](/assets/emotion_tutorial_2.png)
||| Result
![ControlNET Canny method example result](/assets/emotion_tutorial_3.png)
|||

### 2. Prepare OpenPose poses

![OpenPose Editor](/assets/emotion_tutorial_4.png)-

The next step is to generate the character in different poses. For this, we first need to build an image with all the poses we want for the character.

The idea is to build a png image with ideally 4 poses, with a total of `2048x512` pixels.

You can find reference poses in [OpenPoses](https://openposes.com/). You can use the **OpenPose Editor** in stable diffusion too.

You should use Gimp or Photoshop to create the image with the 4 pose structures. The final image should look like this:

![2048x512 final image](/assets/emotion_tutorial_4_1.png)

### 3. Generate the character sheet

Now that we have the reference image, the character prompt and the poses reference, we can head back to automatic1111 and build the character sheet.

1. Go to txt2img, write you previous prompt (positive and negative)
2. The dimensions should be 2048 x 512
3. Add two control nets
4. The first controlnet should be "reference only" with your reference image
5. The second controlnet should be "open pose" with your poses image (2048x512) without preprocessor.

||| text2img prompt
![2048x512](/assets/emotion_tutorial_5_1.png)
||| ControlNET "Only Reference"
![make sure to use "Resize and Fill"](/assets/emotion_tutorial_5_2.png)
||| ControlNET "OpenPose"
![](/assets/emotion_tutorial_5_3.png)
|||

The result quality doesn't have to be the best, feel free to try many configurations, prompt variations and different references if you have many.

After a few interations, I ended up deciding for this image

![final chosen image](/assets/emotion_tutorial_6.png)

As you can see, the image is still unclea, has some faces are not the best and hands are not properly drawn. We will fix these issues in the next section.

### 4. Edit and split poses

#### Upscale character sheet image

First let's add more detail to our image using img2img upscaling by clicking on "Send to img2img". The important thing here is to use a low **Denoising strength** to avoid destroying the image too much and add more details in the proccess.

||| img2img prompt
![](/assets/emotion_tutorial_7_1.png)
||| parameters
![Denoising strength=3](/assets/emotion_tutorial_7_2.png)
|||

![High quality result](/assets/emotion_tutorial_7_3.png)

#### Remove background and split

Once you have your desired character sheet, you need to remove the backgrounds and split them into poses. You can do this with the [stable-diffusion-webui-rembg](https://github.com/AUTOMATIC1111/stable-diffusion-webui-rembg) tool, or with any background-removing tool, or manually.
Something you need to do some small tweaks to the images and automatic tools don't work very well, so this step can take some time.

After you have clean up the pngs, separate each pose in a diffrent png file to get it ready for expression inpainting.

||| pose1
![](/assets/emotion_tutorial_7_4_pose1.png)
||| pose2
![](/assets/emotion_tutorial_7_4_pose2.png)
||| pose3
![](/assets/emotion_tutorial_7_4_pose3.png)
||| pose4
![](/assets/emotion_tutorial_7_4_pose4.png)
|||

### 5. Generate expressions

We will use a tool called [miku_expressions_gen.py](https://rentry.org/mikugg-emotions-script). Which is a script for Automatic1111. Please follow the instructions in that link about how to install it.

After installing the script, you should place one of the poses in the "inpaint" area of img2img. and you should inpaint the face rea.

![](/assets/emotion_tutorial_8_1.png)

You should make sure to:

- Use an inpaiting model
- Mask the face correctly
- maintain the same prompt and it MUST end with a comma `, `
- "Only masked" option should be selected as the inpaint area.
- Denosing strength should be set to a high value like `0.75`

Do some test inpaitings to check everything is set up correctly.
Once you're ready, run the script called `miku.gg:inpaint expressions` and select the desired emotion pack.

![](/assets/emotion_tutorial_8_2.png)

One you have run the script, it will generate all the expressions. For reference it took me almost 3 minutes for the 29 expressions of 1024x1024 images in a RTX 3090.

![](/assets/emotion_tutorial_8_3.png)

Please do the same with each pose so you can have more variety of expressions. Also, if some expressions are meant for specific poses, you can unselect them in the checkboxes for the other poses.

The expresions should be saved in a folder inside the `outputs/expresions_packs` folder of your stable-diffusion-webui folder. Each image expression has their name written in their file, which makes is simplier to import into the miku bot builder.

![](/assets/emotion_tutorial_8_4.png)

### 6. Import into Miku

Finally, you can import all these poses and their expressions into Miku.
For a tutorial on how to create a bot, please refer to the [Create bots](/guides/bots/create-bots.md) guide.

![](/assets/emotion_tutorial_9.png)
