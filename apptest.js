// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const json = require('./info.json');
const userJson = require('./usercommands.json');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const mySecret = process.env['token'];
const admin = process.env['admin'];
const myChannel1 = process.env['channel1'];
const myChannel2 = process.env['channel2'];

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });
const talkedRecently = new Set();
// Temp array
let myArr = []

// add a new command 
function addCommand(msg) {
  let userCommand = msg.content.split(" ")[1]
  let arrCommands = []
  for (const [key, value] of Object.entries(json)) {
    arrCommands.push(`$${key}`)
  }
  let userCommandValue = msg.content.replace(/(^\W\w+\s)(.*)/, '$2')
  if (userCommand === "add" || userCommand === "myadd" || userCommand === "help" || userCommand === "del" || userCommand === "mydel" || userCommand === "pascontent" || userCommand === "list" || userCommand === "mylist" || arrCommands.find(item => item === "$" + userCommand)) {
    msg.reply(`La commande **${userCommand}** existe déjà`)
  }
  else {
    json[userCommand] = userCommandValue;
    fs.writeFile("./info.json", JSON.stringify(json, null, 4), err => {
      if (err) console.log(err);
    });
    msg.channel.send(`La commande **${userCommand}** a bien été ajoutée`)
  }
}

// list added commands
function listCommands(msg) {
  let arrTest = [];
  for (const [key, value] of Object.entries(json)) {
    arrTest.push("$" + key)
  }
  let newArr = "```\n" + arrTest.toString().replace(/,/g, " \n") + "```\n"
  msg.channel.send(`**${newArr}**`);
}

// edit a command
function editCommand(msg) {
  let arrKey = []
  let index;
  let strEdit = "";
  for (let [key, value] of Object.entries(json)) {
    arrKey.push(key)
  }
  index = arrKey.findIndex(item => item === msg.content.split(" ")[1])
  for (let i in msg.content.split(" ")) {
    if (i >= 2) {
      strEdit += " " + msg.content.split(" ")[i]
    }
  }
  json[arrKey[index]] = strEdit
  fs.writeFile("./info.json", JSON.stringify(json, null, 4), err => {
    if (err) console.log(err);
  });
  msg.channel.send(`La commande **${arrKey[index]}** a été modifiée avec succès !`)
}

// delete a command
function deleteCommand(msg) {
  myArr = msg.content.split(" ")
  if (myArr.length > 2) {
    msg.reply("max 1 arg")
  }
  else {
    delete json[myArr[1]];
    fs.writeFile("./info.json", JSON.stringify(json, null, 4), err => {
      if (err) console.log(err);
    });
    msg.channel.send(`La commande **${myArr[1]}** a bien été supprimé`)
  }
}

// update addCommandByUser
function addCommandByUser(msg) {
  let user = msg.author.username
  let nbrOfUsers = 0
  let userExist = false;
  let userCommand = msg.content.split(" ")[1]
  let userCommandValue = msg.content.replace(/(^\W\w+\s)(.*)/, '$2')
  for (let u of Object.values(userJson)[0]) {
    if (user === u.name) {
      userExist = true;
      if (!u.commands.hasOwnProperty(userCommand)) {
        u.commands[userCommand] = userCommandValue
      } else {
        msg.reply("Ta commande perso existe déjà")
      }
    }
  }
  nbrOfUsers = Object.values(userJson)[0].length
  console.log(nbrOfUsers)
  if (!userExist) {
    if (nbrOfUsers === 0) {
      userJson["user"] = { "name": user, "commands": { [userCommand]: userCommandValue } }
    } else {
      userJson["user"][nbrOfUsers] = { "name": user, "commands": { [userCommand]: userCommandValue } }
    }
  }

  fs.writeFile("./usercommands.json", JSON.stringify(userJson, null, 4), err => {
    if (err) console.log(err);
  })
  msg.channel.send("Commande perso crée avec succès ! Tapez $mylist pour afficher la liste de vos commandes.")
}

// list user command
function listUserCommands(msg, userTagged) {
  let user = msg.author.username
  let userCommands = []
  let userOption = msg.content.split(" ")[1]
  for (let u of Object.values(userJson)[0]) {
    if (user === u.name) {
      for (let [key, value] of Object.entries(u.commands)) {
        userCommands.push("$" + key)
      }
    }
  }
  let message = "```\n" + userCommands.toString().replace(/,/g, " \n") + "\n```"
  if (userOption === "mp") {
    msg.author.send(message)
  } else if (userOption === "at") {
    findDestination(message, userTagged, msg.channel.id, msg.author.id)
  } else {
    msg.channel.send(message)
  }
}

