const comms = require("allgameplugin");
const app = comms.clientFiles()
const io = comms.createServer({keepSockets:true, standAlonePort:8080},(gameID)=>{return true})
app.use("./htmlRage")
var roundNumber = 0
var nextToLeadRound = 0
var AllClients={}
var trump=undefined
var options={
    cardInfo:{
        numbers:[...Array(16).keys()],
        colors:["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#FF8C00", "#ff00ff"],
              //red       green       blue     yellow      orange     purple
        wordCards:{out:6,change:6,bonus:2,mad:2,wild:2}
    },
    turnUpTrumpOnNewTrick:true,
    bonusValue:5,
    madValue:-5
}
 const cardTypes={out:()=>{trump=undefined},
           change:()=>{trump=deck.pop()},
           bonus:options.bonusValue,
           mad:options.madValue,
           wild:(socket)=>socket.emit('getWildValue')}


function getDeck(options){
    deck = []
    i = 0
    options.numbers.forEach(number => {
        options.colors.forEach(color => {
            card = {id:i,cardNumber:number,cardColor:color,type:"numberCard"};
            deck.push(card);
            i++;
        });
    });

    for(word in options.wordCards) {
        let AddNumOfWordCards = options.wordCards[word];
        for(j = 0; j > AddNumOfWordCards; j++ )
        {
            card = {id:i,action:word,type:word};
            deck.push(card);
            i++
        }
    };
    //shuffle
    n=5
    while(n){
        let m = deck.length, i;
        while(m){
            i = Math.floor(Math.random() * m--);
            [deck[m],deck[i]]=[deck[i],deck[m]]
        }
        n--
    }
    return deck
}



const colors= {
    Spectator:"#444444",
    Server:"#ffff00",
    NotReady:"#ff0000",
}
const GameModes = {
    LOBBY : 0,
    BID   : 1,
    PLAY  : 2
}


var GameStatus = GameModes.LOBBY;
var ledCard = undefined;

io.sockets.on('connection',function(socket){
    
    socket.userData = DefaultUserData();
    if(GameStatus === GameModes.LOBBY){
        socket.color = Colors.NotReady
    }else{
        WaitingRoom.push(Socket.id)
        socket.color = colors.Spectator
        UpdateAllClients()
    }

    comms.message(socket,'connection established',colors.Server)

    console.log("Socket.io Connection with client " + socket.id +" established");

    socket.on("disconnect",function() {
		comms.message( io.sockets, "" + socket.userData.userName + " has left.", Color.Server);
		comms.message( io.sockets, "Type 'kick' to kick disconnected players", Color.Server);
        console.log("disconnected: " + socket.userData.userName + ": " + socket.id);
    });

    socket.on('oldId', function(id){
		console.log("oldID:", id);
        if(players[id] != undefined){
            console.log("found old player!", players[id].userData.username, socket.userData.userName);
            socket.userData = players[id].userData;
            players[id] = socket;
            socket.emit('cards', socket.userData.cards);
            updateTurnColor();
        } else {
            console.log(__line, "new player");
        }
		
	});

    socket.on("userName", function(userName) {
        socket.userData.userName = userName;
        //socket.userData.ready = false;
        console.log(__line,"added new user: " + socket.userData.userName);
		message(io.sockets, "" + socket.userData.userName + " has joined!", serverColor);
        updateUsers();
    });

    socket.on("ready", function(ready) {
        if (gameStatus === GameModes.LOBBY){
            socket.userData.ready = ready.ready;
			if (socket.userData.ready === true) {
				socket.userData.statusColor = readyColor;
				updateBoard(socket, readyTitleColor , false);
			} else {
				socket.userData.statusColor = notReadyColor;
				updateBoard(socket, notReadyTitleColor , false);
			}
            checkStart();
			console.log(__line,"" + socket.userData.userName + " is ready: " + ready.ready);
            updateUsers();
        }
    });
    socket.on('receiveBid',function(bidAmount){
        if(gameStatus === GameModes.BID){
            socket.userData.bid = bidAmount;
            player.userData.statusColor = readyColor;
            console.log(socket.userData.userName+'bid'+bidAmount);
            updateUsers();
            if(players.every((player)=>player.userData.bid>-1)){
                console.log('all bids in');
                io.sockets.emit('allBidsIn');
                let bidTotal = players.reduce((sum,player)=>player.userData.bid+sum,0);
                comms.message(io.sockets,bidTotal + " bid on " + currentRound, gameColor);
                gameStatus = GameModes.PLAY;
                tallyScoreFromHand(); //show initial score
                startTrick();
            }
        }
    });
    socket.on('cardSelected',function(card){
        if(gameStatus === GameModes.PLAY){
            if(players[currentTurn].id == socket.id){
                if(socket.userData.cards.some((CardInHand)=> card == CardInHand)){
                    //check to see they must play the color lead 
                    if(ledCard.color != undefined){
                        let validCards = socket.userData.cards.filter((CardInHand)=> ledCard.color == CardInHand.color)
                        if(validCards.length>0){
                            if(validCards.some((CardInHand)=> card == CardInHand)){
                                playAndAdvance(socket,card)
                            }else{
                                comms.message(socket,"you must choose the card that matches the color lead",color.GameError)
                            }
                        }else{
                            playAndAdvance(socket,card)
                        }
                    }else{
                        ledCard = card;
                        playAndAdvance(socket,card)
                    }
                }else{
                    comms.message(socket,"card not in your hand",Colors.GameError)
                }
            }else{
                comms.message(socket,"not your turn",Colors)
            }
        }else{
            comms.message(socket,"wrong mode to play cards",color.GameError)
        }
    })
})

