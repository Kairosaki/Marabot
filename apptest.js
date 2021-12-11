// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const json = require('./info.json');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const mySecret = process.env['token'];

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Temp array
let myArr = []

// add a new command 
function addCommand(msg) {
  //let re = /"(\w+)\W*(\w+)"/g
  //myArr = msg.content.replace(re, '$1,$2').split(" ")
  //console.log(msg.content.split(" ")[2])
  let strArr = ""
  for (let i in msg.content.split(" ")) {
    if (i < 2) {
      myArr.push(msg.content.split(" ")[i])
    } else {
      strArr += " "+msg.content.split(" ")[i]
    }
  }
  myArr.push(strArr)
  console.log(strArr)
  console.log(myArr)
  if (myArr.length != 3) {
    msg.reply("max 2 args")
  } else {
    json[myArr[1]] = myArr[2].replace(",", " ");
    fs.writeFile("./info.json", "\n"+JSON.stringify(json), err => {
      if(err) console.log(err);
    });
    msg.reply(`Votre entrée **${myArr[1]}** a bien été ajoutée`)
    myArr = []
  }
}

// list added commands
function listCommands(msg) {
  let arrTest = [];
  for (const [key, value] of Object.entries(json)) {
    arrTest.push("$"+key)
  }
  let newArr = "```\n"+arrTest.toString().replace(/,/g, " \n")+"```\n"
  msg.reply(`la liste : **${newArr}**`);
}

// delete a command
function deleteCommand(msg) {
  myArr = msg.content.split(" ")
  if (myArr.length > 2) {
    msg.reply("max 1 arg")
  } 
  else {
    delete json[myArr[1]];
    fs.writeFile("./info.json", "\n"+JSON.stringify(json), err => {
      if(err) console.log(err);
    });
    msg.reply(`Votre entrée **${myArr[1]}** a bien été supprimé`)
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

// Lancement du bot pour confirmer sa connexion
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
});

client.on("messageCreate", msg => {
  // only the channel specified
  if (msg.channel.id === "918606393219616798" || msg.channel.id === "918607399357669406") {
    if (msg.author.bot) return;
    
    let userMessage = msg.content.slice(1);
    if(json.hasOwnProperty(userMessage)) {
      msg.reply(json[userMessage])
      .then(() => console.log(`Replied to message ${msg.content}`))
      .catch(console.error);
    } 
    else if(msg.content.slice(0,4) === "$add") {
      addCommand(msg)      
    } 
    else if (msg.content === "$list") {
      listCommands(msg)
    }
    else if(msg.content.slice(0,4) === "$del") {
      deleteCommand(msg)
    }
    else if (msg.content === "$pascontent") {
      if (msg.author.id === "202118392008802305") {
        clearChat(msg)
      }
    }
    else if (msg.content === "$help") {
      msg.reply("```\nLE BOT N'EST ACTIF QUE SUR LE CHANNEL commands\n\nLa liste des commandes actuelles (évolue au fur & à mesure) :\n\n$list : Affiche toutes les commandes relatifs à la formation Devops, c'est aussi basé sur vos ajouts au fur et à mesure.\n\n$add : la syntaxe exacte c'est '$add macommande texte'\n- macommande = le nom que vous donnerez à la commande.\n- texte sera votre descriptif ou lien ou image ou autre.\nexemples :\n - $add share https://nc1.opencom.eu/index.php/s/oeoqFzgPT8aycLG?path=%2F12-Docker-Images\n - $add mdpshare DevOps21fai9Ee\n\n$del : la syntaxe '$del commande' : assez explicite ça supprime la commande présente dans la liste\n\n$help : Affiche ce message\n\n```")
    }
    else if (msg.content.slice(0,1) === "$") {
        msg.reply("La requête demandée n'existe pas, si vous désirez l'ajouter merci de taper $add")
        .then(() => console.log(`Replied to message ${msg.content}`))
        .catch(console.error);
    }  
  }
});


client.login(mySecret);
