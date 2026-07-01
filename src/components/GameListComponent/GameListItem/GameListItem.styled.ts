import styled from 'styled-components';

export const Delete = styled.button`
    visibility: hidden;
    cursor: pointer;
`

export const GameListItemWrapper = styled.div`
    border-radius: 4px;

    &:hover {
        background-color: purple;
        color: white;

        ${Delete} {
            visibility: visible;
        }
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
    width: 20%;
`

export const Date = styled.div`
    display: flex;
    justify-content: center;
    font-size: 12px;
`


