# SchoolDiscordBot
Discord Bot for my school class.
This repo is just read-only, it will be hard for you to make it work fine for you - this bot is perfectly made just for my class. If you somehow manage to get it working, be sure you disable supplementation module and bakalari module(or edit it to your page)- its really only for us. 

### Features!

  - Mute for time
  - Role assigment by click to reaction
  - Automatic voting system
  - Event/tasks managment (older than X days are moved to different [archive] channel)
  - Supplementation logging for our school from webpage
  - Auto-reaction in specified channels/emojis to messages, emojis or attachments
  - And other stuff...


### Installation

Be sure that you are know what are you doing while installing it. 

```sh
$ git clone https://github.com/cajthamlmatej/SchoolDiscordBot.git
$ npm install
```

After cloning and installing dependencies, copy config.template.json to config.json, update values and remove comments.

You can start bot with command: 

```sh
$ npm start
```

### How to add language / How to translate bot

If you want to add language (translate bot messages), you just need to copy already existing language file from /language/<language>.json (we recommend to use English - en file). Then save it whatever shortcut name that your language uses and translate all strings. Remember to dont change key paths that bot fetch. After you translate all strings you need to set language shortcut in config, just change `"language"` to your language shortcut. If you think it will be good to have the language in bot files, do pull reqest to git. We will be happy for any contribution.

### How to do custom commands / modules

If you want to create own commands or modules look into custom.md

### Dependencies

All dependencies will be download by node/npm automaticaly.

| Dependency | Version |
| ------ | ------ |
| Discord.js | 11.3.2 |
| moment | 2.22.2 |
| jsdom | 12.0.0 |
| mathjs | 6.0.1 |
