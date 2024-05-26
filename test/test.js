process.env.NODE_ENV = "test"


const rageFunctions = require('../rageFunctions.js')
//let chi = require('chai');

//console.log("test script")
//console.table(rageStateMachine.players)

const rageStateMachineClass = require('../rageStateMachine.js')
var assert = require('assert')

//emit('changeStateTo','DEAL')
rageStateMachine = new rageStateMachineClass.machine()
rageStateMachine.main()
console.log('after main in test')

describe('rageStateMachine Happy path', async function () {
    describe('lobby state tests', function () {
        it('should be in the lobby state when initialized', function () {
            assert.equal(rageStateMachine.currentState.name,"LOBBY" );
        });
        it('stay in Lobby with only one player not ready',function(){
            rageStateMachine.addPlayer('MyName')
            assert.equal(rageStateMachine.players.length,1)
            assert.equal(rageStateMachine.currentState.name,'LOBBY')
            assert.equal(rageStateMachine.players[0].state,"NotReady")
        })
        it('stay in lobby with only one player that is ready',function(){
            rageStateMachine.players[0].state = "ready";
            rageStateMachine.currentState.checkToChangeState(rageStateMachine.players)
            assert.equal(rageStateMachine.players.length,1)
            assert.equal(rageStateMachine.currentState.name,'LOBBY')
            assert.equal(rageStateMachine.players[0].state,"ready")
        })
        it('stay in lobby when there are 2 players',function(){
            rageStateMachine.addPlayer("bob")
            rageStateMachine.currentState.checkToChangeState(rageStateMachine.players)
            assert.equal(rageStateMachine.players.length,2)
            assert.equal(rageStateMachine.currentState.name,'LOBBY')
            assert.equal(rageStateMachine.players[0].state,"ready") 
            assert.equal(rageStateMachine.players[1].state,"NotReady") 
        })
        it('stay in lobby with only one player that is ready',function(){
            rageStateMachine.players[1].state = "ready";
            rageStateMachine.currentState.checkToChangeState(rageStateMachine.players)
            assert.equal(rageStateMachine.players.length,2)
            assert.equal(rageStateMachine.currentState.name,'LOBBY')
            assert.equal(rageStateMachine.players[1].state,"ready")
        })
    });
    describe('deal State initializes correctly',function(){
        it('should now have the name DEAL',function(){
            assert.equal(rageStateMachine.currentState.name,'BID')
        })
        it('should have hands for all the players',async function(){
            console.log(rageStateMachine.players)
            assert(rageStateMachine.players[0].cards.length > 0,"player 0 does not have cards")
            assert(rageStateMachine.players[1].cards.length > 0,"player 0 does not have cards")
            let result = await rageStateMachine.allReady
        })
    })
    let lobbyDone = await rageStateMachine.allReady
    describe("test the bid phase",async function(){
        rageStateMachine.done = true
        rageStateMachine.close = true
        rageStateMachine.players[0].bid=10
        rageStateMachine.players[1].bid=1
        assert.equal(rageStateMachineClass.currentState.name,"BID")
        rageStateMachineClass.currentState.resolveAllBid(10)
    })
    let ready = await rageStateMachine.allBid
    describe("play state",function(){
        rageStateMachine.players[0].bid=10
        rageStateMachine.players[1].bid=1
        assert.equal(rageStateMachineClass.currentState.name,"PLAY")
        rageStateMachineClass.currentState.resolveAllPlayed(0)
    })
    describe('end state is reached',()=>{
        assert.equal(rageStateMachine.currentState.name,"END")
    })
        
        /*
        it('name',async function(){
            console.log('before assert')
            console.log(rageStateMachine.currentState.name)
            const testP = Promise.resolve(rageStateMachine.resolveAllReady)
            console.log(testP)
            let ans = rageStateMachine.currentState.resolveAllReady(5)

            const response = await testP
            //console.log(result)
            //const rageStateMachine = require('../rageStateMachine.js')
            console.log("after assert")
        })
        */

});



/*
players.push({cards:[1,2,3],bid:7})
players.push({cards:[1,2,3]})
//set the State to Lobby
eventEmitter.emit('changeStateTo','BID');
console.table(players)
*/