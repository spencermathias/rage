Rage State machine
===================


1 global variables
-------------------


------------------------------
1.1 available global variables
------------------------------

the following shall be the only global variables used in this state machine

* CurrentState
* players
* gameParameters
* CurrentRound
* DealerIndex

1.1.1 CurrentState

current state will be an object with the name field that has a value that is one of the following

* LOBBY
* DEAL
* BID
* PLAY
* End 

1.1.2 players

players shall be a group of players that have the following properties

* seat order
* ready state
* score
* bid 
* cards
* communication to client browser


1.1.3 gameParameters

game parameters shall consist of the following fields

* CardDescriptions
* ScoringVariables
* PullNewTrumpOnTrick
* RoundTrickTotals


-------------------
1.2 initialization
-------------------
the RageStateMachine shall set the variables to if any of the values are undefined:

* CurrentState = LOBBY
* gameParameters = defaultParameters

2 LOBBY State
---------------

--------------------------
2.1 lobby state variables
--------------------------
the following are the local variables to be used in the lobby State:

* minimumPlayers = 2
* maximumPlayers = 9

---------------------
2.2 initialize state
---------------------
the Lobby state shall set the following when the CurrentState becomes LobbyState

* players = empty array 
* CurrentRound = 0

----------------
2.3 add players
----------------
the lobby shall add a new player using the NewPlayer function when a socket IO client connection is established

-----------------------------
2.3 calculate maximumPlayers
-----------------------------
the maximumPlayers shall be calculated using the calculate maximumPlayers function when the CurrentState becomes LobbyState

-----------------------------
2.5 record players readiness
-----------------------------

2.5.1 set player to ready
the lobby state shall toggle the player's ready attribute when corresponding client clicks the ready button

2.5.2 update UI
the lobby state shall send a response to update the UI with the following

* requesting player shall be informed of their current state 
* all clients shall be informed of all players current states

----------------------------
2.6 transition to DEAL State
----------------------------
the lobby state shall set the CurrentState to DEAL state when there are more players than minimumPlayers and any of the following are True

* all the players are in a ready state
* there are more players in the ready state than gameParameters.MaxPlayerCount

3 Deal state
-------------
this state gives players their cards and does other tasks that change game dynamics.

-------------------------
3.1 deal state variables
-------------------------
deck

----------------
3.2 clear cards
----------------
the deal state shall clear the cards of all players 

----------------
3.3 create deck
----------------
the deal state shall create the deck array using the CreateDeck function when CurrentState becomes DEAL state

----------------
3.4 add players 
----------------
the deal state shall add waiting players using the addWaitingPlayers function

---------
3.5 deal
---------
the deal state shall use the DealCards function to update each of the players.cards array when the addWaitingPlayers finishes

----------------------------
3.6 transition to END State
----------------------------
the deal state shall set the CurrentState to END state when the CurrentRound is greater than or equal to the number of values in the gameParameters.RoundTrickTotals array

----------------------------
3.6 transition to BID State
----------------------------
the deal state shall set the CurrentState to DEAL state when the dealCards function is finished

4 BID State
-------------

-------------------------
4.1 BID state variables
-------------------------
the BID state shall keep track of the following variables:


--------------------
4.2 initialize bids
--------------------
the BID state shall set the bid of each of the players to undefined

-----------------------
4.3 update DealerIndex
-----------------------
the BID state shall update the DealerIndex using the UpdateDealerIndex function

-----------------------
4.3 update players bid
-----------------------
the BID state shall update a players bid when it is requested

-----------------------------
4.4 transition to Play State
-----------------------------
the BID state shall set the CurrentState to PLAY when all the players have an updated bid. 


5 PLAY State
-------------
this is the state where the table play happens

-------------------------
5.1 play state variables
-------------------------
the play state shall keep track of the following variables:

* CurrentTurn
* tableCards

-------------------
5.2 update players
-------------------
the play state shall update the cards state of the player and update the tableCards using the output of the PlayedCards function when a player clicks a cards


-----------------------
5.3 update CurrentTurn
-----------------------
the play state shall update current turn to the next player using the GetNextIndex function when all the following are True:

* A card is successfully played using the output of the PlayedCards function
* there are players that have not played yet

-------------------------
5.3 update players score
-------------------------
the play state shall update the score of the players and CurrentTurn using the TallyScoreFromHand function when all of the following are true:

* A card is successfully played using the output of the PlayedCards function
* All of the players have played

-----------------------------
5.4 transition to Deal State
-----------------------------
the BID state shall set the CurrentState to DEAL when all the players have no cards remaining in hands

6 END state
------------
this is where the totals are shown, and reset to the lobby state

-------------------
6.1 display Scores 
-------------------
the End state shall calculate and display scores using the showScores function

------------------------------
6.2 transition to lobby state
------------------------------
the END state shall set the CurrentState to lobby
