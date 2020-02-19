import React from 'react';

const List = ({ names = [] }) => (
    <ul>
        {names.map(name => <li>{name[0]} + {name[1]}</li>)}
    </ul>
);

export default List;
