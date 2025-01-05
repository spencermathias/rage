//const { message } = require("allgameplugin");
function PromiseWithResolvers(){
    let resolve, reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return {promise,resolve,reject}
}

count = 0

uuid = 0
module.exports = {
    CalculateMaximumPlayers:function(cardDescriptions,RoundTrickTotals,currentRound){
        let useableCards = (cardDescriptions.NumberCardDescription.maxValue+1)*cardDescriptions.NumberCardDescription.colors.length;
        let maxPlayers = Math.floor((useableCards-1)/Math.max(...RoundTrickTotals.slice(currentRound),1))
        return maxPlayers;
    },
    addPlayers:function(playerID){
        let player={
            id:playerID,
            userName:"needNewName"+uuid,
            score:0,
            bid:undefined,
            state:'NotReady',
            cards:[]
        }
        return player
    },
    createDeck:function(cardDescriptions){
        let DeckArray = []
        if(cardDescriptions.NumberCardDescription != undefined){
            let numberCards = [...Array(cardDescriptions.NumberCardDescription.maxValue+1).keys()];
            numberCards = cardDescriptions.NumberCardDescription.colors.map(
                (color)=>{return numberCards.map(
                    (number)=>{
                        return {
                            color:color,
                            number:number
                        }
                    }
                )}
            )
            DeckArray = numberCards.flat(1)
        }
        if(cardDescriptions.Word != undefined){
            DeckArray.push(...cardDescriptions.Word.map(
                (WordCard)=>{return Array(WordCard.quantity).fill(
                    {
                        name:WordCard.Name
                    }
                )}
            ).flat())
        }
        //shuffle
        n=5
        while(n){
            let m = DeckArray.length;
            while(m){
                i = Math.floor(Math.random() * m--);
                [DeckArray[m],DeckArray[i]]=[DeckArray[i],DeckArray[m]]
            }
            n--
        }
        return DeckArray
    },
    addWaitingPlayers:function(waitingPlayers = [],maxPlayers){
        return waitingPlayers
    },
    dealCards:function(DeckArray,NumberOfPlayers,numberCards){
        let handsArray=Array(NumberOfPlayers).fill(1).map((player)=>DeckArray.splice(0,numberCards))
        return handsArray
    },
    UpdateDealerIndex:function(CurrentDealer,NumberOfPlayers){
        let NextDealerIndex = CurrentDealer++
        return NextDealerIndex % NumberOfPlayers
    },
    PlayedCard:function(desiredCard,playerCardArray,ledSuit){
        return new Promise((resolve, reject) => {
            if(ledSuit == undefined){
                resolve({
                    cards:playerCardArray.filter((card)=> card != desiredCard),
                    tableCard:desiredCard,
                    ledSuit:desiredCard.color
                })
            }else if(ledSuit == desiredCard.color){
                resolve({
                    cards:playerCardArray.filter((card)=> card != desiredCard),
                    tableCard:desiredCard,
                    ledSuit:ledSuit
                })
            }else if(playerCardArray.every((card)=> card.color != ledSuit)){
                resolve({
                    cards:playerCardArray.filter((card)=> card != desiredCard),
                    tableCard:desiredCard,
                    ledSuit:ledSuit
                })
            }else{
                reject({
                    message:'you must play the color lead',
                    desiredCard:desiredCard,
                    cardArray:playerCardArray,
                    ledSuit:ledSuit
                })
            }
        })
    },
    
    updateCurrentTurn:function(cardsOnTable,currentTurn){
        let nextTurn = currentTurn +1
        return nextTurn
    },
    getTrickWinner:function(cardsOnTable,ledSuit,TrumpSuit){
        //get player who wins trick
        if(TrumpSuit != undefined){
            const trumpOnTable = cardsOnTable
                .map((card,playerIndex) => ({card,playerIndex}))
                .filter(({card})=> card.color == TrumpSuit)
                .sort((a,b)=> a.card.number-b.card.number);
            if(trumpOnTable.length){
                return trumpOnTable.pop().playerIndex
            }
        }
        if(ledSuit != undefined){
            const cardsOfColorLed = cardsOnTable
                .map((card,playerIndex) => ({card,playerIndex}))
                .filter(({card})=> card.color == ledSuit)
            cardsOfColorLed.sort((a,b)=> a.card.number-b.card.number);
            return cardsOfColorLed.pop().playerIndex
        }else{
            return undefined
        }
    },
    tallyScoreFromTrick:function(trickWinner,players,tableCards,numberOfTricksWon,PointsPerTrick){
        let updatedNumberOfTricksWon = numberOfTricksWon;
        if(trickWinner != undefined){
            updatedNumberOfTricksWon[trickWinner] += 1
            let totalScoreChange = tableCards.filter((card)=>card.ScoreChange != undefined).reduce((acc,cur)=>{
                return cur != undefined ? acc + cur.ScoreChange : cur
            },PointsPerTrick)
            players[trickWinner].score+=totalScoreChange
        }
        return updatedNumberOfTricksWon
    },
    //adds bonus to players for making bids only use on global players once per round.
    tallyScoreFromRound:function(numberOfTricksWon,players,BidValues,TricksAvailable){
        return players.forEach((player,i)=>{
            if(player.bid){
                const GotBidValue = BidValues.GotBidValue*(player.bid==TricksAvailable?player.bid:1)
                player.score+=numberOfTricksWon[i]==player.bid?GotBidValue:BidValues.MissedBidValue
            }else{
                player.score+=numberOfTricksWon[i]==player.bid?BidValues.GotZeroBidValue:BidValues.MissedBidValue
            }
        })
    },
    playRound:async function(players,startingPlayerIndex,numberOfTricksWon,roundValues,deckData){
        const playRoundFunctions = this
        let playTrickPromise 
        return new Promise((playNextTrick,doneWithRound)=>{
            roundsLeft = players[0].cards.length
            playTrickPromise = playRoundFunctions.playTrick(players,startingPlayerIndex)
            roundsLeft>0?playNextTrick(players,startingPlayerIndex):doneWithRound(numberOfTricksWon);
        }).then(async function(players){//play next trick function
            const trickStats = await playTrickPromise;
            const winnerID = playRoundFunctions.getTrickWinner(trickStats.tableCards,trickStats.ledSuit,deckData.TrumpSuit);
            const numberOfTricks = playRoundFunctions.tallyScoreFromTrick(winnerID,players,trickStats.tableCards,numberOfTricksWon,roundValues.PointsPerTrick)
            //playTrickPromise = playRoundFunctions.playTrick(players,winnerID)
            return playRoundFunctions.playRound(players,winnerID,numberOfTricks,roundValues,deckData)
        },
        async function(numberOfTricksWon) {//done with round
            playRoundFunctions.tallyScoreFromRound(numberOfTricksWon,players,roundValues.BidValues,roundValues.TricksAvailable)
            return startingPlayerIndex = playRoundFunctions.UpdateDealerIndex(startingPlayerIndex,players.length)
        })
    },
    playTrick:async function(players,startingPlayerIndex) {
        console.log(count++)
        //create array of promises to put all cards and other values associated with the play
        const tablePlays = new Array(players.length).fill().map(function(Null,index){
            output = PromiseWithResolvers()
            this[index].setTablePlay = output.resolve
            return output.promise
        },players)
        // fulfill promise for first player and update last player index
        players[startingPlayerIndex].myTurn= Promise.resolve({index:startingPlayerIndex})
        let lastPlayerIndex = startingPlayerIndex
        // wait for the person before you before fulfilling next persons promise 
        for(i=1;i<players.length;i++){
            const currentIndex = (lastPlayerIndex+1) % players.length
            players[currentIndex].myTurn = tablePlays[lastPlayerIndex].then((prevPlayerData)=>{
                return {ledSuit:prevPlayerData.ledSuit,index:currentIndex}
            });
            lastPlayerIndex = currentIndex
        }
        // create the promise to get the value of the led suit when the round finished
        const ledSuitProm = tablePlays[lastPlayerIndex].then((prevPlayerData)=>{
            return prevPlayerData.ledSuit
        });
        // wait for all players to play
        let ledSuit = undefined;
        const tableCards = await Promise.all(tablePlays).then((arr)=>{
            ledSuit = arr[lastPlayerIndex].ledSuit;
            return arr.map(play=>play.tableCard)})
        return {tableCards:tableCards,ledSuit:ledSuit}
    }
}
