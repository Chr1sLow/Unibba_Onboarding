import type { FC } from 'react';
import { GameListItemWrapper, Item, ItemData, Name, Rating, Date, Delete } from './GameListItem.styled';
import type { Timestamp } from 'firebase/firestore';

interface GameListItemProps {
   id: string,
   game: string,
   rating: number,
   createdAt?: Timestamp
   onDelete: (id: string) => void;
}

const GameListItem: FC<GameListItemProps> = (props) => {
   const getDate = props.createdAt 
      ? props.createdAt.toDate().toLocaleDateString() 
      : '';
   
   const handleDelete = () => {
      props.onDelete(props.id);
   }
   
   return (
      <GameListItemWrapper>
         <Item>
            <ItemData>
               <Name>{props.game}<Date>Completed at: {getDate}</Date></Name>
               <Rating>{props.rating}/10</Rating>
               <Delete onClick={handleDelete}>Delete</Delete>
            </ItemData>
            
         </Item>
      </GameListItemWrapper>
   );
};

export default GameListItem;
