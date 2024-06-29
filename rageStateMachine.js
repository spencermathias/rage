const events = require('events');
const rageFunctions = require('./rageFunctions');


const promiseStuff={
    allReady:()=>{}
}


// global variables
//var currentState = {name:"none"};
//var players = [];
var WaitingPlayers = []
const GameParameters = {
    cardDescriptions:{},
    ScoringVariables:{},
    RoundTrickTotals:[10,9,8,7,6,5,4,3,2,1,0],
    MaximumPlayers:9
};

var CurrentRound = 0;
var DealerIndex = 0;

//enumerations
const AvailableStates={
    LOBBY:{
        name:'LOBBY',
        MinimumPlayers:2,
        MaximumPlayers:9,
        initialize:()=>{
            CurrentRound = 0;
            this.MaximumPlayers = rageFunctions.CalculateMaximumPlayers()
            return {
                MaximumPlayers:this.MaximumPlayers,
                MinimumPlayers:this.MinimumPlayers
            }
        },
        resolveAllReady:()=>{},
        updatePlayerReady:function(players,playerID,isReady){
            let playerIndex = players.findIndex((player)=>player.id == playerID)
            if(playerIndex!=-1){
                players[playerIndex].state = isReady?"Ready":"NotReady";
            }
            let numberOfReadyPlayers = players.filter((player)=>player.state == "Ready").length
            if(players.length >= this.MinimumPlayers && (players.length == numberOfReadyPlayers || numberOfReadyPlayers == GameParameters.MaximumPlayers )){
                this.resolveAllReady(numberOfReadyPlayers)
            }
        },
    },
    DEAL:{
        name:'DEAL',
        deck:[],
        initialize:(players)=>{
            if(CurrentRound<GameParameters.RoundTrickTotals.length){
                this.deck = rageFunctions.createDeck(GameParameters.cardDescriptions);
                players.push(...rageFunctions.addWaitingPlayers(WaitingPlayers,GameParameters.MaximumPlayers));
                let dealtHands = rageFunctions.dealCards(this.deck,players.length)
                players.map((player,i)=>{player.cards.splice(0,Infinity,...dealtHands[i])})
                CurrentRound++
            }else{
                eventEmitter.emit('changeStateTo','END');
            }
        }
    },
    BID:{
        name:'BID',
        initialize:(players)=>{
            players.map((player)=>(Object.assign(player,{bid:undefined})));
            DealerIndex = rageFunctions.UpdateDealerIndex(DealerIndex,players.length);
        },
        resolveAllBid:()=>{},
        updateBid:(players,playerID,bidAmount)=>{
            let playerIndex = players.findIndex((player)=>player.id == playerID)
            if(playerIndex!=-1){
                players[playerIndex].bid = bidAmount;
            }
            if(players.every((player)=>player.bid != undefined)){
                this.resolveAllBid(players.reduce((total,player)=>total+player.bid));
            }
        }
    },
    PLAY:{
        name:'PLAY',
        CurrentTurn:0,
        tableCards:[],
        ledSuit:undefined,
        numberOfTricksWon:[],
        initialize:function(dealer,players){
            this.CurrentTurn = rageFunctions.updateCurrentTurn(this.tableCards,dealer) 
            this.tableCards = new Array(players.length)
            this.numberOfTricksWon = new Array(players.length).fill(0)
        },
        // selectedCard:function(card,player){
        //     let PlayInfo = rageFunctions.PlayedCard(card,player,this.ledSuit)
        //     player.cards = PlayInfo.cards;
        //     this.tableCards[this.CurrentTurn] = PlayInfo.tableCard;
        //     this.ledSuit = PlayInfo.LedSuit;
        //     if(this.tableCards.some((card)=>card==undefined)){
        //         if(PlayInfo.tableCard != undefined){
        //             this.CurrentTurn = rageFunctions.updateCurrentTurn(this.tableCards,this.CurrentTurn);
        //         }
        //     }else{
        //         let scoreInfo = rageFunctions.TallyScoreFromHand(players,this.tableCards,this.ledSuit,trumpSuit,this.numberOfTricksWon,GameParameters.ScoringVariables);
        //         players.map((scoringPlayer, i)=>(Object.assign(scoringPlayer,{score:scoreInfo.scoresArray[i]})));
        //         this.numberOfTricksWon = scoreInfo.updatedNumberOfTricksWon;
        //         if(player.cards.length != 0){
        //             this.CurrentTurn = scoreInfo.winnerIndex-1;
        //         }else{
        //             eventEmitter.emit('changeStateTo','DEAL');
        //         }
        //     }
        //}
    },
    END:{
        name:'END',
        initialize:(players)=>{
            let scoreTable = rageFunctions.ShowScores(players)
            console.table(scoreTable)
        }
    },

};



