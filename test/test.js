process.env.NODE_ENV = "test"


//let chi = require('chai');

//console.log("test script")
//console.table(rageStateMachine.players)

const rageStateMachineClass = require('../rageStateMachine.js')
var assert = require('assert')

//emit('changeStateTo','DEAL')
rageStateMachine = new rageStateMachineClass.machine()
rageStateMachine.main()
console.log('after main in test')

describe('rageStateMachine Happy path', function () {
    describe('lobby state tests', function () {
        it('should be in the lobby state when initialized', function () {
            assert.equal(rageStateMachine.currentState.name,"LOBBY" );
        });
    });
    //rageStateMachine.currentState.resolver(2)//=Promise.resolve(7)
    describe('deal State initializes correctly',function(){
        it('should now have the name DEAL',async function(){
            console.log('before assert')
            console.log(rageStateMachine.currentState.allReady)
            const testP = Promise.resolve(rageStateMachine.allReady)
            let ans = rageStateMachine.currentState.setReadiness(7)
            console.log(testP)
            ans = rageStateMachine.currentState.setReadiness(5)

            const response = await testP
            //console.log(result)
            //const rageStateMachine = require('../rageStateMachine.js')
            assert.equal(rageStateMachine.currentState.name,'DEAL')
            console.log("after assert")
        })
    })
});



/*
players.push({cards:[1,2,3],bid:7})
players.push({cards:[1,2,3]})
//set the State to Lobby
eventEmitter.emit('changeStateTo','BID');
console.table(players)
*/