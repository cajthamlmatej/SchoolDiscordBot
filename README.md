# SchoolDiscordBot
Discord Bot for my school class.
This repo is just read-only, it will be hard for you to make it work fine for you - this bot is perfectly made just for my class. If you somehow manage to get it working, be sure you disable supplementation module - its really only for us. 

# Features!

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

```{
  "token": "token of the bot that you can get from discord dev portal",
  "prefix": "! - prefix of the bot",
  "guild": "main guild id where bot operates",
  "language": "en",
  "roles": {
    // groups of roles
    // groups that can be mention with event command
    "mentionable": {
      "member": "id of the role"
    },
    // groups that can be assign by click on reaction/using command
    "assignable": {
      "name": "id of the role"
    },
    // special roles, must contain role lock and mute
    "special": {
      "rolelock": "id of the role",
      "mute": "id of the role"
    },
    // permission roles for using commands, must contain member and moderator
    "permission": {
      "member": "id of the role",
      "moderator": "id of the role"
    }
  },
  // list of channels, must contains all values
  "channels": {
    "vote": "id of the channel",
    "supplementation": "id of the channel",
    "role": "id of the channel",
    "event": "id of the channel",
    "event-archive": "id of the channel",
    "news": "id of the channel",
    "annoucement": "id of the channel"
  },
  "modules": {
    // auto reaction
    "auto-reaction": {
      // react to any attachment in CHANNEL: EMOJI
      "channels-attachments": {
        "channel id": "emoji id"
      },
      // react to emoji in any channel with emoji
      "emojis": {
        "<:emojiname:emojiid>": "emoji id"
      }
    },
    "supplementation": {
      // highlights for supplementation
      "highlights": [
        "3.C",
        "3. ročníky",
        "3. ročník"
      ],

      // refresh time of supplementation
      "refresh": 900000
    },
    "mute": {
      "role": "role id",
      // max mute length in minutes
      "max": 10080
    },
    "event": {
      // no. of days of event to move to archive
      "days": 1,
      // refresh time of events
      "refresh": 1800000
    },
    "disabled": [
      // ["supplementationmodule"]
    ]
  },
  "commands": {
    "disabled": [
      // ["purge"]
    ]
  }
}
```

You can start bot with command: 

```sh
$ npm start
```

### How to add language / How to translate bot

If you want to add language (translate bot messages), you just need to copy already existing language file from /language/<language>.json (we recommend to use English - en file). Then save it whatever shortcut name that your language uses and translate all strings. Remember to dont change key paths that bot fetch. After you translate all strings you need to set language shortcut in config, just change `"language"` to your language shortcut. If you think it will be good to have the language in bot files, do pull reqest to git. We will be happy for any contribution.

### Dependencies

All dependencies will be download by node/npm automaticaly.

| Dependency | Version |
| ------ | ------ |
| Discord.js | 11.3.2 |
| moment | 2.22.2 |
| jsdom | 12.0.0 |
