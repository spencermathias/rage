uuid = 0
module.exports = {
    CalculateMaximumPlayers:function(cardDescriptions){
        let maxPlayers = 3;
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
        let DeckArray=[]
        return DeckArray
    },
    addWaitingPlayers:function(waitingPlayers,maxPlayers){
        return waitingPlayers
    },
    dealCards:function(DeckArray,NumberOfPlayers){
        let handsArray=[[1,3],[2,4]]
        return handsArray
    },
    UpdateDealerIndex:function(CurrentDealer,NumberOfPlayers){
        let NextDealerIndex = 0
        return NextDealerIndex
    },
    PlayedCard:function(desiredCard,playerCardArray,ledSuit,resolve){
        if(ledSuit != undefined){
            resolve({
                cards:playerCardArray.filter((card)=> card != desiredCard),
                tableCard:desiredCard,
                LedSuit:desiredCard.suit
            })
        }else if(ledSuit == desiredCard.suit){
            resolve({
                cards:playerCardArray.filter((card)=> card != desiredCard),
                tableCard:desiredCard
            })
        }else if(playerCardArray.every((card)=> card.suit != ledSuit)){
            resolve({
                cards:playerCardArray.filter((card)=> card != desiredCard),
                tableCard:desiredCard
            })
        }
    },
    updateCurrentTurn:function(cardsOnTable,currentTurn){
        let nextTurn = currentTurn +1
        return nextTurn
    },
    TallyScoreFromHand:function(players,tableCards,ledSuit,TrumpSuit,numberOfTricksWon){
        let updatedNumberOfTricksWon = numberOfTricksWon;
        let scoresArray = [];
        return {updatedNumberOfTricksWon, scoresArray, winnerIndex}
    }
}
