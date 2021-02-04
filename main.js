//Ho creato il file package.json tramite il comando npm init sul prompt della cartella
//Per la cartella node_modules e package-lock.json invece ho utilizzato npm install discord.js

const Discord = require('discord.js');
const random = require('random');

const client = new Discord.Client();

const prefix = '-';

const fs = require('fs');
const { waitForDebugger } = require('inspector');

client.commands =new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log("Multi bot pronto all'azione!");
});

var stats = {};

client.on('message', message => {
    //sezione sistema di livellamento
    
    if(message.author.id == "806831072582041642"){
        return;
    }

    if(message.guild.id in stats === false){
        stats[message.guild.id] = {};
    }

    const guildStats = stats[message.guild.id];
    if (message.author.id in guildStats === false){
        guildStats[message.author.id] = {
            xp: 0,
            level: 0,
            last_message: 0
        };
    }

    const userStats = guildStats[message.author.id];
    userStats.xp += random.int(20, 50);

    const xpToNextLvl = 5 * Math.pow(userStats.level, 2) + 50 * userStats.level + 100

    if(userStats.xp >= xpToNextLvl){
        userStats.level++;
        userStats.xp = userStats.xp - xpToNextLvl;
        message.reply(' hai raggiunto il livello ' + userStats.level);
    }

    console.log(message.author.username + ' ha ' + userStats.xp + ' xp');
    console.log('Servono ' + xpToNextLvl + ' xp per salire di livello');

    //----------------------------------------------------------------------------------------------------
    //sezione comandi

    if(!message.content.startsWith(prefix) || message.author.bot){  //controllo se il messaggio inviato da un qualsiasi utente contenga il prefisso per i comandi
        return;
    }

    const args = message.content.slice(prefix.length).split(/ +/); //prendo il comando staccandolo dal prefisso e guardo se esiste tra i comandi sotto riportati
    const command = args.shift().toLowerCase()

    if (command === 'ping'){
        client.commands.get('ping').execute(message, args);
    }
});

client.login(''/*qui ci va il token */); //serve per collegare il codice al bot discord