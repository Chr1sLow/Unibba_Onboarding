import { Timestamp } from 'firebase/firestore';
import type { GameItem } from './game-item.model';

export const GameItem_DB: GameItem[] = [
  {
    __id: '1',
    __userId: '1',
    game: "Cyberpunk 2077",
    rating: 10,
    _createdAt: Timestamp.now(),
    _updatedAt: Timestamp.now(),
  },
  {
    __id: '2',
    __userId: '1',
    game: "Mario Odyssey",
    rating: 9,
    _createdAt: Timestamp.now(),
    _updatedAt: Timestamp.now(),
  },
  {
    __id: '3',
    __userId: '1',
    game: "GTA 6",
    rating: 10,
    _createdAt: Timestamp.now(),
    _updatedAt: Timestamp.now(),
  },
];

export const GameItemMockDB = {
  getEntities: () => [...GameItem_DB],
  
  findById: (id: string) => GameItem_DB.find(item => item.__id === id),

  findByUserId: (userId: string) => GameItem_DB.filter(item => item.__userId === userId),

  addEntity: (item: GameItem) => {
    GameItem_DB.push(item);
  },

  removeEntity: (id: string) => {
    const index = GameItem_DB.findIndex((item) => item.__id === id);
    
    if (index !== -1) {
      GameItem_DB.splice(index, 1);
    }
  },
};