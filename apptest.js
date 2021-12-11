// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const json = require('./info.json');
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
  let strArr = ""
  let msgExist = msg.content.split(" ")[1]
  if (msgExist === "add" || msgExist === "help" || msgExist === "del" || msgExist === "pascontent" || msgExist === "list") {
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
    if (myArr.length != 3) {
      msg.reply("max 2 args")
    } else {
      json[myArr[1]] = myArr[2].replace(",", " ");
      fs.writeFile("./info.json", "\n"+JSON.stringify(json), err => {
        if(err) console.log(err);
      });
      msg.channel.send(`Votre entrée **${myArr[1]}** a bien été ajoutée`)
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
    msg.channel.send(`La commande **${myArr[1]}** a bien été supprimé`)
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
  if (msg.channel.id === myChannel1 || msg.channel.id === myChannel2) {
    if (msg.author.bot) return;
    
    let userMessage = msg.content.slice(1);
    if(json.hasOwnProperty(userMessage)) {
      msg.channel.send(json[userMessage])
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
      if (msg.author.id === admin) {
        clearChat(msg)
      }
    }
    else if (msg.content === "$help") {
      msg.channel.send("```\nLE BOT N'EST ACTIF QUE SUR LE CHANNEL commands\n\nLa liste des commandes actuelles (évolue au fur & à mesure) :\n\n$list : Affiche toutes les commandes relatifs à la formation Devops, c'est aussi basé sur vos ajouts au fur et à mesure.\n\n$add : la syntaxe exacte c'est '$add macommande texte'\n- macommande = le nom que vous donnerez à la commande.\n- texte sera votre descriptif ou lien ou image ou autre.\nexemples :\n - $add share https://nc1.opencom.eu/index.php/s/oeoqFzgPT8aycLG?path=%2F12-Docker-Images\n - $add mdpshare DevOps21fai9Ee\n\n$del : la syntaxe '$del commande' : assez explicite ça supprime la commande présente dans la liste\n\n$help : Affiche ce message\n\n```")
    }
    else if (msg.content.slice(0,1) === "$") {
        msg.reply("La requête demandée n'existe pas, si vous désirez l'ajouter merci de taper $add")
        .then(() => console.log(`Replied to message ${msg.content}`))
        .catch(console.error);
    }  
  }
});


client.login(mySecret);
