module.exports = {
    name: 'moderator',
    description: "Questo file conterrà ogni operazione che riguarda i comandi dei moderatori",
    
    //comando per assegnare (e se necessario creare) il ruolo di moderatore
    addMod(message, args){
        if(message.member.permissions.has("ADMINISTRATOR")){
            ///i comandi sotto riportati fino alla creazione della costante member servono per identificare 
            ///l'utente a cui vogliamo dare il ruolo di moderatore
            const { guild } = message;
            const targetUser = message.mentions.users.first(); 
            if(!targetUser){
                message.reply(' non hai specificato a chi dare il ruolo di moderatore');
                return;
            }
            const member = guild.members.cache.get(targetUser.id);
            //nella creazione di modbool utilizziamo some per controllare se il ruolo esiste o no (booleana)
            let modbool = message.guild.roles.cache.some(r => r.name.startsWith('Mod') || r.name.startsWith('mod'));
            let mod = message.guild.roles.cache.find(r => r.name.startsWith('Mod') || r.name.startsWith('mod'));
            ///se la bool è vera allora il ruolo esiste e lo assegna subito all'utente indicato
            ///se la bool è falsa allora creiamo il ruolo e chiediamo di ripetere il comando
            if(modbool){
                if(member.roles.cache.has(mod.id)){
                    message.reply(" questo utente possiede gia il ruolo di moderatore");
                }
                else{
                    member.roles.add(mod).catch(console.error);
                    message.reply(" il ruolo del moderatore è stato assegnato correttamente");
                }
            }
            else{
                message.guild.roles.create({ data: { name: 'Moderator', color: 'RED', permissions: ['KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'MANAGE_ROLES', 'CONNECT', 'SPEAK']}});
                message.reply(" il ruolo di moderatore è inesistente... \n Creazione del ruolo in corso... \n Ruolo creato correttamente. \n Ora puoi riutilizzare il comando");
            }
        }
        else{
            message.reply("Non possiedi i permessi necessari per poter usufruire di questo comando");
        }
    },
    
    //comando per rimuovere il ruolo di moderatore
    remMod(message, args){
        if(message.member.permissions.has("ADMINISTRATOR")){
            ///i comandi sotto riportati fino alla creazione della costante member servono per identificare 
            ///l'utente a cui vogliamo dare il ruolo di moderatore
            const { guild } = message;
            const targetUser = message.mentions.users.first(); 
            if(!targetUser){
                message.reply(' non hai specificato a chi togliere il ruolo di moderatore');
                return;
            }
            const member = guild.members.cache.get(targetUser.id);
            //nella creazione di modbool utilizziamo some per controllare se il ruolo esiste o no (booleana)
            let modbool = message.guild.roles.cache.some(r => r.name.startsWith('Mod') || r.name.startsWith('mod'));
            let mod = message.guild.roles.cache.find(r => r.name.startsWith('Mod') || r.name.startsWith('mod'));
            ///se la bool è vera allora il ruolo esiste e lo rimuoviamo subito all'utente indicato
            ///se la bool è falsa allora informiamo l'admin che il ruolo non esiste
            if(modbool){
                if(member.roles.cache.has(mod.id)){
                    member.roles.remove(mod).catch(console.error);
                    message.reply(" il ruolo del moderatore è stato rimosso correttamente");
                }
                else{
                    message.reply(" questo utente gia non possiede il ruolo di moderatore");
                }
            }
            else{
                message.reply(" il ruolo di moderatore non esiste per tanto non è possibile rimuoverlo dall'utente da lei scelto");
            }
        }
        else{
            message.reply("Non possiedi i permessi necessari per poter usufruire di questo comando");
        }
    },
    
    //comando per kickare un utente
    Kick(message, args){
        if(message.member.permissions.has("KICK_MEMBERS")){
            const targetUser = message.mentions.users.first(); 
            if(!targetUser){
                message.reply(' non hai specificato chi kickare');
                return;
            }
            const member = message.guild.members.cache.get(targetUser.id);
            member.kick(); //comando che butta fuori l'utente dal server
            message.reply(" utente kickato con successo");
        }
        else{
            message.reply(" non possiedi il permesso necessario per usufruire di questo comando")
        }
    },
    
    //comando per bannare un utente
    Ban(message, args){
        if(message.member.permissions.has("BAN_MEMBERS")){
            const targetUser = message.mentions.users.first(); 
            if(!targetUser){
                message.reply(' non hai specificato chi bannare');
                return;
            }
            const member = message.guild.members.cache.get(targetUser.id);
            member.ban(); //comando che butta fuori l'utente dal server togliendogli il permesso di rientrare di nuovo
            message.reply(" utente bannato con successo");
        }
        else{
            message.reply(" non possiedi il permesso necessario per usufruire di questo comando");
        }
    },
}