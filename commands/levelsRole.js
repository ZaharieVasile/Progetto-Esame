module.exports = {
    name: 'lvlrole',
    description: "",
    
    execute(message, args){
        //controlliamo che l'utente abbia i permessi di amministratore
        if(message.member.permissions.has("ADMINISTRATOR")){
            message.guild.roles.create({ data: { name: args[0]}}); //creiamo il ruolo
            message.reply("Ruolo creato correttamente");
        }
        else{
            message.reply("Non possiedi i permessi necessari per poter usufruire di questo comando");
        }
    }
}