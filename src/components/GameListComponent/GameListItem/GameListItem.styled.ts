import styled from 'styled-components';

export const GameListItemWrapper = styled.div`
    border-radius: 4px;

    &:hover {
        background-color: purple;
        color: white;
    }
`;

export const Item = styled.div`
    padding: 16px;
    border-radius: 4px;
`;

export const ItemData = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
`

export const Name = styled.div`
    display: flex;
    flex-direction: row;
    gap: 8px;
    width: 60%;
`

export const Rating = styled.div`
    width: 30%;
`

export const Date = styled.div`
    display: flex;
    justify-content: center;
    font-size: 12px;
`
