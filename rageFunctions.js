module.exports = {
    CalculateMaximumPlayers:function(cardDescriptions){
        let maxPlayers = 3;
        return maxPlayers;
    },
    addPlayers:function(playerID,currentState){
        let player={
            id:playerID,
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
    PlayedCard:function(desiredCard,cardsArray,ledSuit){
        return {cards:cardsArray,tableCard:desiredCard,LedSuit:ledSuit}
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