//Create an event handler:
var changeState = function (value,data) {
    if(value in AvailableStates){
        currentState = AvailableStates[value]
        if('initialize' in currentState){
            currentState.initialize(data)
        }
    }else{
        console.log(value,' is not a valid state')
    }    
}



//set the State to Lobby
eventEmitter.emit('changeStateTo','LOBBY');
var t = 0


if(process.argv[2] === "test" || process.env.NODE_ENV === "test"){
    console.log(' this is a test')
    exports.GameParameters = GameParameters
}

// Using async/await
const delay = ms => new Promise(res => setTimeout(res, ms));


class machine{
    constructor(){
        this.currentState = AvailableStates.LOBBY
        this.currentState.initialize()
        this.playerBounds = {}
        this.DealerIndex = 0
        this.done = false
        this.players = []
        this.WaitingPlayers = []
        this.roundVariables = {}
        this.eventEmitter = new events.EventEmitter();
        //Assign the event handler to an event:
        this.eventEmitter.on('changeStateTo', changeState);
    }
    addPlayer(name) {
        if(currentState.name == 'LOBBY'){
            this.players.push(rageFunctions.addPlayers(name))
        }else{
            this.WaitingPlayers.push(rageFunctions.addPlayers(name))
        }
    }
    sortPlayers(players){
        let ReadyPlayers = players.filter((player)=>player.state=="Ready")
        let NotReadyPlayers = players.filter((player)=>player.state=="NotReady")
        this.players = ReadyPlayers;
        this.WaitingPlayers = NotReadyPlayers;
    }
    async main(){
        this.currentState = AvailableStates.LOBBY;
        this.playerBounds = this.currentState.initialize();
        this.allReady = new Promise((resolve, reject) => {
            this.currentState.resolveAllReady=resolve;
        });
        const numberOfReadyPlayers = await this.allReady
        this.sortPlayers(this.players)
        this.DealerIndex = Math.floor(Math.random()*numberOfReadyPlayers);
        const i=0
        //start loop
        while(i<GameParameters.RoundTrickTotals.length || this.done == true){
            //do deal state
            this.currentState = AvailableStates.DEAL
            this.currentState.initialize(this.players)
            //bid state
            this.currentState = AvailableStates.BID
            this.currentState.initialize(this.players)
            this.allBid = new Promise((resolve, reject) => {
                this.currentState.resolveAllBid = resolve;
            })
            const bidDone = await this.allBid
            console.log(bidDone);
            //play state
            this.currentState = AvailableStates.PLAY
            this.currentState.initialize(this.players)
            this.roundDone = new Promise((resolve,reject)=>{
                this.currentState.resolveAllPlayed = resolve;
            })
            const playDone = await this.roundDone
            i+=1
        }
        this.currentState = AvailableStates.END
        this.currentState.initialize(players)
        if(this.close = false){
            setTimeout(main(),5000)
        }else{
            setTimeout(console.log("game loop is broken and thread will finish"),500)
        }
    }
    async TrickPlay(LeadPlayerIndex){
        //this.roundVariables.tableCards = new Array(this.players.length)
        let tableCards = new Array(this.players.length)
        let currentTurn = LeadPlayerIndex
        let playResults = tableCards.map((result)=>{
            let resolve
            let promise = new Promise((res,rej)=>{
                resolve = res
            })
            return {p:promise,r:resolve}
        })
        
    }
//    async RoundPlay(LeadPlayerIndex){
//        let tableCards = Array(players.length)
//        for(tableCards.some((card)=>card==undefined)){
//            await tableCards[currentTurn] = this.getPlayerCard(currentTurn)
//            currentTurn = rageFunctions.updateCurrentTurn(tableCards,currentTurn)
//        }
//        return tableCards
//    }

//    async getPlayerCard(currentTurn){
//        return Promise.resolve()
//    }
}


exports.currentState = this.currentState
exports.StateChanger = promiseStuff
exports.machine = machine
/*
console.log("before main")
main();

console.log("after main")
currentState.resolver(7)
console.log("After promise done")

players.push({cards:[1,2,3],bid:7})
players.push({cards:[1,2,3]})
//set the State to Lobby
eventEmitter.emit('changeStateTo','BID');
console.table(players)
*/