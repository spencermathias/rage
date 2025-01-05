const comms = require("allgameplugin");
const app = comms.clientFiles()
const io = comms.createServer({keepSockets:true, standAlonePort:8080},(gameID)=>{return true})
const rageFunctions = require('./rageFunctions.js')
const rageStateMachineClass = require('./rageStateMachine.js')

app.use("./htmlRage")


rageStateMachine = new rageStateMachineClass.machine()
rageStateMachine.main()

io.sockets.on('connection',function(socket){
    rageStateMachine.addPlayer(socket.id)

    comms.message(socket,'connection established',GameColors.Server)

    console.log("Socket.io Connection with client " + socket.id +" established");

    socket.on("disconnect",function() {
		comms.message( io.sockets, "" + socket.userData.userName + " has left.", GameColors.Server);
		comms.message( io.sockets, "Type 'kick' to kick disconnected players", GameColors.Server);
        console.log("disconnected: " + socket.userData.userName + ": " + socket.id);
    });
/*
    socket.on('oldId', function(id){
		console.log("oldID:", id);
        let oldPlayer = players.findIndex((player)=>{id == player.ID})
        if(oldPlayer != -1){
            console.log("found old player!", players[oldPlayer].userData.username, socket.userData.userName);
            socket.userData = players[oldPlayer].userData;
            players[oldPlayer] = socket.userData;
            socket.emit('cards', socket.userData.cards);
            updateTurnColor();
        } else {
            console.log(__line, "new player");
        }
		
	});
*/
    socket.on("userName", function(userName) {
        socket.userData.userName = userName;
        //socket.userData.ready = false;
        console.log("added new user: " + socket.userData.userName);
		comms.message(io.sockets, "" + socket.userData.userName + " has joined!", GameColors.Server);
        updateUsers();
    });

    socket.on("ready", function(ready) {
        rageStateMachine.currentState.updatePlayerReady(rageStateMachine.players,socket.id,ready);
    });

    socket.on('receiveBid',function(bidAmount) {
        rageStateMachine.currentState.updateBid(rageStateMachine.players,socket.id,bidAmount);
    });

    socket.on('cardSelected',async function(card){
        player = rageStateMachine.GetPlayerInfo(rageStateMachine,socket.id)
        if (player.hand.some((handcard)=>{handcard == card})){
            const turnState = await player.myTurn
            rageFunctions.playedCard(card,player.hand,turnState.ledSuit).then(
                (result)=>{
                    player.setTablePlay(result)
                    player.hand = result.cards
                },
                (reject)=>{
                    socket.emit('message',reject.message)
                }
            )  
            
        }
        
    });
})
