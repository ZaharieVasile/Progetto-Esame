module.exports = {
    name: 'clear',
    description: "Comando per cancellare uno specifico numero di messaggi dal canale",

    async execute(message, args){
        if(message.member.permissions.has("MANAGE_MESSAGES")){
                //controlliamo che sia presente un argomento
            if(!args[0]){
                return message.reply(' devi specificare il numero di messaggi che vuoi eliminare!');
            }

            //controlliamo se l'argomento è un numero
            if(isNaN(args[0])){
                return message.reply(' devi inserire numeri non lettere!');           
            }

            //controlliamo che il numero non superi un certo valore (utilizzeremo 100 come limite)
            //e che non sia minore di 1
            if(args[0] > 100){
                return message.reply(' non puoi cancellare un numero massimo di 100 messaggi!');
            }
            if(args[0] < 1){
                return message.reply(' devi cancellare almeno un messaggio se utilizzi questo comando!');
            }   

            //eliminiamo il numero di messaggi che vogliamo usando fetch 
            //che va a prendere gli ultimi messaggi in base al valore dell'argomento
            //e bulkDelete che li elimina
            await message.channel.messages.fetch({limit : args[0]}).then(messages =>{
                message.channel.bulkDelete(messages);
            });
        }
    }
}