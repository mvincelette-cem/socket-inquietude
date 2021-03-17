// Importation des modules de Node.js
let fs = require('fs');

let https = require('https');
let path = require('path')
let SocketIO = require('socket.io');

// Configurations
const config = {
    adresse: "inquietude.dectim.ca",
    port: 3002,
    certificat: fs.readFileSync(path.resolve() + '/securite/certificat.pem'),
    cle: fs.readFileSync(path.resolve() + '/securite/cle.pem')
}

// Instantiation d'un serveur HTTP et d'un serveur de WebSocket utlisant le serveur HTTP comme
// couche de transport
const serveur = https.createServer({key: config.cle, cert: config.certificat});
const io = SocketIO(serveur);

// Démarrage du serveur HTTP
serveur.listen(config.port, config.adresse, () => {
    console.log("Le serveur est prêt et écoute sur le port " + serveur.address().port);
});
let socketTD;
let socketInterface;

io.on("connection", socket => {

    if (socket.handshake.query.type === "interface") {
        socketInterface = socket;
        socketInterface.emit('succes');
        console.log("Connexion d\'un socket d'interface")

        socketInterface.on('disconnect', () =>{
            console.log('Déconnexion d\'un socket d\'interface')

        });
    } else {
        console.log('connection d\'un socket de TD');

        socketTD = socket;
        socketTD.emit('testing');
        console.log('Émission du testing');

        socketTD.on('disconnect', () =>{
            console.log('Déconnexion de Touchdesigner');
            socketTD= null;
        });

    }
    if (socketTD && socketInterface) {
        socketInterface.on('motenvoye', (data) => {
            console.log('mot envoye = ' + data.query.mot)

            socketTD.emit('petitpois', data.query.mot);
            console.log('Émission du mot à TouchDesigner');
        })
    }
});
