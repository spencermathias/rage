
const rageFunctions = require('../rageFunctions.js')
//const { expect } = require('chai');
const assert = require('assert')

const util = require('util')
const sinon = require('sinon');

function waitForTime(time) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('Waited for 2 seconds');
        }, time);
    });
}
  

describe('rageFunctions file testing',function(){
    describe('CalculateMaxPlayers tests',function(){
        it('should give 9 for the standard game',()=>{
            let maxPlayers = rageFunctions.CalculateMaximumPlayers({NumberCardDescription:{maxValue:15,colors:['red','green','blue','orange','purple','yellow']}},[10,9,8,7,6,5,4,3,2,1,0],0);
            assert.equal(maxPlayers,9)
        });
        it('should return the total number of cards less one when only one card dealt',()=>{
            let maxPlayers = rageFunctions.CalculateMaximumPlayers({NumberCardDescription:{maxValue:15,colors:['red','green','blue','orange','purple','yellow']}},[1],0);
            assert.equal(maxPlayers,16*6-1)
        })
        it('should return the same when the number of cards is 0',()=>{
            let maxPlayers = rageFunctions.CalculateMaximumPlayers({NumberCardDescription:{maxValue:15,colors:['red','green','blue','orange','purple','yellow']}},[0],0);
            assert.equal(maxPlayers,16*6-1)
        })
        it('should ignore rounds that have already been played',()=>{
            let maxPlayers = rageFunctions.CalculateMaximumPlayers({NumberCardDescription:{maxValue:15,colors:['red','green','blue','orange','purple','yellow']}},[100,1],1);
            assert.equal(maxPlayers,16*6-1)
        })
        it('should return 0 when there are more cards in the round the deck',()=>{
            let maxPlayers = rageFunctions.CalculateMaximumPlayers({NumberCardDescription:{maxValue:15,colors:['red','green','blue','orange','purple','yellow']}},[100,1],0);
            assert.equal(maxPlayers,0)
        })
        //todo add wild card to count
        it.skip('should include wild cards as valid cards',()=>{
            let maxPlayers = rageFunctions.CalculateMaximumPlayers(
                {
                    NumberCardDescription:{
                        maxValue:15,
                        colors:['red','green','blue','orange','purple','yellow']
                    },
                    Word:[
                        {Name:"wild",quantity:6},
                        {Name:"out",quantity:6}
                    ]
                },
                [1],
                0
            );
            assert.equal(maxPlayers,16*6-1+6)
        })
        //if needed throw errors for cases that don't make sense log answers if no error is thrown
        it.skip('should create an error when the round number is the same as the last round',()=>{
            assert.throws(rageFunctions.CalculateMaximumPlayers({NumberCardDescription:{maxValue:15,colors:['red','green','blue','orange','purple','yellow']}},[10],5))
        })
        it('display the values for conditions that should never be executed',()=>{
            console.log('CalculateMaximumPlayers returns this value when the number of cards in round is negative:')
            console.log(rageFunctions.CalculateMaximumPlayers({NumberCardDescription:{maxValue:15,colors:['red','green','blue','orange','purple','yellow']}},[-10],0))
            console.log('CalculateMaximumPlayers returns this value when the round number is the same as the last round:')
            console.log(rageFunctions.CalculateMaximumPlayers({NumberCardDescription:{maxValue:15,colors:['red','green','blue','orange','purple','yellow']}},[10],5))
            console.log('CalculateMaximumPlayers returns this value when the number of rounds played is negative:')
            console.log(rageFunctions.CalculateMaximumPlayers({NumberCardDescription:{maxValue:15,colors:['red','green','blue','orange','purple','yellow']}},[10,9,8,7,6,5,4,3,2,1,0],-3))

        })
    });
    describe('createDeck tests',function(){
        describe("create number cars",function(){
            it('should make a card for each color',()=>{
                let deck = rageFunctions.createDeck({
                    NumberCardDescription:{
                        maxValue:0,
                        colors:['red','green','blue','orange','purple','yellow']
                    }
                })
                assert.equal(6,deck.length)
                assert.equal(deck.filter((card)=>card.color == 'red').length,1,'more or less cards than one that are red');
                assert.equal(deck.filter((card)=>card.color == 'green').length,1,'more or less cards than one that are green');
                assert.equal(deck.filter((card)=>card.color == 'blue').length,1,'more or less cards than one that are blue');
                assert.equal(deck.filter((card)=>card.color == 'purple').length,1,'more or less cards than one that are purple');
                assert.equal(deck.filter((card)=>card.color == 'yellow').length,1,'more or less cards than one that are yellow');
                assert.equal(deck.filter((card)=>card.color == 'orange').length,1,'more or less cards than one that are orange');
            })
            it('should make a card for each number',()=>{
                let deck = rageFunctions.createDeck({
                    NumberCardDescription:{
                        maxValue:5,
                        colors:['red']
                    }
                })
                assert.equal(6,deck.length)
                assert.equal(deck.filter((card)=>card.number == 0).length,1,'more or less cards than one that are 0');
                assert.equal(deck.filter((card)=>card.number == 1).length,1,'more or less cards than one that are 1');
                assert.equal(deck.filter((card)=>card.number == 2).length,1,'more or less cards than one that are 2');
                assert.equal(deck.filter((card)=>card.number == 3).length,1,'more or less cards than one that are 3');
                assert.equal(deck.filter((card)=>card.number == 4).length,1,'more or less cards than one that are 4');
                assert.equal(deck.filter((card)=>card.number == 5).length,1,'more or less cards than one that are 5');
            })
            it('should make a card for each number and color combo',()=>{
                let deck = rageFunctions.createDeck({
                    NumberCardDescription:{
                        maxValue:5,
                        colors:['red','green','blue','orange','purple','yellow']
                    }
                })
                assert.equal(36,deck.length)
                assert.equal(deck.filter((card)=>card.number == 0).length,6,'more or less cards than 6 that are 0');
                assert.equal(deck.filter((card)=>card.number == 1).length,6,'more or less cards than 6 that are 1');
                assert.equal(deck.filter((card)=>card.number == 2).length,6,'more or less cards than 6 that are 2');
                assert.equal(deck.filter((card)=>card.number == 3).length,6,'more or less cards than 6 that are 3');
                assert.equal(deck.filter((card)=>card.number == 4).length,6,'more or less cards than 6 that are 4');
                assert.equal(deck.filter((card)=>card.number == 5).length,6,'more or less cards than 6 that are 5');
                assert.equal(deck.filter((card)=>card.number == 5 && card.color == 'red').length,1,'more or less cards than 1 that are red 5s');
            })
        })
        describe('create word cards',function(){
            it('creates the quantity listed in object',()=>{
                let deck = rageFunctions.createDeck({
                    Word:[
                        {Name:"out",quantity:6}
                    ]
                })
                assert.equal(deck.length,6)
                assert.equal(deck.pop().name,"out")
            })
            it('creates word card for each structure given',()=>{
                let deck = rageFunctions.createDeck({
                    Word:[
                        {Name:"out",quantity:1},
                        {Name:"change",quantity:1},
                        {Name:"bonus",quantity:1},
                        {Name:"mad",quantity:1},
                        {Name:"wild",quantity:1}
                    ]
                })
                assert.equal(deck.length,5)
                assert.equal(deck.filter((card)=>card.name == 'out').length,1,'more or less cards than 1 that are out');
                assert.equal(deck.filter((card)=>card.name == 'change').length,1,'more or less cards than 1 that are change');
                assert.equal(deck.filter((card)=>card.name == 'mad').length,1,'more or less cards than 1 that are mad');
                assert.equal(deck.filter((card)=>card.name == 'bonus').length,1,'more or less cards than 1 that are bonus');
                assert.equal(deck.filter((card)=>card.name == 'wild').length,1,'more or less cards than 1 that are wild');
            })
            it('creates card for both words and numbers',()=>{
                let deck = rageFunctions.createDeck({
                    NumberCardDescription:{
                        maxValue:5,
                        colors:['red','green','blue','orange','purple','yellow']
                    },
                    Word:[
                        
                        {Name:"wild",quantity:6},
                        {Name:"out",quantity:6}
                    ]
                })
                assert.equal(deck.length, 48)
            })
            it('creates deck in different order each time',()=>{
                let description = {
                    NumberCardDescription:{
                        maxValue:5,
                        colors:['red']
                    }
                }
                let deck = rageFunctions.createDeck(description)
                let deck1 = rageFunctions.createDeck(description)
                assert.notEqual(deck.map((card)=>card.number), deck1.map((card)=>card.number))
            })
        })
    });
    describe('DealCards function tests',function(){
        it('deals one hand for one player',()=>{
            let deck = rageFunctions.createDeck({
                NumberCardDescription:{
                    maxValue:5,
                    colors:['red','green','blue','orange','purple','yellow']
                }
            })
            let deckSize = deck.length
            let hands = rageFunctions.dealCards(deck,1,5)
            assert.equal(hands.length,1,'other than one hand created')
            let firstHand = hands.pop()
            assert.equal(deck.length + firstHand.length, deckSize,'cards not conserved during deal')
            assert.equal(firstHand.length,5,'does not have 5 cards in hand')
            let firstCard = firstHand.pop()
            assert.equal(deck.filter((card)=>card.number == firstCard.number && card.color == firstCard.color).length,0,'duplicate card in deck');
        })
        it('deals one card for each player',()=>{
            let deck = rageFunctions.createDeck({
                NumberCardDescription:{
                    maxValue:5,
                    colors:['red','green','blue','orange','purple','yellow']
                }
            })
            let deckSize = deck.length
            let hands = rageFunctions.dealCards(deck,5,1)
            assert.equal(hands.length,5,'other than five hands created')
            let firstHand = hands.pop()
            assert.equal(deck.length + firstHand.length*5, deckSize,'cards not conserved during deal')
            assert.equal(firstHand.length,1,'does not have 1 card in hand')
            let firstCard = firstHand.pop()
            assert.equal(deck.filter((card)=>card.number == firstCard.number && card.color == firstCard.color).length,0,'duplicate card in deck');
        })
        it('deals out more than one card per person',()=>{
            let deck = rageFunctions.createDeck({
                NumberCardDescription:{
                    maxValue:5,
                    colors:['red','green','blue','orange','purple','yellow']
                }
            })
            let deckSize = deck.length
            let hands = rageFunctions.dealCards(deck,5,6)
            assert.equal(hands.length,5,'other than five hands created')
            let firstHand = hands.pop()
            assert.equal(deck.length + firstHand.length*5, deckSize,'cards not conserved during deal')
            assert.equal(firstHand.length,6,'does not have 6 cards in hand')
            let firstCard = firstHand.pop()
            assert.equal(deck.filter((card)=>card.number == firstCard.number && card.color == firstCard.color).length,0,'duplicate card in deck');

        })
        it('emits warning if there are not enough cards in deck')
    });
    describe('GetTrickWinner tests',function(){
        it('should return undefined if no one wins the trick',()=>{
            assert.equal(rageFunctions.getTrickWinner([],undefined,undefined),undefined)
        })
        it('should return the player whose card is the only one that matches the led suit',()=>{
            assert.equal(rageFunctions.getTrickWinner([{color:'red',number:0}],'red',undefined),0)
            assert.equal(rageFunctions.getTrickWinner([{color:'red',number:0},{color:'green',number:0},{color:'blue',number:0}],'red',undefined),0)
            assert.equal(rageFunctions.getTrickWinner([{color:'green',number:0},{color:'blue',number:0},{color:'red',number:0}],'red',undefined),2)
            assert.equal(rageFunctions.getTrickWinner([{color:'green',number:0},{color:'red',number:0},{color:'blue',number:0}],'red',undefined),1)
        })
        it("should return the player who's card is trump",()=>{
            assert.equal(rageFunctions.getTrickWinner([{color:'green',number:0},{color:'red',number:0},{color:'blue',number:0}],'red','green'),0,'first')
            assert.equal(rageFunctions.getTrickWinner([{color:'green',number:0},{color:'red',number:0},{color:'blue',number:0}],'green','green'),0,'second')
        })
        it('should return the largest card of the suit led when no trump is played',()=>{
            assert.equal(rageFunctions.getTrickWinner([{color:'red',number:0},{color:'red',number:1},{color:'red',number:2}],'red',undefined),2)
            assert.equal(rageFunctions.getTrickWinner([{color:'red',number:0},{color:'red',number:10},{color:'red',number:2}],'red',undefined),1)
            assert.equal(rageFunctions.getTrickWinner([{color:'red',number:0},{color:'blue',number:10},{color:'red',number:2}],'red',undefined),2)
        })
        it('should return the player who played trump even if the do not play the largest number',()=>{
            assert.equal(rageFunctions.getTrickWinner([{color:'red',number:0},{color:'blue',number:10},{color:'blue',number:2}],'blue','red'),0)
        })
    });
    describe('tallyScoreFromTrick tests',function(){
        it("should return tricks won array unchanged when no one wins the trick",()=>{
            assert.deepStrictEqual(rageFunctions.tallyScoreFromTrick(undefined,[{score:0}],[{number:0}],[0],0),[0])
            assert.deepStrictEqual(rageFunctions.tallyScoreFromTrick(undefined,[{score:0}],[{ScoreChange:5}],[0],0),[0])
            assert.deepStrictEqual(rageFunctions.tallyScoreFromTrick(undefined,[{score:0}],[{ScoreChange:5},{ScoreChange:-4}],[0],0),[0])
            assert.deepStrictEqual(rageFunctions.tallyScoreFromTrick(undefined,[{score:0}],[{ScoreChange:5},{ScoreChange:-4}],[0],1),[0])
        })
        it("should return updated scores for player who won",()=>{
            let players = [{score:0}]
            assert.deepStrictEqual(rageFunctions.tallyScoreFromTrick(0,players,[{number:0}],[0],1),[1])
            assert.deepStrictEqual(players,[{score:1}])
            assert.deepStrictEqual(rageFunctions.tallyScoreFromTrick(0,players,[{ScoreChange:5}],[0],1),[1])
            assert.deepStrictEqual(players,[{score:7}])
            assert.deepStrictEqual(rageFunctions.tallyScoreFromTrick(0,players,[{ScoreChange:5},{ScoreChange:-4}],[0],1),[1])
            assert.deepStrictEqual(players,[{score:9}])
            players.push({score:0})
            assert.deepStrictEqual(rageFunctions.tallyScoreFromTrick(1,players,[{out:0},{ScoreChange:-5}],[0,0],1),[0,1])
            assert.deepStrictEqual(players,[{score:9},{score:-4}])
        })
    })
    describe("tallyScoreFromRound tests",function(){
        it("should give bonus to those that have their bid",()=>{
            let players = [{score:0,bid:3}]
            rageFunctions.tallyScoreFromRound([3],players,{GotZeroBidValue:10,GotBidValue:10,MissedBidValue:-5},5)
            assert.deepStrictEqual(players,[{score:10,bid:3}],'one player failed')
            players.push({score:0,bid:2})
            rageFunctions.tallyScoreFromRound([3,2],players,{GotZeroBidValue:10,GotBidValue:10,MissedBidValue:-5},5)
            assert.deepStrictEqual(players,[{score:20,bid:3},{score:10,bid:2}],'second player failed')
        })
        it("should give penalty to those who do not make bid",()=>{
            let players = [{score:0,bid:3}]
            rageFunctions.tallyScoreFromRound([2],players,{GotZeroBidValue:10,GotBidValue:10,MissedBidValue:-5},5)
            assert.notDeepStrictEqual(players,[{score:10,bid:3}],'one player failed')
            players.push({score:0,bid:2})
            rageFunctions.tallyScoreFromRound([2,3],players,{GotZeroBidValue:10,GotBidValue:10,MissedBidValue:-5},5)
            assert.notDeepStrictEqual(players,[{score:20,bid:3},{score:10,bid:2}],'second player failed')
        })
        it('should not give bonus to players who bid 0 when got zero bid value is 0',()=>{
            let players = [{score:0,bid:0}]
            rageFunctions.tallyScoreFromRound([0],players,{GotZeroBidValue:0,GotBidValue:10,MissedBidValue:-5},5)
            assert.deepStrictEqual(players,[{score:0,bid:0}],'one player failed')
            players.push({score:0,bid:0})
            rageFunctions.tallyScoreFromRound([0,0],players,{GotZeroBidValue:0,GotBidValue:10,MissedBidValue:-5},5)
            assert.deepStrictEqual(players,[{score:0,bid:0},{score:0,bid:0}],'second player failed')
        })
        it("should give bonus for bid in all and getting all",()=>{
            players = [{score:0,bid:3}]
            rageFunctions.tallyScoreFromRound([3],players,{GotZeroBidValue:0,GotBidValue:10,MissedBidValue:-5},3)
            assert.deepStrictEqual(players,[{score:30,bid:3}],'first one failed')
            players.push({score:0,bid:9})
            players[0].bid=9;
            rageFunctions.tallyScoreFromRound([0,9],players,{GotZeroBidValue:0,GotBidValue:10,MissedBidValue:-5},9)
            assert.deepStrictEqual(players,[{score:25,bid:9},{score:90,bid:9}],'second player failed')
        })
        it("should work for a mix of getting and missing",()=>{
            let players = [{score:0,bid:3},{score:0,bid:0},{score:0,bid:5},{score:0,bid:2}]
            rageFunctions.tallyScoreFromRound([0,2,1,2],players,{GotZeroBidValue:0,GotBidValue:10,MissedBidValue:-5},5)
            assert.deepStrictEqual(players,[{score:-5,bid:3},{score:-5,bid:0},{score:-5,bid:5},{score:10,bid:2}],'one player failed')
            players = [{score:0,bid:3},{score:0,bid:0},{score:0,bid:5},{score:0,bid:2}]
            rageFunctions.tallyScoreFromRound([0,0,5,0],players,{GotZeroBidValue:0,GotBidValue:10,MissedBidValue:-5},5)
            assert.deepStrictEqual(players,[{score:-5,bid:3},{score:0,bid:0},{score:50,bid:5},{score:-5,bid:2}],'second player failed')    
        })
    })
    describe('playCard tests',function(){
        it("should return the resolved promise for the card played",()=>{
            rageFunctions.PlayedCard({number:2,color:'red'},[{number:2,color:'red'},{number:2,color:'green'},{number:12,color:'red'}],'red').then((data)=>{
                assert.deepStrictEqual(data.tableCard,{number:2,color:'red'})
                assert.equal(data.ledSuit,'red')
                assert.deepStrictEqual(data.cards,[{number:2,color:'green'},{number:12,color:'red'}])
            })
        })
        it('should not change the led suit if led suit is already played',()=>{
            rageFunctions.PlayedCard({number:2,color:'red'},[{number:2,color:'red'},{number:2,color:'green'},{number:12,color:'red'}],'blue').then((data)=>{
                assert.deepStrictEqual(data.tableCard,{number:2,color:'red'})
                assert.equal(data.ledSuit,'blue')
                assert.deepStrictEqual(data.cards,[{number:2,color:'green'},{number:12,color:'red'}])
            })
        })
        it('should change the led suit if led suit is undefined',()=>{
            rageFunctions.PlayedCard({number:2,color:'red'},[{number:2,color:'red'},{number:2,color:'green'},{number:12,color:'red'}],undefined).then((data)=>{
                assert.deepStrictEqual(data.tableCard,{number:2,color:'red'})
                assert.equal(data.ledSuit,'blue')
                assert.deepStrictEqual(data.cards,[{number:2,color:'green'},{number:12,color:'red'}])
            })
        })
        it('should give error message if desired card suit does not match led suit but one is in hand',()=>{
            rageFunctions.PlayedCard({number:2,color:'red'},[{number:2,color:'red'},{number:2,color:'green'},{number:12,color:'red'}],'green').then((data)=>{
                assert.deepStrictEqual(data.tableCard,{number:2,color:'red'})
                assert.equal(data.ledSuit,'blue')
                assert.deepStrictEqual(data.cards,[{number:2,color:'green'},{number:12,color:'red'}])
            })
        })
    })
    describe('playTrick tests',async ()=>{
        let close={}
        let pendingPromise = new Promise((resolve, reject) => {
            close = resolve
        })
        let players = [{name:"a"},{name:"b"},{name:"c"}]
        let playOrder = 0
        let finishedTableData = rageFunctions.playTrick(players,1)
        console.log(finishedTableData)
        it('returns tableCards array1',async ()=>{
            players[1].myTurn.then(function(){playOrder++})
            turn1 = await players[1].myTurn
            assert(util.inspect(players[0].myTurn).includes("pending"))
            assert(util.inspect(players[2].myTurn).includes("pending"))
            assert.equal(turn1.ledSuit,undefined)
            assert.equal(turn1.index,1)
            assert.equal(playOrder,1)
            let playedCard = rageFunctions.PlayedCard({number:2},[{number:2,color:'red'},{number:2,color:'green'},{number:12,color:'red'}],undefined)
            players[1].setTablePlay(playedCard)
            //assert.deepStrictEqual(finishedTableData.tableCards,[{number:1},{number:2},{number:3}])
        })
        it('returns tableCards array2',async ()=>{
            players[2].myTurn.then(function(){playOrder++})
            turn1 = await players[2].myTurn
            assert(util.inspect(players[0].myTurn).includes("pending"))
            assert.equal(turn1.ledSuit,undefined)
            assert.equal(turn1.index,2)
            assert.equal(playOrder,2)
            let playedCard = rageFunctions.PlayedCard({number:2,color:'red'},[{number:2,color:'red'},{number:2,color:'green'},{number:12,color:'red'}],undefined)
            players[2].setTablePlay(playedCard)
            //assert.deepStrictEqual(finishedTableData.tableCards,[{number:1},{number:2},{number:3}])
        })
        it('returns tableCards array3',async ()=>{
            players[0].myTurn.then(function(){playOrder++})
            turn1 = await players[0].myTurn
            assert.equal(turn1.ledSuit,'red')
            assert.equal(turn1.index,0)
            assert.equal(playOrder,3)
            let playedCard = rageFunctions.PlayedCard({number:12,color:'red'},[{number:2,color:'red'},{number:2,color:'green'},{number:12,color:'red'}],'red')
            players[0].setTablePlay(playedCard)
            //assert.deepStrictEqual(finishedTableData.tableCards,[{number:1},{number:2},{number:3}])
        })
        it('should return all table data as expected',async ()=>{
            console.log(finishedTableData)
            tableData = await finishedTableData
            console.log(tableData.tableCards)
            assert.equal(tableData.ledSuit,'red')
            assert.deepStrictEqual(tableData.tableCards,[{number:12,color:'red'},{number:2},{number:2,color:'red'}])
        })
        close()
    })
    describe('playTrick out of order',async ()=>{
        let close={}
        let pendingPromise = new Promise((resolve, reject) => {
            close = resolve
        })
        let players = [{name:"a"},{name:"b"},{name:"c"},{name:"d"}]
        let playOrder = 0
        let finishedTableData1 = rageFunctions.playTrick(players,2)
        console.log(finishedTableData1)
        it('ooo returns tableCards array1',async ()=>{
            players[2].myTurn.then(function(){playOrder++})
            turn1 = await players[2].myTurn
            assert(util.inspect(players[0].myTurn).includes("pending"))
            assert(util.inspect(players[3].myTurn).includes("pending"))
            assert.equal(turn1.ledSuit,undefined)
            assert.equal(turn1.index,2)
            assert.equal(playOrder,1)
            let playedCard = rageFunctions.PlayedCard({number:2},[{number:2,color:'red'},{number:2,color:'green'},{number:12,color:'red'}],undefined)
            //players[0].setTablePlay(playedCard)
            await waitForTime(100)
            players[2].setTablePlay(playedCard)
            //assert.deepStrictEqual(finishedTableData.tableCards,[{number:1},{number:2},{number:3}])
        })
        it('ooo returns tableCards array2',async ()=>{
            players[3].myTurn.then(async function(){
                playOrder++
            })
            turn1 = await players[3].myTurn
            await waitForTime(100)
            assert(util.inspect(players[0].myTurn).includes("pending"))
            assert.equal(turn1.ledSuit,undefined)
            assert.equal(turn1.index,3)
            assert.equal(playOrder,2)
            let playedCard = rageFunctions.PlayedCard({number:2,color:'red'},[{number:2,color:'red'},{number:2,color:'green'},{number:12,color:'red'}],undefined)
            players[3].setTablePlay(playedCard)
            //assert.deepStrictEqual(finishedTableData.tableCards,[{number:1},{number:2},{number:3}])
        })
        it('ooo returns tableCards array3',async ()=>{
            players[0].myTurn.then(async function(){
                playOrder++
            })
            turn1 = await players[0].myTurn
            await waitForTime(100)
            assert.equal(turn1.ledSuit,'red')
            assert.equal(turn1.index,0)
            assert.equal(playOrder,3)
            let playedCard = rageFunctions.PlayedCard({number:12,color:'red'},[{number:2,color:'red'},{number:2,color:'green'},{number:12,color:'red'}],'red')
            players[0].setTablePlay(playedCard)
            //assert.deepStrictEqual(finishedTableData.tableCards,[{number:1},{number:2},{number:3}])
        })
        it('ooo returns tableCards array4',async ()=>{
            players[1].myTurn.then(async function(){
                playOrder++
            })
            turn1 = await players[1].myTurn
            await waitForTime(100)
            assert.equal(turn1.ledSuit,'red')
            assert.equal(turn1.index,1)
            assert.equal(playOrder,4)
            let playedCard = rageFunctions.PlayedCard({number:2,color:'red'},[{number:2,color:'red'},{number:2,color:'green'},{number:12,color:'red'}],'red')
            players[1].setTablePlay(playedCard)
            //assert.deepStrictEqual(finishedTableData.tableCards,[{number:1},{number:2},{number:3}])
        })
        it('should have player 1 as resolved',async ()=>{
            tableData = await finishedTableData1
            console.log(tableData.tableCards)
            assert.equal(tableData.ledSuit,'red')
            assert.deepStrictEqual(tableData.tableCards,[{number:12,color:'red'},{number:2,color:'red'},{number:2},{number:2,color:'red'}])
        })
        close()
    })
    describe.skip('playTrick player leaves',async ()=>{})
    
    describe('rageFunctions.playRound tests', function() {
        it('should play a round and return the correct number of tricks won', async function() {
            let players = [
                { cards: [{ number: 0, color: 'red' }, { number: 2, color: 'green' }, { number: 12, color: 'red' }], score: 0, bid: 1 },
                { cards: [{ number: 3, color: 'red' }, { number: 4, color: 'green' }, { number: 5, color: 'red' }], score: 0, bid: 3 },
                { cards: [{ number: 6, color: 'red' }, { number: 7, color: 'green' }, { number: 8, color: 'red' }], score: 0, bid: 1 },
            ];
            let numberOfTricksWon = Array(players.length).fill(0);
            let roundValues = { tricksAvailable: 3, BidValues:{MissedBidValue: -5, GotBidValue: 10, GotZeroBidValue: 5 },PointsPerTrick: 1};
            let deckData = { TrumpSuit: "green" };
    
            
            function removeCards( players) {
                    var firstCard = players[0].cards.pop();
                    return Promise.resolve({
                        tableCards: [
                            firstCard,
                            { number: 1, color: 'red' },
                            { number: 2, color: 'red' }
                        ],
                        ledSuit: 'red'
                    });
            };

            // Stub the playTrick function
            const playTrickStub = sinon.stub(rageFunctions, 'playTrick');

            // Simulate playing tricks
            playTrickStub.callsFake(removeCards)
            // playTrickStub.onCall(0).returns(new Promise((resolve, reject) => {
            //     console.log(players[0].cards.pop());
            //     resolve({ tableCards: [ 
            //             { number: 12, color: 'green' },
            //             { number: 4, color: 'green' }, 
            //             { number: 7, color: 'green' }
            //         ], ledSuit: 'green' }
            //     )
            // }));
            // playTrickStub.returns(Promise.resolve({ tableCards: [
            //     { number: 1, color: 'red' },
            //     { number: 8, color: 'red' }, 
            //     { number: 2, color: 'red' }
            // ], ledSuit: 'red' }));
            
            let roundDetails = rageFunctions.playRound(players, 1, numberOfTricksWon, roundValues, deckData);
            let roundDetailData = await roundDetails;
 
             assert.equal(roundDetailData, 2); //moves on to player 2 after player 1 was first to play this round
             assert.equal(players[0].score, -3);
             assert.equal(players[1].score, -5);
             assert.equal(players[2].score, 11);
            // Restore the stub after the test
            after(() => {
                playTrickStub.restore();
            });
    
        });
    });

})



