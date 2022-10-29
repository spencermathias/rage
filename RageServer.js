const { message } = require("allgameplugin")
const comms = require("allgameplugin")
const io = comms.createServer({keepSockets:true, standAlonePort:8080},(gameID)=>{return true})
const app = comms.clientFiles()
app.use("./htmlRage")
var playerIndexes={};
var gameModes={Lobby:1,Bid:2,Play:3};
var gameState=gameModes.Lobby;
var options={
	cardsForRounds:[10,9,8,7,6,5,4,3,2,1,0],
	cardDesc : {
		colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#FF8C00", "#A510A5"],
				  //red       green       blue     yellow      orange     purple
		numPerSuit: 16,
		wordCardColor: "#000000",
		wordCardIdentifier: -1,
		noneColor: "#ffffff",
		noneCardIdentifier: -2,
		outs: 4,
		changes: 4,
		wilds: 0,
		minus: 2,
		plus: 2
	}
};
const maxPlayers=9;
const minPlayers=2;
var roundNumber;
var currentTurn = 0;
var nextToLeadRound = 0;
var trumpCard=undefined;

var players=[]
var gameColor='#00ff00'
io.sockets.on("connection",(socket)=>{
    if(playerIndexes[socket.id]==undefined&&gameState==gameModes.Lobby){
        players.push({
            socketID:socket.id,
            score:0,
            ready:false,
            bid:-1
        });
        playerIndexes[socket.id]=players.length-1;
    };

    socket.on("reconnect",(data)=>{console.log(data)});

    socket.on("options",(data)=>{
        let roundNumbers=[];
        if(data.cardsForRounds){
            roundNumbers=data.cardsForRounds.map(x=>(parseInt(x)+11)%11)
            //check round numbers
            if(roundNumbers.length === data.cardsForRounds.length && roundNumbers.every((value, index) => value === data.cardsForRounds[index])){
                options.cardsForRounds=data.cardsForRounds
                io.emit('message',{"message":'Rounds will now be '+options.cardsForRounds, "color":gameColor})
            }else{
                console.log('{rage}','round numbers are not valid')
            }
        }
        //check card options
        if(data.cardOptions!=undefined){//this is to validate card options 
            if(data.cardOptions.colors!=undefined){
                options.cardDesc.colors=data.cardOptions.colors
                io.emit("message",{"message":'card colors changed', "color":gameColor})
                io.emit("message",{"message":'there are now '+options.cardDesc.colors.length+' colors', "color":gameColor})
            }
            if(data.cardOptions.numPerSuit!=undefined){
                options.cardDesc.numPerSuit=data.cardOptions.numPerSuit
                io.emit("message",{"message":'the largest number is now '+(options.cardDesc.numPerSuit-1), "color":gameColor})
            }
        }
        let tempMax=parseInt(options.cardDesc.colors.length*options.cardDesc.numPerSuit/Math.max(...options.cardsForRounds))
        if(tempMax>2){
            maxPlayers=tempMax
        }else{
            options.cardDesc.numPerSuit=Math.ceil(2*Math.max(options.cardsForRounds)/options.cardDesc.colors.length)
            maxPlayers=2
            io.emit("message",{"message":'Not enough cards ', "color":gameErrorColor})
            io.emit("message",{"message":'the largest number is now '+(options.cardDesc.numPerSuit-1), "color":gameColor})
        }
        io.emit("message",{"message":'you may now have up to '+tempMax+' players', "color":gameColor})
    });

    socket.on("ready",()=>{
        players[playerIndexes[socket.id]].ready^=true;
        if(players.every((x)=>{return x.ready}) && players.length>1){
            gameState=gameModes.Bid;
            gameStart();
        }
    });

    socket.on("bid", (value)=>{
        if(gameState=gameModes.Bid){
            players[playerIndexes[socket.id]].bid=value;
            if(players.every((x)=>{x.bid!=-1}) && gameState==gameModes.Bid){
                gameState=gameModes.Play;
                let bidTotal = players.reduce((prev,cur)=>prev.bid+cur.bid)
                io.sockets.emit("playerLeadsRound",false)
                io.sockets.emit("message",{message:bidTotal + " bid on " + currentRound, color:gameColor})
                tallyScoreFromHand()
                getHand();
            }
        }
    });

    socket.on('cardSelected',(cardSubmitted)=>{
        if( gameStatus === gameMode.HAND) {
            if(socket.id=players[currentTurn].socketID){

            }
    });
});

function gameStart() {
    roundNumber = 0
	currentTurn = 0;
	if(players.length > 0){
		console.log('{rage}',"gameStart");
		io.sockets.emit("message",{ message:"THE GAME HAS STARTED", color:gameColor});
		//reset players
		players.forEach(function(client) {
            client.statusColor = notYourTurnColor;
            client.score = 0;
		});
		io.sockets.emit("showGame", true);
		nextToLeadRound = Math.floor(Math.random()*players.length); //random starting person
		startRound(options);
	}
}
function startRound(options,roundNumber) {
    // remake the deck
    deck = makeDeck(options.cardDesc)
    let cardAmount = options.cardsForRounds[roundNumber]
	players.forEach(function(player){ //reset player for round
		player.cards = deck.splice[cardAmount?-cardAmount:-1];
		player.handsWon = [];
		player.handScore = 0;
		player.bid = -1;
		player.cardSelected = cardAmount?noneCard:player.cards[0];
        player.statusColor=notReadyColor;
        io.sockets[player.socketID].emit("cards",player.cards)
	});
    console.log('{rage}', "round: " + currentRound);
	nextToLeadRound += 1; //next person in order starts round
	nextToLeadHand = currentTurn = nextToLeadRound%players.length;
    let currentTurnID=players[currentTurn].socketID
    console.log('{rage}',currentTurnID,"(",io.sockets[currentTurnID].name,") leads the round");

    io.sockets[currentTurn].emit('playerLeadsRound',true)
    io.sockets.emit("message",{ message:io.sockets[currentTurnID].name+ " leads this round!", color:gameColor});
    
    trumpCard=getTrumpCard();

    gameState=gameModes.Bid
    io.sockets.emit("requestBid",currentRound)
    updateUsers();
}

function getTrumpCard(cards) {
    trumpCard = deck.pop();
    while( trumpCard.type !== "number") {
		if( trumpCard.type !== noneCard.type ){
			console.log('{rage}', "trump removed");
		}
        if ( deck.length == 0 ) { //give up if no number cards
            let index = Math.floor(Math.random() * (options.cardDesc.colors.length));
            trumpCard = {type: "number", owner: "deck", color: options.cardDesc.colors[index], number: options.cardDesc.numPerSuit, ID: -1};
        }else{
            trumpCard = cards.pop()
        }
    }
    io.sockets.emit("trumpCard",trumpCard);
}

function getHand() {
    //check if trump is out
    if (trumpCard.type === noneCard.type ) {
        chooseTrumpCard(deck);
    }
    ledCard = noneCard;
    players.forEach(function(player) {
        player.cardSelected = noneCard; //reset selected
    });
	console.log('{rage}','turn: ', currentTurn, 'player:', players[currentTurn].socketID);
    io.sockets[players[currentTurn].socketID].emit("requestCard");
	updateTurnColor();
}


function updateUsers() {
    console.log('{rage}',"--------------Sending New User List--------------");
    
    io.sockets.emit("userList",players.map((client)=>{
        console.log('{rage}',"userName:", client.socketID, " |ready:", client.ready, "| bid:", client.bid, "|status:", client.statusColor);
        console.log('{rage}',"cardType:", client.cardSelected.type, "|score:", client.score + client.handScore);
            return {
                id: client.socketID,
                userName: client.userName,
                numberOfCards: client.cards.length,
                color: client.statusColor,
                cardSelected: client.cardSelected,
                bid: client.bid,
                handsWon: client.handsWon.length,
                cardsLeft: client.cards.length,
                score: client.score + client.handScore
            };
        })
    );
    console.log('{rage}',"----------------Done Sending List----------------");
}