function updateUsers() {
    console.log('{rage}',"--------------Sending New User List--------------");
    userList = players.map((player)=>({
        id: player.ID,
        userName: player.userData.userName,
        numberOfCards: player.userData.length,
        color: player.userData.statusColor,
        cardSelected: player.userData.cardSelected,
        bid: player.userData.bid,
        handsWon: player.userData.handsWon.length,
        cardsLeft: client.player.userData.length,
        score: client.score + player.userData.handScore
    }));
    socket.io.emit("userList", userList);
}


function checkStart() {	
    if( gameStatus === GameModes.LOBBY) {
        var readyCount = AllClients.filter(client=>client.ready).length
        if(readyCount <= maxPlayers){
            if(readyCount == allClients.length && readyCount >= minPlayers) {
                gameStart();
            }
        }else{
            comms.message(io.sockets,'you must increase the number of cards in the deck or reduce the number of players before the game can start',colors.GameError)
        }
    }
}

function gameStart(){
    console.log("game start");
    comms.message(io.sockets,"THE GAME HAS STARTED",colors.GameColor)
    //reset players
    players = []
    
    AllClients.array.forEach(function(client){
        if(client.userData.ready){
            client.userData.statusColor = colors.NotYourTurn;
            players.push(client)
        }else{
            client.userData.statusColor = colors.Spectator
        }
    });
    nextToLeadRound = Math.floor(Math.random()*players.length); //random starting person
    //TODO:change screen to game from lobby
    startRound()
}

function startRound(){
    console.log("round: " + currentRound);
    // create deck
    Deck = getDeck(options.CardInfo)
    //add players that are waiting
    let newPlayers = allClients.filter((client)=>{WaitingRoom.some((ID)=>{ID == client.id})});
    newPlayers = newPlayers.filter((player)=>{player.userData.ready});
    let addedPlayerIDs = newPlayers.map((player)=>{player.id})
    //remove added players from waiting room. 
    //keep ID that is different from every added player id in list
    WaitingRoom = WaitingRoom.filter((ID)=>addedPlayerIDs.every((addedID)=>addedID!=ID))
    currentRound = options.numberInHand[roundNumber]
    players.map(p=>p.userData).forEach(player => {
        player.cards = Deck.pop(min(currentRound,1))
        player.statusColor = color.NotReadyColor
        player.cardSelected = undefined;
        player.bid = -1;
        player.handsWon = 0;
        player.handScore = 0;
    });
    //set the person to lead round as current turn
    currentTurn = nextToLeadRound;
    players[currentTurn].emit('playerLeadsRound', true)
    cardTypes.change()
    
    gameStatus = GameModes.BID
    sendCards();
    updateUsers();
    io.sockets.emit("requestBids")
    console.log('wait for bids to come in')
}

