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

   useEffect(() => {
      // Use mockDB
      if (import.meta.env.VITE_USE_MOCK_DB === 'true') {
         setGameData(GameItemMockDB.getEntities());
      } else {
         // Use Firebase
         const unsubscribe = dbService.streamEntities<GameItem>('games', [], {}, (data) => {
            setGameData(data);
         });
         return () => unsubscribe();
      }
   }, []);

   const handleGameAdded = (newGame: GameItem) => {
      if (import.meta.env.VITE_USE_MOCK_DB === 'true') {
         setGameData((prev) => [...prev, newGame]);
      }
   };

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
               game={item.game} 
               rating={item.rating} 
               createdAt={item._createdAt}
            />
         ))
         )}
      </GameListComponentWrapper>
   );
};

export default GameListComponent;
