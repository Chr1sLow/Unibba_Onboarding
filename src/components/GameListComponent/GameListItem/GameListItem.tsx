import { useState, type FC } from 'react';
import { GameListItemWrapper, Item, ItemData, Name, Rating, Date, Edit, Delete, Status } from './GameListItem.styled';
import type { Timestamp } from 'firebase/firestore';

interface GameListItemProps {
   id: string,
   game: string,
   status?: string,
   rating: number,
   updatedAt?: Timestamp
   onDelete: (id: string) => void;
   onEdit: (id: string, newRating: number) => void;
   onStatusChange: (id: string, status: string) => void;
}

const GameListItem: FC<GameListItemProps> = (props) => {
   const [isEditing, setIsEditing] = useState(false);
   const [editRating, setEditRating] = useState(props.rating);

   const getDate = props.updatedAt 
      ? props.updatedAt.toDate().toLocaleDateString() 
      : '';
   
   const handleDelete = () => {
      props.onDelete(props.id);
   }

   const handleEdit = () => {
      if (isEditing) {
         // Save the rating when switching out of edit mode
         props.onEdit(props.id, editRating);
         setIsEditing(false);
      } else {
         setIsEditing(true);
      }
   }

   const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      props.onStatusChange(props.id, e.target.value);
   }
   
   return (
      <GameListItemWrapper>
         <Item>
            <ItemData>
               <Name>{props.game}<Date>Updated on: {getDate}</Date></Name>
               <Status value={props.status} onChange={handleStatusChange}>
                  <option value="playing">Playing</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
               </Status>
               <Rating>
                  {isEditing ? (
                     <input 
                        type="number" 
                        value={editRating} 
                        onChange={(e) => setEditRating(Number(e.target.value))} 
                        min="0" 
                        max="10" 
                        style={{ width: '40px', marginRight: '4px' }}
                     />
                  ) : (
                     <>{props.rating}</>
                  )}
                  /10
               </Rating>
               <Edit onClick={handleEdit}>{isEditing ? 'Save' : 'Edit'}</Edit>
               <Delete onClick={handleDelete}>Delete</Delete>
            </ItemData>
            
         </Item>
      </GameListItemWrapper>
   );
};

export default GameListItem;
