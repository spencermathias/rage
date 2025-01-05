const comms = require("allgameplugin");
const app = comms.clientFiles()
const io = comms.createServer({keepSockets:true, standAlonePort:8080},(gameID)=>{return true})
app.use("./htmlRage")
var roundNumber = 0
var nextToLeadRound = 0
var AllClients={}
var players=[]
maxPlayers = 9;
minPlayers = 2;
currentRound = 0;
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
        options.cardInfo.colors.forEach(color => {
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
        let m = deck.length;
        while(m){
            i = Math.floor(Math.random() * m--);
            [deck[m],deck[i]]=[deck[i],deck[m]]
        }
        n--
    }
    return deck
}



const GameColors = {
    Spectator:"#444444",
    Server:"#ffff00",
    Ready:"#00ff00",
    NotReady:"#ff0000",
    NotYourTurn:'#0000FF',
    GameError:"#FF0000",
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
        socket.userData.color =GameColors.NotReady
        players.push(socket.userData)
    }else{
        WaitingRoom.push(Socket.id)
        socket.userData.color = GameColors.Spectator
        UpdateAllClients()
    }

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
        if (GameStatus === GameModes.LOBBY){
            socket.userData.ready = ready;
			if (socket.userData.ready === true) {
				socket.userData.statusColor = GameColors.Ready;
				updateUsers(socket, GameColors.Ready , false);
			} else {
				socket.userData.statusColor = GameColors.notReady;
				updateUsers(socket, GameColors.Ready , false);
			}
            checkStart();
			console.log("" + socket.userData.userName + " is ready: " + ready);
            updateUsers();
        }
    });
    socket.on('receiveBid',function(bidAmount){
        if(GameStatus === GameModes.BID){
            socket.userData.bid = bidAmount;
            player.userData.statusColor = GameColors.Ready;
            console.log(socket.userData.userName+'bid'+bidAmount);
            updateUsers();
            if(players.every((player)=>player.userData.bid>-1)){
                console.log('all bids in');
                io.sockets.emit('allBidsIn');
                let bidTotal = players.reduce((sum,player)=>player.userData.bid+sum,0);
                comms.message(io.sockets,bidTotal + " bid on " + currentRound, GameColors.Server);
                GameStatus = GameModes.PLAY;
                tallyScoreFromHand(); //show initial score
                startTrick();
            }
        }
    });
    socket.on('cardSelected',function(card){
        if(GameStatus === GameModes.PLAY){
            if(players[currentTurn].id == socket.id){
                if(socket.userData.cards.some((CardInHand)=> card == CardInHand)){
                    //check to see they must play the color lead 
                    if(ledCard.color != undefined){
                        let validCards = socket.userData.cards.filter((CardInHand)=> ledCard.color == CardInHand.color)
                        if(validCards.length>0){
                            if(validCards.some((CardInHand)=> card == CardInHand)){
                                playAndAdvance(socket,card)
                            }else{
                                comms.message(socket,"you must choose the card that matches the color lead",GameColors.GameError)
                            }
                        }else{
                            playAndAdvance(socket,card)
                        }
                    }else{
                        ledCard = card;
                        playAndAdvance(socket,card)
                    }
                }else{
                    comms.message(socket,"card not in your hand",GameColors.GameError)
                }
            }else{
                comms.message(socket,"not your turn",GameColors.GameError)
            }
        }else{
            comms.message(socket,"wrong mode to play cards",GameColors.GameError)
        }
    })
})

function updateUsers() {
    console.log('{rage}',"--------------Sending New User List--------------");
    userList = players.map((player)=>({
        id: player.ID,
        userName: player.userName,
        numberOfCards: player.cards.length,
        color: player.statusColor,
        cardSelected: player.cardSelected,
        bid: player.bid,
        handsWon: player.handsWon,
        score: 0
    }));
    io.sockets.emit("userList", userList);
}


function checkStart() {	
    if( GameStatus === GameModes.LOBBY) {
        var readyCount = players.filter(client=>client.ready).length
        if(readyCount <= maxPlayers){
            if(readyCount == players.length && readyCount >= minPlayers) {
                gameStart();
            }
        }else{
            comms.message(io.sockets,'you must increase the number of cards in the deck or reduce the number of players before the game can start',GameColors.GameError)
        }
    }
}

function gameStart(){
    console.log("game start");
    comms.message(io.sockets,"THE GAME HAS STARTED",GameColors.Server)
    /*
    //reset players
    players = []
    AllClients.array.forEach(function(client){
        if(client.userData.ready){
            client.userData.statusColor = GameColors.NotYourTurn;
            players.push(client)
        }else{
            client.userData.statusColor = GameColors.Spectator
        }
    });
    */
    nextToLeadRound = Math.floor(Math.random()*players.length); //random starting person
    //TODO:change screen to game from lobby
    startRound()
}

function startRound(){
    console.log("round: " + currentRound);
    // create deck
    Deck = getDeck(options.CardInfo)
    //add players that are waiting
    /* TODO:add players that are waiting
    let newPlayers = allClients.filter((client)=>{WaitingRoom.some((ID)=>{ID == client.id})});
    newPlayers = newPlayers.filter((player)=>{player.userData.ready});
    let addedPlayerIDs = newPlayers.map((player)=>{player.id})
    //remove added players from waiting room. 
    //keep ID that is different from every added player id in list
    WaitingRoom = WaitingRoom.filter((ID)=>addedPlayerIDs.every((addedID)=>addedID!=ID))
    currentRound = options.numberInHand[roundNumber]
    */
    players.map(p=>p.userData).forEach(player => {
        player.cards = Deck.pop(min(currentRound,1))
        player.statusColor = color.GameColors.NotReady
        player.cardSelected = undefined;
        player.bid = -1;
        player.handsWon = 0;
        player.handScore = 0;
    });
    //set the person to lead round as current turn
    currentTurn = nextToLeadRound;
    players[currentTurn].emit('playerLeadsRound', true)
    cardTypes.change()
    
    GameStatus = GameModes.BID
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
        color:GameColors.NotReady,
        handsWon:0
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
    if(players.map((player) => player.UserData.statusColor).some((color)=>color != colors.NotReady)){
        players.forEach((player)=>player.userData.statusColor=color.GameColors.NotReady)
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
    comms.message(io.sockets,"THE GAME HAS ENDED",GameColors.Server)
    comms.message(io.sockets,"Scores",GameColors.Server)
    
    players.sort((a,b)=>a.userData.score-b.userData.score)
    players.forEach((player)=>comms.message(io.sockets,player.userData.username + ': ' + player.userData.score))
    players = [];
    AllClients.
    updateUsers()

}