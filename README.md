# SchoolDiscordBot
Discord Bot for my school class.
This repo is just read-only, it will be hard for you to make it work - this bot is perfectly made just for my class.

# Features!

  - Mute for time
  - Role by reaction click
  - Automatic voting system
  - Event/tasks managment (older than 7 are moved off)
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
  "channels": {
    "admin-bot": "channel id for managing bot",
    "vote": "channel id for voting",
    "event": "channel id for event",
    "supplementation": "channel id for supplementation",
    "role": "channel id for roles",
    "event-archive": "channel id for event archives",
    "dank-memes": "channel id for dank memes"
  },
  "groups": {
    "all": "role id for all (member)",
    "sku1": "role id for group 1 ",
    "sku2": "role id for group 2",
    "ang1": "role id for ang 1",
    "ang2": "role id for ang 2"
  },
  "mute-role": "role id for mute",
  "channels-to-roles": {
    "channel id": "role to add"
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