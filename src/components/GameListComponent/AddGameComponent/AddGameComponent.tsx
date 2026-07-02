import { type FC, useState } from 'react';
import { AddGameComponentWrapper, GameInput, RatingInput, AddGame } from './AddGameComponent.styled';
import { dbService } from '../../../services/dbService';
import { GameItemMockDB } from '../../../store/game-item/game-item.mock';
import type { GameItem } from '../../../store/game-item/game-item.model';
import { Timestamp } from 'firebase/firestore';
import { useAuthStore } from '../../../store/auth/auth.store';

interface AddGameComponentProps {
  onGameAdded?: (newGame: GameItem) => void;
}

const AddGameComponent: FC<AddGameComponentProps> = ({ onGameAdded }) => {
  const [gameTitle, setGameTitle] = useState<string>('');
  const [rating, setRating] = useState<number | ''>('');
  const authStore = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameTitle.trim() || !rating || !authStore.user) return;

    const userId = 'uid' in authStore.user ? authStore.user.uid : authStore.user.__id;

    const newGame: GameItem = {
      __id: dbService.createId(),
      __userId: userId,
      game: gameTitle,
      status: 'playing',
      rating: Number(rating),
      _createdAt: Timestamp.now(),
      _updatedAt: Timestamp.now(),
    };

    if (import.meta.env.VITE_USE_MOCK_DB === 'true') {
      // Add to mock DB
      GameItemMockDB.addEntity(newGame);
      console.log('Added to Mock DB:', newGame);
      if (onGameAdded) onGameAdded(newGame);
    } else {
      // Add to Firebase
      try {
        await dbService.addEntity('games', newGame);
        console.log('Added to Firebase:', newGame);
      } catch (error) {
        console.error('Error adding game:', error);
      }
    }

    setGameTitle('');
    setRating('');
  };
  
  return (
    <AddGameComponentWrapper>
      <form onSubmit={handleSubmit}>
        <GameInput 
          type="text" 
          value={gameTitle}
          onChange={(e) => setGameTitle(e.target.value)} 
          placeholder="Game Name"
          required
          maxLength={100}
        />

        <RatingInput
          type="number"
          min="1"
          max="10"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          placeholder="Rating (1-10)"
          required
        />

        <AddGame type="submit">Add Game</AddGame>
      </form>
    </AddGameComponentWrapper>
  );
};

export default AddGameComponent;
