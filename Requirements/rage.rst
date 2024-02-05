Round Module
=============
some text

1 Main IO
----------

-----------
1.1 inputs
-----------
id  #1#

the following are the inputs to the module:

* players
* starting index

------------
1.2 outputs
------------
id #2#

* players
* next starting index

------------------
1.3 local signals
------------------
id #3#

current turn


2 validPlay function
---------------------

-----------
2.1 inputs
-----------
* leadCard
* selectedCard
* players

------------
2.2 outputs
------------
* currentTurn

-----------------------
2.3 card is valid
-----------------------
the validPlay function shall initiate the updatePlayers function WHEN the following are True:

* the selectedCard is in players[currentTurn].hand
* the playedCard is none

and any of the following are True

* the selectedCard is the same suit as the leadCard
* the leadCard is none
* the suit of the leadCard does not match any of the cards in players[currentTurn].hand

---------------------------
2.4 updatePlayers function
---------------------------
the updatePlayers function shall do the following

* remove the selectedCard from players[currentTurn].hand
* make the selectedCard the playedCard 
* initiate the Update turn function
* send updated values to the clients

-------------------------------
2.5 updateCurrentTurn Function
-------------------------------
The updateCurrentTurn shall increment the currentTurn when all the current turn is less than the number of players 
Else the updateCurrentTurn function shall set current turn to 0

----------------------------
2.6 all players have chosen
----------------------------
the validPlay function shall initiate the StartNextHand function when all of the following are True

* the players[currentTurn].playedCard is not none
* all players have playedCards that are not none

-----------------------------
2.7 already playedCard
-----------------------------
If all players have not played a card and the current player has played a card 
then the validPlay function shall initiate the updateCurrentTurn function.

3 StartNextHand
-------------------

-----------
3.1 inputs
-----------

* players
* leadCard
* settings

------------
3.3 outputs
------------

* leadCard
* currentTurn  

--------------------------
3.3 determine hand winner
--------------------------

__________________________
3.3.1 choose highest trump
__________________________
the determineHandWinner function shall make the current turn correspond to the player 
with the greatest trump playedCard when any player has played the trump suit

