---
label: Lorebooks
icon: book
order: 99
---

# Lorebooks

Lorebooks are a powerful feature in the Miku.gg Novel Builder that allow you to create dynamic and context-aware responses from your AI characters. Essentially, a lorebook is a collection of prompts and information entries that provide the AI with specific details about your novel's world, characters, or story. By defining keywords for each entry, you ensure that the AI references this information only when it's relevant, which helps maintain an efficient use of tokens and keeps the AI's responses consistent and informed.

### Creating a Lorebook

Creating lorebooks involves defining individual entries. Each entry consists of content that describes a particular aspect of your novel's world, such as the geography of a fictional country or the background of a character, along with keywords that trigger the use of this content.

[!embed Lorebook creation tutorial](/assets/novel-builder/tutorial_2.mp4)

### Steps

1. First, click on **New Lorebook** and put the basic information.
   - **Name**: Enter the name of the lorebook.
   - **Description**: Provide a brief description of the lorebook.
2. Now, create entires by clicking on **+ Entry**. And for each entry fill the following.
   - **Entry Name**: Enter the name of the entry.
   - **Content**: Provide the content for the entry. [How do I format it?](#entry-optimization)
   - **Keywords**: Define keywords that will trigger the inclusion of this entry in the AI's prompts.

!!!info When will an entry be used?
The entry will be used when a keyword is **mentioned in the conversation**. Only the top 3 entries are will be added per AI response. _The keyword order is important. Put the most relevant keyword first._
!!!

### Lorebook visibility

+++ Global Lorebook
Check the **Global lorebook** option if you want the lorebook to be used throughout the entire novel.
+++ Scene-Specific Lorebook
The lorebook will be used only in the scenes you specify when creating them.
+++ Character-Specific Lorebook
The lorebook will be used whenever the a specific character is present. You can select it when creating a character.
+++

### Entry optimization

Keep entries concise and relevant. Use keywords wisely to ensure the AI has the right context without overloading its memory with unnecessary information.

The content should have the Q-A format.

```
user: Which country are we in?
Anna: Did you forget your head too, user? We are in Tokyo, Japan!
```

This also allows to give a personality to the response, so the AI can use it as example.

!!!warning Use templates
To refer the player, wrap the word `user` in between double `{` `}`. This will be replaced with the player's chosen name when playing.
If you want to do the same for the character, warp `char` with double curly braces.

See the tutorial video above for reference.
!!!

By following these steps, you can create rich, dynamic lorebooks that enhance the depth and realism of your visual novel, providing the AI with the necessary context to generate immersive and accurate responses.
