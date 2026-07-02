import type { FC } from 'react';
import { ListSortingComponentWrapper, Sorter } from './ListSortingComponent.styled';

interface ListSortingComponentProps {
   onSortingChange: (value: string) => void
}

const ListSortingComponent: FC<ListSortingComponentProps> = (props) => {

   const handleSortingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      props.onSortingChange(e.target.value);
   }

   return (
      <ListSortingComponentWrapper>
         <p>Sort by:</p>
         <Sorter defaultValue="date-asc" onChange={handleSortingChange}>
            <option value="rating-asc">Rating (Ascending)</option>
            <option value="rating-desc">Rating (Descending)</option>
            <option value="completed">Completed</option>
            <option value="playing">Playing</option>
            <option value="dropped">Dropped</option>
            <option value="date-desc">Most Recent</option>
            <option value="date-asc">Least Recent</option>
         </Sorter>
      </ListSortingComponentWrapper>
   );
};

export default ListSortingComponent;
