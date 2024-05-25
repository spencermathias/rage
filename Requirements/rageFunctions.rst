==========================
1 CalculateMaximumPlayers 
==========================

1.1 inputs
-----------
the maximumPlayers function shall receive the following inputs

* CardDescriptions

1.2 outputs
------------
the maximumPlayers function shall return the following outputs

* MaxPlayers
  
1.3 
--------------


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

2.3 
--------------

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

* newPlayerArray
  
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