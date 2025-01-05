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
            rageStateMachine.currentState.updatePlayerReady(rageStateMachine.players,'MyName',true);
            assert.equal(rageStateMachine.players.length,1)
            assert.equal(rageStateMachine.currentState.name,'LOBBY')
            assert.equal(rageStateMachine.players[0].state,"Ready")
        })
        it('stay in lobby when there are 2 players',function(){
            rageStateMachine.addPlayer("bob")
            assert.equal(rageStateMachine.players.length,2)
            assert.equal(rageStateMachine.currentState.name,'LOBBY')
            assert.equal(rageStateMachine.players[0].state,"Ready") 
            assert.equal(rageStateMachine.players[1].state,"NotReady") 
        })
        it('checks for too many people',()=>{
            rageStateMachine.currentState.updatePlayerReady(rageStateMachine.players,'MyName',false);
            for(let i=0;i<8;i++){
                rageStateMachine.addPlayer(''+i)
                rageStateMachine.currentState.updatePlayerReady(rageStateMachine.players,''+i,true);
            }
            console.table(rageStateMachine.players)
            assert.equal(rageStateMachine.currentState.name,'LOBBY')
        })
        it('should start when maximum players are ready',function(){
            rageStateMachine.currentState.updatePlayerReady(rageStateMachine.players,'bob',true);
            assert.equal(rageStateMachine.currentState.name,'LOBBY')
            assert.equal(rageStateMachine.players[1].state,"Ready")
        })
    });
    let lobbyDone = await rageStateMachine.allReady
    console.log(lobbyDone)
    let dealStateDone = {}
    let dealStatePromise = new Promise((resolve,reject)=>{
        dealStateDone = resolve 
    })
    describe('deal State initializes correctly',function(){
        it.skip('should now have the name DEAL',function(){
            assert.equal(rageStateMachine.currentState.name,'BID')
            assert(rageStateMachine.currentState.deck.length>0,"there is no deck")
        })
        it('should have hands for all the players',async function(){
            assert.equal(rageStateMachine.players.length,rageStateMachineClass.GameParameters.MaximumPlayers)
            assert(rageStateMachine.players[0].cards.length > 0,"player 0 does not have cards")
            //assert(rageStateMachine.players[rageStateMachineClass.GameParameters.MaximumPlayers-1].cards.length > 0,"player "+(rageStateMachineClass.GameParameters.MaximumPlayers-1)+ " does not have cards")
            dealStateDone(true)
        })
    })
    let dealDone = await dealStatePromise
    describe("test the bid phase",async function(){
        //todo reset machine
        rageStateMachine.done = true
        rageStateMachine.close = true
        await rageStateMachine.currentState.initialize(rageStateMachine.players)
        it("should not move to next state",function(){
            assert.equal(rageStateMachineClass.currentState.name,"BID")
            rageStateMachine.currentState.updateBid(rageStateMachine.players,"bob",5)
            assert.equal(rageStateMachine.players[0].bid,5)
        })
        //remove players
        rageStateMachine.players.pop()//7
        rageStateMachine.players.pop()//6
        rageStateMachine.players.pop()//5
        rageStateMachine.players.pop()//4
        rageStateMachine.players.pop()//3
        rageStateMachine.players.pop()//2
        rageStateMachine.players.pop()//1
        it("should move to next state when both have bid",function(){
            rageStateMachine.currentState.updateBid(rageStateMachine.players,"0",6)
            assert.equal(rageStateMachineClass.currentState.name,"DEAL")
            assert.equal(rageStateMachine.players[0].bid,5)
        })
        //rageStateMachineClass.currentState.resolveAllBid(10)
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