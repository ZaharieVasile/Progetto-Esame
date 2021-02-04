module.exports = {
    name: 'ping',
    description: "questo è un comando di prova",
    execute(message, args){
        message.reply(' PONG!');
    }
}