// delete a user command 
function deleteUserCommand(msg) {
  let sender = msg.author.username;
  let findIndex = userJson.user.findIndex(el => el.name === sender);
  let commandExist = false;
  let commandAsked = msg.content.split(" ")[1]
  for (const [key, value] of Object.entries(userJson)) {
    if (value[findIndex].commands[commandAsked]) {
      delete value[findIndex].commands[commandAsked]
      commandExist = true;
    }
  }
  fs.writeFile("./usercommands.json", JSON.stringify(userJson, null, 4), err => {
    if (err) console.log(err);
  })
  if (commandExist) {
    msg.channel.send(`La commande ${commandAsked} a bien été supprimée`)
  } else {
    msg.channel.send("La commande n'existe pas !")
  }

}

// clear tchat
function clearChat(msg) {
  (async () => {
    let deleted;
    do {
      deleted = await msg.channel.bulkDelete(100);
    } while (deleted.size != 0);
  })();
}

function findDestination(msg, usr, senderChannel, senderID) {
  const guild = client.guilds.cache.get('897069149019320370');
  // discord test
  // const guild = client.guilds.cache.get('918042511245733939');
  //let mpUserId = "202118392008802305"
  //let userId = usr.replace(/(^\W\W)(\d)(\W)/, '$2')
  let userId = usr.slice(3, -1)
  if (talkedRecently.has(senderID)) {
    client.channels.fetch(senderChannel).then(channel => {
      channel.send("Attendez 10 sec !!")
    })
  } else {
    client.users.fetch(userId).then(user => {
      user.send(msg)
    })
    client.channels.fetch(senderChannel).then(channel => {
      channel.send("Spam success !!")
    })
    talkedRecently.add(senderID);
    setTimeout(() => {
      talkedRecently.delete(senderID);
    }, 10000);
  }

}

// Lancement du bot pour confirmer sa connexion
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
});

client.on("messageCreate", msg => {
  // only the channel specified
  if (msg.channel.id === myChannel1 || msg.channel.id === myChannel2) {
    if (msg.author.bot) return;

    let customCommand = false;
    let userOption = msg.content.split(" ")[1]
    let userTagged = msg.content.split(" ")[2]
    let user = msg.author.username
    let senderId = msg.author.id
    let channelId = msg.channel.id
    let counter = 0
    let userMessage = msg.content.split(" ")[0].slice(1);
    for (let item of Object.values(userJson)[0]) {
      if (item.name === user && item.commands.hasOwnProperty(userMessage)) {
        customCommand = true
      } else {
        if (!customCommand) counter++
      }
    }
    //console.log("custom command is "+customCommand)
    if (json.hasOwnProperty(userMessage)) {
      msg.channel.send(json[userMessage])
        .then(() => console.log(`Replied to message ${msg.content}`))
        .catch(console.error);
    }
    else if (msg.content.slice(0, 4) === "$add") {
      addCommand(msg)
    }
    else if (msg.content.slice(0, 6) === "$myadd") {
      addCommandByUser(msg)
    }
    else if (msg.content === "$list") {
      listCommands(msg)
    }
    else if (msg.content.slice(0, 4) === "$del") {
      deleteCommand(msg)
    }
    else if (msg.content.slice(0, 5) === "$edit") {
      editCommand(msg)
    }
    else if (msg.content.slice(0, 7) === "$mylist") {
      listUserCommands(msg, userTagged)
    }
    else if (msg.content.slice(0, 6) === "$mydel") {
      deleteUserCommand(msg)
      //msg.reply("la commande mydel est temporairement indisponible")
    }
    else if (msg.content.slice(0, 7) === "$avatar") {
      msg.channel.send(msg.author.displayAvatarURL({ dynamic: true }))
    }
    else if (msg.content === "$pascontent") {
      if (msg.author.id === admin) {
        clearChat(msg)
      }
    }
    else if (msg.content === "$help") {
      msg.channel.send("```\nLa liste des commandes CRUD :\n\n$list : Affiche toutes les commandes hormis ceux présents dans $help.\n$add : ajoute une commande. ex: $add sharemdp DevOps21fai9Ee\n$del : supprime la commande désignée.\n$edit : modifier une commande. ex: $edit test votretexte\n$myadd : ajoute dans votre liste perso\n$mylist: affiche les commandes persos, $mylist mp : pour la recevoir en privé\n$mydel: supprime la commande perso```")
    }
    else if (customCommand) {
      if (userOption === "mp") {
        msg.author.send(Object.values(userJson)[0][counter].commands[userMessage])
      } else if (userOption === "at") {
        findDestination(Object.values(userJson)[0][counter].commands[userMessage], userTagged, channelId, senderId)
      } else {
        msg.channel.send(Object.values(userJson)[0][counter].commands[userMessage])
      }

    }
    else if (msg.content.slice(0, 1) === "$") {
      msg.reply("La requête demandée n'existe pas, si vous désirez l'ajouter merci de taper $add ou $myadd")
        .then(() => console.log(`Replied to message ${msg.content}`))
        .catch(console.error);
    }
  }
});


client.login(mySecret);
