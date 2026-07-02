import { useState, useEffect, type FC } from 'react';
import { EmptyState, GameListComponentWrapper } from './GameListComponent.styled';
import GameListItem from './GameListItem/GameListItem';
import AddGameComponent from './AddGameComponent/AddGameComponent';
import NavbarComponent from '../NavbarComponent/NavbarComponent';
import ListSortingComponent from './ListSortingComponent/ListSortingComponent';
import { GameItemMockDB } from '../../store/game-item/game-item.mock';
import type { GameItem } from '../../store/game-item/game-item.model';
import { dbService } from '../../services/dbService';
import { useAuthStore } from '../../store/auth/auth.store';

interface GameListComponentProps {}

const GameListComponent: FC<GameListComponentProps> = () => {
   const [gameData, setGameData] = useState<GameItem[]>([]);
   const [sortBy, setSortBy] = useState<string>('date-asc');
   const authStore = useAuthStore();
   const currentUser = authStore.user

   // Get userId in mockDB or Firebase
   const userId = currentUser 
      ? ('uid' in currentUser ? currentUser.uid : currentUser.__id) 
      : null;

   useEffect(() => {
      // Wait for user to load
      if (!userId) {
         setGameData([]);
         return;
      }

      // Use mockDB
      if (import.meta.env.VITE_USE_MOCK_DB === 'true') {
         setGameData(GameItemMockDB.findByUserId(userId!));
      } else {
         // Use Firebase
         const unsubscribe = dbService.streamEntities<GameItem>('games', [['__userId', '==', userId]], {}, (data) => {
            setGameData(data);
         });
         return () => unsubscribe();
      }
   }, [userId]);

   const handleGameAdded = (newGame: GameItem) => {
      if (import.meta.env.VITE_USE_MOCK_DB === 'true') {
         setGameData((prev) => [...prev, newGame]);
      }
   };

   const handleDelete = (deletedGameId: string) => {
      if (import.meta.env.VITE_USE_MOCK_DB === 'true') {
         // Delete from mockDB
         GameItemMockDB.removeEntity(deletedGameId);

         setGameData((prevData) => prevData.filter((game) => game.__id !== deletedGameId));
      } else {
         // Delete from firebase
         dbService.removeEntity('games', deletedGameId);
      }
   }

   const handleEdit = (editGameId: string, newRating: number) => {
      if (import.meta.env.VITE_USE_MOCK_DB === 'true') {
         // Update in mockDB
         GameItemMockDB.updateEntity(editGameId, { rating: newRating });

         setGameData((prevData) => 
            prevData.map((game) => 
               game.__id === editGameId ? { ...game, rating: newRating } : game
            )
         );
      } else {
         // Update in firebase
         dbService.updateEntity('games', editGameId, { rating: newRating });
      }
   }

   const handleStatusChange = (editGameId: string, newStatus: string) => {
      if (import.meta.env.VITE_USE_MOCK_DB === 'true') {
         // Update in mockDB
         GameItemMockDB.updateEntity(editGameId, { status: newStatus });

         setGameData((prevData) => 
            prevData.map((game) => 
               game.__id === editGameId ? { ...game, status: newStatus } : game
            )
         );
      } else {
         // Update in firebase
         dbService.updateEntity('games', editGameId, { status: newStatus });
      }
   }

   const handleSortingChange = (value: string) => {
      setSortBy(value);
   }

   const displayedGames = [...gameData]
      .filter((game) => {
         if (sortBy === 'completed' || sortBy === 'playing' || sortBy === 'dropped') {
            return game.status === sortBy;
         }
         return true;
      })
      .sort((a, b) => {
         if (sortBy === 'rating-asc') {
            return a.rating - b.rating;
         }
         if (sortBy === 'rating-desc') {
            return b.rating - a.rating;
         }
         if (sortBy === 'date-asc') {
            return (a._updatedAt?.toMillis() || 0) - (b._updatedAt?.toMillis() || 0);
         }
         if (sortBy === 'date-desc') {
            return (b._updatedAt?.toMillis() || 0) - (a._updatedAt?.toMillis() || 0);
         }
         return 0;
      });

   return (
      <GameListComponentWrapper>
         <NavbarComponent></NavbarComponent>
         <h1>{(authStore.user as any)?.name}'s Game List</h1>
         <AddGameComponent onGameAdded={handleGameAdded}></AddGameComponent>

         <ListSortingComponent
            onSortingChange={handleSortingChange}
         ></ListSortingComponent>

         {gameData.length === 0 ? (
            <EmptyState>
               <p>Add games to your list</p>
            </EmptyState>
         ) : displayedGames.length === 0 ? (
            <EmptyState>
               <p>No games in this category</p>
            </EmptyState>
         ) : (
            displayedGames.map((item) => (
               <GameListItem 
                  key={item.__id}
                  id={item.__id}
                  game={item.game} 
                  status={item.status}
                  rating={item.rating} 
                  updatedAt={item._updatedAt}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onStatusChange={handleStatusChange}
               />
            ))
         )}
      </GameListComponentWrapper>
   );
};

export default GameListComponent;
