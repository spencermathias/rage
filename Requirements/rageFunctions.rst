==========================
1 CalculateMaximumPlayers 
==========================

1.1 inputs
-----------
the maximumPlayers function shall receive the following inputs

* CardDescriptions
* RoundTrickTotals
* CurrentRound

1.2 outputs
------------
the maximumPlayers function shall return the following outputs

* MaxPlayers
  
1.3 calculate usableCards
------------------------------------
the maximumPlayers function shall calculate the number of cards that
 are not out or change. these cards require a new cards to be reveled 
 when played. therefore should not count toward the total cards available
 to be used in hands. 

1.4  calculate MaxHandSize
---------------------------
the maximumPlayers function shall calculate MaxHandSize to be the 
maximum of the values in the RoundTrickTotals array have an index greater
than the current round.

1.5  calculate MaxPlayers
--------------------------
the maximumPlayers function shall calculate the maxPlayers by the following equation

maximumPlayers = truncate((usableCards-1)/maximumPlayers)



======================
xa addPlayers 
======================

xa.1 inputs
---------------------
the addPlayers function shall receive the following inputs

* playerinfo
* CurrentState

xa.2 outputs
-------------
the addPlayers function shall return the following outputs

* player object

xa.3
------------

======================
2 CreateDeck 
======================

2.1 inputs
-----------
the CreateDeck function shall receive the following inputs

* CardDescriptions

2.2 outputs
------------
the CreateDeck function shall return the following outputs

* DeckArray

2.3 create number cards
------------------------
the CreateDeck function shall create a card for each number between and including 0 
and the CardDescriptions MaxNumber in each color

2.4 create word cards
----------------------
the CreateDeck function shall create a the number of cards specified by the 
quantity field each of the entries of the CardDescriptions that are not 
related to numbers or colors

2.5 word card properties 
-------------------------
word cards shall have the following

* name: name of the card
* the function of how the card will interact with the game

======================
3 addWaitingPlayers 
======================

3.1 inputs
-----------
the addWaitingPlayers function shall receive the following inputs

* WaitingPlayers
* MaxPlayers

3.2 outputs
------------
the addWaitingPlayers function shall return the following outputs

* newPlayerArray:[]
  
3.3 
--------------

======================
4 DealCards 
======================

4.1 inputs
-----------
the DealCards function shall receive the following inputs

* DeckArray
* numberOfPlayers

4.2 outputs
------------
the DealCards function shall return the following outputs

* handsArray
  
4.3 
--------------

======================
5 UpdateDealerIndex 
======================

5.1 inputs
-----------
the UpdateDealerIndex function shall receive the following inputs

* currentDealer
* numberOfPlayers

6.2 outputs
------------
the UpdateDealerIndex function shall return the following outputs

* nextDealerIndex

6.3 
--------------

======================
7 PlayedCards 
======================

7.1 inputs
-----------
the PlayedCards function shall receive the following inputs

* DesiredCard
* cardsArray
* ledSuit

7.2 outputs
------------
the PlayedCards function shall return the following outputs

* CardPlayed
* cardsArray

7.3 
--------------

======================
8 GetNextIndex 
======================

8.1 inputs
-----------
the GetNextIndex function shall receive the following inputs

* tableCards
* CurrentTurn

8.2 outputs
------------
the GetNextIndex function shall return the following outputs

* nextTurn


8.3 
--------------


======================
9 TallyScoreFromTrick 
======================

9.1 inputs
-----------
the TallyScoreFromTrick function shall receive the following inputs

* players
* tableCards
* ledSuit
* TrumpSuit
* numberOfTricksWon

9.2 outputs
------------
the TallyScoreFromTrick function shall return the following outputs

* updatedNumberOfTricksWon
* scoresArray

==============
12 ShowScores 
==============

12.1 inputs
------------
the ShowScores function shall receive the following inputs

* players

12.2 outputs
-------------
the ShowScores function shall return the following outputs

* scoresList