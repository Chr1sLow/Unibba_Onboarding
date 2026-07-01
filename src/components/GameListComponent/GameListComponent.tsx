import { useState, useEffect, type FC } from 'react';
import { EmptyState, GameListComponentWrapper } from './GameListComponent.styled';
import GameListItem from './GameListItem/GameListItem';
import AddGameComponent from './AddGameComponent/AddGameComponent';
import { GameItemMockDB } from '../../store/game-item/game-item.mock';
import type { GameItem } from '../../store/game-item/game-item.model';
import { dbService } from '../../services/dbService';
import { useAuthStore } from '../../store/auth/auth.store';

interface GameListComponentProps {}

const GameListComponent: FC<GameListComponentProps> = () => {
   const [gameData, setGameData] = useState<GameItem[]>([]);
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
      console.log(userId);
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

   return (
      <GameListComponentWrapper>
         <h1>{(authStore.user as any)?.name}'s Game List</h1>
         <AddGameComponent onGameAdded={handleGameAdded}></AddGameComponent>

         {gameData.length === 0 ? (
            <EmptyState>
               <p>Add games to your list</p>
            </EmptyState>
         ) : (
         gameData.map((item) => (
            <GameListItem 
               key={item.__id}
               id={item.__id}
               game={item.game} 
               rating={item.rating} 
               createdAt={item._createdAt}
               onDelete={handleDelete}
            />
         ))
         )}
      </GameListComponentWrapper>
   );
};

export default GameListComponent;
