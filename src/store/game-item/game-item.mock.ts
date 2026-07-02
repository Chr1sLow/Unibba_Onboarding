import { Timestamp } from 'firebase/firestore';
import type { GameItem } from './game-item.model';

export const GameItem_DB: GameItem[] = [
  {
    __id: '1',
    __userId: '1',
    game: "Cyberpunk 2077",
    status: 'playing',
    rating: 10,
    _createdAt: Timestamp.now(),
    _updatedAt: Timestamp.now(),
  },
  {
    __id: '2',
    __userId: '1',
    game: "Mario Odyssey",
    status: 'completed',
    rating: 9,
    _createdAt: Timestamp.now(),
    _updatedAt: Timestamp.now(),
  },
  {
    __id: '3',
    __userId: '1',
    game: "GTA 6",
    status: 'dropped',
    rating: 10,
    _createdAt: Timestamp.now(),
    _updatedAt: Timestamp.now(),
  },
];

export const GameItemMockDB = {
  getEntities: () => [...GameItem_DB],
  
  findById: (id: string) => GameItem_DB.find(item => item.__id === id),

  findByUserId: (userId: string) => GameItem_DB.filter(item => item.__userId === userId),

  findByStatus: (userId: string, status: string) => GameItem_DB.filter(item => item.__userId === userId && item.status === status),

  ascOrderBy: (userId: string, param: keyof GameItem) => [...GameItem_DB].filter(item => item.__userId === userId).sort((a,b) => {
    if (typeof a === 'number' && typeof b === 'number') {
      return a[param] - b[param]
    }

    return 0;
  }),

  descOrderBy: (userId: string, param: keyof GameItem) => [...GameItem_DB].filter(item => item.__userId === userId).sort((a,b) => {
    if (typeof a === 'number' && typeof b === 'number') {
      return b[param] - a[param]
    }

    return 0;
  }),

  ascOrderByDate: (userId: string, param: keyof GameItem) => [...GameItem_DB].filter(item => item.__userId === userId).sort((a, b) => {
    if (a[param] instanceof Timestamp && b[param] instanceof Timestamp) {
      return a[param].toMillis() - b[param].toMillis()
    }

    return 0;
  }),

  descOrderByDate: (userId: string, param: keyof GameItem) => [...GameItem_DB].filter(item => item.__userId === userId).sort((a, b) => {
    if (a[param] instanceof Timestamp && b[param] instanceof Timestamp) {
      return b[param].toMillis() - a[param].toMillis()
    }

    return 0;
  }),

  addEntity: (item: GameItem) => {
    GameItem_DB.push(item);
  },

  removeEntity: (id: string) => {
    const index = GameItem_DB.findIndex((item) => item.__id === id);
    
    if (index !== -1) {
      GameItem_DB.splice(index, 1);
    }
  },

  updateEntity: (id: string, updates: Partial<GameItem>) => {
    const index = GameItem_DB.findIndex((item) => item.__id === id);
    if (index !== -1) {
      GameItem_DB[index] = { ...GameItem_DB[index], ...updates, _updatedAt: Timestamp.now() };
    }
  }
};