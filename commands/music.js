const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

const queue = new Map();

let server_queue;

module.exports = {
    name : 'music',
    description : 'Questo file conterrà ogni comando riguardante la musica',

    //comando per far unire il bot nel canale vocale e far partire la musica
    async Play(message, args){
        const voiceChannel = message.member.voice.channel;
        //serve per controllare che l'utente si trovi in un canale vocale 
        if(!voiceChannel){
            return message.reply(" devi essere all'interno di un canale vocale per usare questo comando!");
        }

        const permissions = voiceChannel.permissionsFor(message.client.user);
        //controlla che l'utente abbia il permesso di collegarsi ai canali vocali o che abbia il permesso di parlare all'interno dei suddetti canali
        if(!permissions.has('CONNECT')){
            return message.reply(" non possiedi il permesso per entrare nei canali vocali pertanto non puoi utilizzare questo comando");
        }
        if(!permissions.has('SPEAK')){
            return message.reply(" non possiedi il permesso per parlare nei canali vocali pertanto non puoi utilizzare questo comando");
        }

        server_queue = queue.get(message.guild.id);
        //controlla se dopo il comando è stato specificato che cosa si vuole ascoltare 
        //(importante perchè senza la specifica il bot non saprà cosa riprodurre)
        if(!args.length){
            return message.reply(" devi specificare cosa vuoi ascoltare!");
        }

        let song = {};

        //questo if controlla se l'argomento inserito è un URL:
        //se lo è allora cercherà e prenderà le informazioni da esso
        //se non è un URL allora cercherà il video usando l'argomento
        if(ytdl.validateURL(args[0])){
            const song_info = await ytdl.getInfo(args[0]);
            //inseriamo le informazioni in song
            song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url };
        } else{
            //videoFinder cercherà ogni video che corrisponde alla query e poi lo assegnerà a videoResult
            const video_finder = async (query) => {
                const videoResult = await ytSearch(query);
                //nel comando sotto riportato controlliamo se la lista di video in videoResult è maggiore di 1 
                //se lo è allora prenderemo il primo video sennò returneremo null
                return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
            }

            //la prossima variabile conterrà il video selezionato che riprodurremo all'interno del cannale
            const video = await video_finder(args.join(' '));

            if(video){ //controlla se si riceve un risultato della ricerca
                //se si aggiungiamo le informazioni
                song = { title: video.title, url: video.url }
            }
            else{ //sennò avvisiamo dell'errore
                return message.reply(" non è stato trovato alcun risultato inerente alla tua ricerca");
            }
        }

        //controlliamo se il server in cui il bot è attivo è gia presente nella mappa dei server
        if(!server_queue){
            //se non lo è allora lo aggiungiamo
            const queue_constructor = {
                voice_channel: voiceChannel,
                text_channel: message.channel,
                connection: null,
                songs: []
            }

            queue.set(message.guild.id, queue_constructor);
            //inseriamo le informazioni delle canzoni nella lista che abbiamo creato sopra
            queue_constructor.songs.push(song);

            try{
                const connection = await voiceChannel.join(); //variabile per contenere la connessione al canale
                queue_constructor.connection = connection;
                video_player(message.guild, queue_constructor.songs[0]);
            } catch(err){
                queue.delete(message.guild.id);
                message.reply(" c'è stato un errore nella connessione");
                throw err;
            }
        } else{
            //se invece lo è allora mettiamo solo la nuova canzone nella lista
            server_queue.songs.push(song);
            return message.reply(`:thumbsup: **${song.title}** aggiunta alla lista!`)
        }

        
    },

    //comando per fermare il bot e farlo uscire dal canale vocale
    async Stop(message, args){
        const voiceChannel = message.member.voice.channel;

        if(!voiceChannel){
            return message.reply(" devi essere all'interno di un canale vocale per usare questo comando!");
        }

        //eliminiamo tutte le canzoni nella lista di quel specifico server e dopo togliamo la connessione
        //alla canzone che si sta ascoltando cosicchè quando il bot controllerà se ci sono canzoni successive
        //allora si fermerà ed uscirà dal canale vocale
        server_queue.songs = [];
        server_queue.connection.dispatcher.end();
    }, 

    //comando per skippare la canzone che si sta ascoltando e avanzare alla prossima
    async Skip(message, args){
        if(!message.member.voice.channel){
            return message.reply(" devi essere all'interno di un canale vocale per usare questo comando!");
        }

        //controlliamo se ci sono canzoni nella lista
        if(!server_queue){
            return message.reply(" non ci sono canzoni nella lista");
        }

        //questo comando serve per finire la "connessione" alla canzone che si sta ascoltando
        //e passare alla prossima della lista
        server_queue.connection.dispatcher.end();
    },

    //comand per mostare l'attuale lista di canzoni del server
    async List(message, args){
        if(!message.member.voice.channel){
            return message.reply(" devi essere all'interno di un canale vocale per usare questo comando!");
        }
        
        var list = "";
        for(var i=0; i<server_queue.songs.length;i++){
            list += JSON.stringify(server_queue.songs[i].title) + "\n";
        }
        console.log(list);
        await server_queue.text_channel.send(`🎶 Playlist:\n` + list);
    }
}

//questa funzione farà in modo che il bot riproduca la musica nel canale vocale
const video_player = async (guild, song) => {
    const song_queue = queue.get(guild.id);

    //controlliamo se la lista contiene almeno una canzone
    if(!song){
        //se non contiene allora gli facciamo lasciare il canale
        song_queue.voice_channel.leave();
        await song_queue.text_channel.send('Va bene lascio il canale :smiling_face_with_tear:');
        //dopodichè gli facciamo eliminare la queue dalla lista dei server
        queue.delete(guild.id);
        return;
    }

    //adesso prendiamo il video e gli facciamo riprodurre solo l'audio e gli impostiamo anche il volume
    const stream = ytdl(song.url, { filter: 'audioonly' });
    song_queue.connection.play(stream, { seek: 0, volume: 0.5 })
    .on('finish', () => {
        //quando una canzone sarà completamente finità il comando sotto gli permetterà di passare
        //alla prossima canzone della lista
        song_queue.songs.shift();
        //dopo ripetiamo la funzione da capo creando un loop finchè la lista non finisce
        video_player(guild, song_queue.songs[0]);
    });

    await song_queue.text_channel.send(`🎶 Ora in riproduzione **${song.title}**`);
}