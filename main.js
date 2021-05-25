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
const { strict } = require('assert');

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
var a = 0;
var rolelvl = [];

//utilizziamo sync per utilizzare il comando proprio mentre il bot è attivo ovvero in maniera sincrona
if(fs.existsSync('stats.json')){
    //qui leggiamo il file per poter dare a ogni utente il proprio livello e xp salvato
    stats = jsonfile.readFileSync('stats.json'); 
}

client.on('message', message =>{
    //sezione sistema dei livelli
    
    //qui controlliamo se il messaggio è inviato dal bot
    //questa parte di codice serve per impedire che il bot prenda esperienza quando invia un messaggio sul server
    //inoltre impedisce ai vari utenti di ottenere xp tramite i comandi digitati
    if(message.content.startsWith(prefix) || message.author.bot){ //si può anche usare if(message.author.id == "806831072582041642")
        return;                                                   //dove si controlla se l'id dell'autore del messaggio sia l'id del bot
    }

    //per i livelli
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
    //utilizziamo questa funzione if per impedire agli utenti di spammare messaggi permettendogli di salire più velocemente di livello
    if(Date.now() - userStats.last_message > 500){
        userStats.xp += random.int(15, 30);
        userStats.last_message = Date.now();

        const xpToNextLvl = 5 * Math.pow(userStats.level, 2) + 50 * userStats.level + 100

        if(userStats.xp >= xpToNextLvl){
            userStats.level++;
            var v = false;
            message.channel.send(`${message.author}` + ' hai raggiunto il livello ' + userStats.level);
             //questo simbolo ` non esiste nella tastiera italiana
            //per digitarlo bisogna selezionare la tastiera inglese e digitare il tasto dove si trova il backslash
            //usando message.reply(" hai raggiunto il livello " + userStats.level); si ottiene lo stesso risultato
            var a = "";
            for(var i = 0; i < rolelvl.length; i++){
                const args1 = rolelvl[i];
                if(i != 0){
                    const args2 = rolelvl[i-1];
                    if(userStats.level == args1[1]){ 
                        let role2 = message.guild.roles.cache.find(r => r.name === args2[0]);
                        let role1 = message.guild.roles.cache.find(r => r.name === args1[0]);
                        message.member.roles.remove(role2).catch(console.error);
                        message.member.roles.add(role1).catch(console.error);
                        a = " hai ottenuto il livello necessario per diventare " + role1.name;
                        v = true;
                    }
                }else{
                    if(userStats.level == args1[1]){
                        let role1 = message.guild.roles.cache.find(r => r.name === args1[0]);
                        message.member.roles.add(role1).catch(console.error);
                        a = " hai ottenuto il livello necessario per diventare " + role1.name; 
                        v = true;
                    }
                } 
            }
            if(v){
                message.reply(a); 
            }
            v = false;
            userStats.xp = userStats.xp - xpToNextLvl;
        }

        //qui salviamo le informazioni attuali sui file json
        jsonfile.writeFileSync('stats.json', stats);

        console.log(message.author.username + ' ha ' + userStats.xp + ' xp');
        console.log('Servono ' + xpToNextLvl + ' xp per salire di livello');
    }
});
//separiamo il sistema dei livelli e i comandi in due funzioni differenti per evitare il conflitto
//al controllo della composizione e della provenienza del messaggio
//----------------------------------------------------------------------------------------------------
client.on('message', message => {
    //sezione comandi

    //controlliamo se il messaggio inviato da un qualsiasi utente contenga il prefisso per i comandi e che non appartenga al bot
    if(!message.content.startsWith(prefix) || message.author.bot){  
        return;
    }

    //prendiamo il comando staccandolo dal prefisso e guardiamo se esiste tra i comandi sotto riportati
    const args = message.content.slice(prefix.length).split(/ +/); 
    const command = args.shift().toLowerCase()
    
    if(command === 'ping'){ //comando di prova
        client.commands.get('ping').execute(message, args);
    }
    else if(command === 'createlvl'){
        client.commands.get('lvlrole').execute(message, args);
        rolelvl[a] = args;
        a++; 
    }
    else if(command === 'mod'){
        client.commands.get('moderator').addMod(message, args);
    }
    else if(command === 'remod'){
        client.commands.get('moderator').remMod(message, args);
    }
    else if(command === 'kick'){
        client.commands.get('moderator').Kick(message, args);
    }
    else if(command === 'ban'){
        client.commands.get('moderator').Ban(message, args);
    }
    else if(command === 'play'){
        client.commands.get('music').Play(message, args);
    }
    else if(command === 'skip'){
        client.commands.get('music').Skip(message, args);
    }
    else if(command === 'stop'){
        client.commands.get('music').Stop(message, args);
    }
    else if(command === 'clear'){
        client.commands.get('clear').execute(message, args);
    }
});
//qui ci va il token 
client.login(/*'ODA2ODMxMDcyNTgyMDQxNjQy.YBvJ_Q.hUwB1YHrwedSDNHW1dTbBaHu7IY'*/); //serve per collegare il codice al bot discord

///https://discord.com/developers/applications/806831072582041642/bot
///https://www.youtube.com/watch?v=HCjwncsTVzQ
///https://www.youtube.com/watch?v=5BArCspxauI
///https://www.youtube.com/watch?v=I7eZY-SBmf8
///https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
///https://discordjs.guide/popular-topics/permissions.html#setting-role-permissions
///