//abbiamo creato il file package.json tramite il comando npm init sul prompt della cartella
//Per la cartella node_modules e package-lock.json invece abbiamo utilizzato npm install discord.js
//abbiamo creato il file stats.json usando il comando npm install jsonfile dove salveremo i livelli

const Discord = require('discord.js');
const random = require('random');
const jsonfile = require('jsonfile');

const client = new Discord.Client();

const prefix = '-';

const fs = require('fs');
const { waitForDebugger } = require('inspector');

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log("Multi bot pronto all'azione!");
});

var stats = {};
//utilizziamo sync per utilizzare il comando proprio mentre il bot è attivo ovvero in maniera sincrona
if(fs.existsSync('stats.json')){
    //qui leggiamo il file per poter dare a ogni utente il proprio livello e xp salvato
    stats = jsonfile.readFileSync('stats.json'); 
}

client.on('message', message => {
    //sezione sistema dei livelli
    
    //qui controlliamo se il messaggio è inviato dal bot
    //questa parte di codice serve per impedire che il bot prenda esperienza quando invia un messaggio sul server
    if(message.author.bot){ //si può anche usare if(message.author.id == "806831072582041642")
        return;             //dove si controlla se l'id dell'autore del messaggio sia l'id del bot
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
    if(Date.now() - userStats.last_message > 7500){
        userStats.xp += random.int(20, 50);
        userStats.last_message = Date.now();

        const xpToNextLvl = 5 * Math.pow(userStats.level, 2) + 50 * userStats.level + 100

        if(userStats.xp >= xpToNextLvl){
            userStats.level++;
            if(userStats.level == 3){

            }
            else if(userStats.level == 5){

            }
            userStats.xp = userStats.xp - xpToNextLvl;
            message.channel.send(`${message.author}` + ' hai raggiunto il livello ' + userStats.level);
            //questo simbolo ` non esiste nella tastiera italiana
            //per digitarlo bisogna selezionare la tastiera inglese e digitare il tasto dove si trova il backslash
            //usando message.reply(" hai raggiunto il livello " + userStats.level); si ottiene lo stesso risultato
        }

        //qui salviamo il livello e gli xp attuali sul file json
        jsonfile.writeFileSync('stats.json', stats);

        console.log(message.author.username + ' ha ' + userStats.xp + ' xp');
        console.log('Servono ' + xpToNextLvl + ' xp per salire di livello');
    }

    //----------------------------------------------------------------------------------------------------
    //sezione comandi

    //controlliamo se il messaggio inviato da un qualsiasi utente contenga il prefisso per i comandi
    if(!message.content.startsWith(prefix) || message.author.bot){  
        return;
    }

    //prendiamo il comando staccandolo dal prefisso e guardiamo se esiste tra i comandi sotto riportati
    const args = message.content.slice(prefix.length).split(/ +/); 
    const command = args.shift().toLowerCase()

    if (command === 'ping'){ //comando di prova
        client.commands.get('ping').execute(message, args);
    }
});
//qui ci va il token 
client.login(''); //serve per collegare il codice al bot discord