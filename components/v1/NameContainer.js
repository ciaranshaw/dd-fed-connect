import React from 'react';

const NameContainer = ({ names = [], onChange, onNewName, generateNames }) => (
    <>
        <div className="name-container">
            <h2>Names</h2>
            {names.map((name, index) => (
                <input value={name} onChange={(e) => onChange(index, e.target.value) }></input>
            ))}
            <button onClick={onNewName}>Add new name</button>
            <button onClick={generateNames}>Generate!</button>
        </div>
        <style jsx>{`
            .name-container {
                display: flex;
                flex-direction: column;
            }

            input {
                width: 200px;
                padding: 10px;
                font-size: 14px;
                margin: 10px 0;
                border-radius: 5px;
            }

            button {
                height: 40px;
                width: 120px;
                background: white;
                border: 1px solid #cccccc;
                margin-top: 10px;
                border-radius: 5px;
            }

            button:hover {
                cursor: pointer;
            }
        `}</style>
    </>
);

export default NameContainer;