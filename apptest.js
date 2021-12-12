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
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Temp array
let myArr = []

// add a new command 
function addCommand(msg) {
  let msgTest = msg;
  let strArr = ""
  let arrExist = []
  let msgExist = msgTest.content.split(" ")[1]
  for (const [key, value] of Object.entries(json)) {
    arrExist.push("$"+key)
  }
  if (msgExist === "add" || msgExist === "help" || msgExist === "del" || msgExist === "pascontent" || msgExist === "list" || arrExist.find( item => item === "$"+msgExist)) {
    msg.reply(`La commande **${msgExist}** existe déjà`)
  } 
  else { 
    for (let i in msg.content.split(" ")) {
      if (i < 2) {
        myArr.push(msg.content.split(" ")[i])
      } else {
        strArr += " "+msg.content.split(" ")[i]
      }
    }
    myArr.push(strArr)
    if (myArr.length != 3) {
      msg.reply("max 2 args")
    } else {
      json[myArr[1]] = myArr[2].replace(",", " ");
      fs.writeFile("./info.json", JSON.stringify(json), err => {
        if(err) console.log(err);
      });
      msg.channel.send(`La commande **${myArr[1]}** a bien été ajoutée`)
      myArr = []
    }
  }
}

// list added commands
function listCommands(msg) {
  let arrTest = [];
  for (const [key, value] of Object.entries(json)) {
    arrTest.push("$"+key)
  }
  let newArr = "```\n"+arrTest.toString().replace(/,/g, " \n")+"```\n"
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
  index = arrKey.findIndex( item => item === msg.content.split(" ")[1])
  for (let i in msg.content.split(" ")) {
    if (i >= 2) {
      strEdit += " "+msg.content.split(" ")[i]
    }
  }
  json[arrKey[index]] = strEdit
  fs.writeFile("./info.json", JSON.stringify(json), err => {
    if(err) console.log(err);
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
    fs.writeFile("./info.json", JSON.stringify(json), err => {
      if(err) console.log(err);
    });
    msg.channel.send(`La commande **${myArr[1]}** a bien été supprimé`)
  }
}

// update addCommandByUser
function addCommandByUser(msg) {
  let counter = 0;
  let indexUser = 0;
  let userExist = false;
  let commandExist = false;
  let userCommand = msg.content.split(" ")[1]
  let userCommandValue = msg.content.replace(/(^\W\w+\s\w+\s)(.*)/, '$2')
  if (userCommand === "") {
    console.log("command empty")
  } else {
    for(const [key, value] of Object.entries(userJson)) {
      // if user exists
      if(msg.author.username === value[counter].name) {
        console.log("match !")
        userExist = true;
        indexUser = counter;
        // if command exist
        for(let [k, v] of Object.entries(value[counter].commands)) {
          if(k === userCommand) {
            commandExist = true;
          }
        }
      } else {
        counter++
      }
    }
    console.log(userCommand)
    if(!userExist) {
      userJson["user"] = [{"name": msg.author.username, "commands": { [userCommand] : userCommandValue }}]
    } 
    else if (commandExist) {
      msg.channel.send("La commande existe déjà !")
    } 
    else {
      userJson["user"][counter].commands[userCommand] = userCommandValue
    }
    fs.writeFile("./usercommands.json", JSON.stringify(userJson), err => {
      if(err) console.log(err);
    })
  }
}

// list user command
function listUserCommands(msg) {
  let user = msg.author.username
  let userExist = false
  let arrCommands = []
  let counter = 0
  let indexUser = 0
  for (let [key, value] of Object.entries(userJson)) {
    if (user === value[counter].name) {
      userExist = true
      indexUser = counter
    } else {
      counter++
    }
  }
  if (userExist) {
    for(const [k, v] of Object.entries(userJson["user"][indexUser].commands)) {
      arrCommands.push(`$${k}`)
    }
    let newArr = "```\n"+arrCommands.toString().replace(/,/g, " \n")+"```\n"
    msg.channel.send(`**${newArr}**`)
  } else {
    msg.reply("Veuillez d'abord créer des commandes !")
  }
  
}

// delete a user command 
function deleteUserCommand(msg) {
  let commandExist = false;
  let commandAsked = msg.content.split(" ")[1]
  for (const [key, value] of Object.entries(userJson)) {
    if (value[0].commands[commandAsked]) {
      delete value[0].commands[commandAsked]
    }
  }
  fs.writeFile("./usercommands.json", JSON.stringify(userJson), err => {
    if(err) console.log(err);
  })
  msg.channel.send(`La commande ${commandAsked} a bien été supprimée`)
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

// Lancement du bot pour confirmer sa connexion
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
});

client.on("messageCreate", msg => {
  // only the channel specified
  if (msg.channel.id === myChannel1 || msg.channel.id === myChannel2) {
    if (msg.author.bot) return;
    let userIndex = 0;
    let counter = 0;
    let userMessage = msg.content.slice(1);
    for (let [key, value] of Object.entries(userJson)){
      if (userJson["user"][userIndex].commands.hasOwnProperty(userMessage)) {
        console.log("trouvé !!!!")
        userIndex = counter;
      } else {
        counter++
      }
    }
    if(json.hasOwnProperty(userMessage)) {
      msg.channel.send(json[userMessage])
      .then(() => console.log(`Replied to message ${msg.content}`))
      .catch(console.error);
    } 
    else if (userJson["user"][userIndex].commands[userMessage]) {
      msg.channel.send(userJson["user"][userIndex].commands[userMessage])
    }
    else if(msg.content.slice(0,4) === "$add") {
      addCommand(msg)      
    } 
    else if (msg.content.slice(0,6) === "$myadd") {
      addCommandByUser(msg)
    }
    else if (msg.content === "$list") {
      listCommands(msg)
    }
    else if(msg.content.slice(0,4) === "$del") {
      deleteCommand(msg)
    }
    else if(msg.content.slice(0,5) === "$edit") {
      editCommand(msg)
    }
    else if(msg.content.slice(0,7) === "$mylist") {
      listUserCommands(msg)
    }
    else if(msg.content.slice(0,6) === "$mydel") {
      deleteUserCommand(msg)
    }
    else if(msg.content.slice(0,7) === "$avatar") {
      msg.channel.send(msg.author.displayAvatarURL({dynamic : true}))
    }
    else if (msg.content === "$pascontent") {
      if (msg.author.id === admin) {
        clearChat(msg)
      }
    }
    else if (msg.content === "$help") {
      msg.channel.send("```\nLa liste des commandes CRUD :\n\n$list : Affiche toutes les commandes hormis ceux présents dans $help.\n$add : ajoute une commande. ex: $add sharemdp DevOps21fai9Ee\n$del : supprime la commande désignée.\n$edit : modifier une commande. ex: $edit test votretexte\n$myadd : ajoute dans votre liste perso\n$mylist: affiche les commandes persos\n$mydel: supprime la commande perso```")
    }
    else if (msg.content.slice(0,1) === "$") {
        msg.reply("La requête demandée n'existe pas, si vous désirez l'ajouter merci de taper $add")
        .then(() => console.log(`Replied to message ${msg.content}`))
        .catch(console.error);
    }  
  }
});


client.login(mySecret);
