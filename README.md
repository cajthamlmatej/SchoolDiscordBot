# SchoolDiscordBot
Discord Bot for my school class.
This repo is just read-only, it will be hard for you to make it work - this bot is perfectly made just for my class.

# Features!

  - Mute for time
  - Role by reaction click
  - Automatic voting system
  - Event/tasks managment (older than 7 days are moved to different channel)
  - Supplementation logging
  - Auto-reaction in specified channels/emojis
  - Fun.


### Installation

School Discord Bot is just for my class. I cant give any support while installing/modifing it.

```sh
$ git clone https://github.com/cajthamlmatej/SchoolDiscordBot.git
$ npm install
```

After cloning and installing dependencies, copy config.template.json to config.json and update values.

```json
{
  "token": "bot token",
  "prefix": "!",
  "mute-role": "mute role id",
  "moderator-role": "moderator role id",
  "member-role": "member role id",
  "rolelock-role": "role lock role id",
  "guild": "guild id",
  "supplementation-highlight": "highlight for supplementation",
  "max-mute-length": "max mute length in minutes",
  "channels": {
    "vote": "channel id for voting",
    "event": "channel id for event",
    "supplementation": "channel id for supplementation",
    "role": "channel id for roles",
    "event-archive": "channel id for event archives"
  },
  "roles": {
    "role shortcut": "role id"
  },
  "channels-to-roles": {
    "channel id": "role to add"
  },
  "commands-groups": {
    "main": "🔔 Main commands",
    "school": "🎓 School commands",
    "vote": "🎟 Commands for voting",
    "manage": "💾 Commands for managment"
  },
  "auto-reaction": {
    "channels-attachments": {
      "channel id": "emoji id"
    },
    "emojis": {
      "emoji long id with name": "emoji id"
    }
  }
}
```

You can start bot with command: 

```sh
$ npm start
```

### Dependencies

All dependencies will be download by node automaticaly.

| Dependency | Version |
| ------ | ------ |
| Discord.js | 11.3.2 |
| moment | 2.22.2 |
| jsdom | 12.0.0 |
