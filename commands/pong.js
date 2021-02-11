//Comando di prova
module.exports = {
    name: 'ping',
    description: "Quando l'utente digita -ping il bot richiamerà tale utente e gli risponderà pong",
    execute(message, args){
        message.reply(' PONG!');
    }
}