function DefaultUserData(){
    return {
        username:'unknown',
        cards:[],
        score:0,
        bid:0,
        ready:false,
        color:NotReadyColor
    }
}

function startTrick(){
    if(options.turnUpTrumpOnNewTrick && trump == undefined){
        cardTypes.change()
    }
    ledCard = undefined
    players[currentTurn].emit('requestCard')
    updateTurnColor()
}

function updateTurnColor(){
    if(players.map((player) => player.UserData.statusColor).some((color)=>color != NotYourTurn)){
        players.forEach((player)=>player.userData.statusColor=color.NotReadyColor)
        players[currentTurn].UserData.statusColor = color.YourTurn
    }
}
function playAndAdvance(socket,card){
    socket.userData.cardSelected = card
    socket.userData.cards = socket.userData.cards.filter((CardInHand)=>card != CardInHand)
    let cardsOnTable = players.map((player,ele)=> player.userData.cardSelected)
    if(cardsOnTable.every((card.type =! undefined))){
        tallyScoreFromHand()
    }else{
        currentTurn = getNextIndex(cardsOnTable,currentTurn)
    }
}

function tallyScoreFromHand(cardsOnTable){
    if(ledCard.color != undefined){
        currentTurn = getTrickWinner(cardsOnTable);
        players[currentTurn].userData.score += cardsOnTable
        .map((card)=>card.action)
        .filter((action)=>typeof(action) == "number")//because the action for mad and bonus
        // are the values that will be added to the score we can filter on that commonality
        .reduce((sum,nextTerm)=>sum+nextTerm,0)
        players[currentTurn].handsWon++
    }else{
        currentTurn = (currentTurn+1) % cardsOnTable.length;
    }
    if(players[currentTurn].userData.cards.length){
        startTrick()
    }else{
        roundNumber++
        nextToLeadRound++
        if(roundNumber<options.numberInHand.length){
            startRound()
        }else{
            EndGame()
        }
    }
}


function getNextIndex(arr, lastPlayerIndex) {
    let found = false;
    let i = (lastPlayerIndex + 1) % arr.length;
    while (!found && i !== lastPlayerIndex && lastPlayerIndex < arr.length) {
        if (typeof arr[i] !== 'object') {
            found = true;
        } else {
            i = (i + 1) % arr.length;
        }
    }
    return i;
}
  

function getTrickWinner(cardsOnTable){
    //get player who wins trick
    let trickWinner = undefined
    if(trump != undefined){
        const trumpOnTable = cardsOnTable
            .map((card,playerIndex) => ({card,playerIndex}))
            .filter(({card})=> card.color == trump.color)
            .toSorted((a,b)=> a.number-b.number);
        if(trumpOnTable.length){
            return trumpOnTable.pop().playerIndex
        }
    }
    const cardsOfColorLed = cardsOnTable
        .map((card,playerIndex) => ({card,playerIndex}))
        .filter(({card})=> card.color == ledCard.color)
        .toSorted((a,b)=> a.number-b.number);
    return cardsOfColorLed.pop().playerIndex
}

function EndGame(){
    console.log('game ended')
    //TODO: change screen from game mode back to lobby
    comms.message(io.sockets,"THE GAME HAS ENDED",colors.gameColor)
    comms.message(io.sockets,"Scores",colors.gameColor)
    
    players.sort((a,b)=>a.userData.score-b.userData.score)
    players.forEach((player)=>comms.message(io.sockets,player.userData.username + ': ' + player.userData.score))
    players = [];
    AllClients.
    updateUsers()

}