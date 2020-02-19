import React from 'react';

import List from './List';
import NameContainer from './NameContainer';

class BackupContainer extends React.PureComponent {
    state = {
        names: [''],
        generatedNames: [],
    };

    _shuffle = o => {
        for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };

    _generateNames = () => {
        const { names } = this.state;

        this.setState({
            generatedNames:
                this
                    ._shuffle([...names])
                    .reduce((acc, item, index) =>
                        index % 2 === 0 ?
                            [...acc, [item]] :
                            [
                                ...acc.slice(0, acc.length - 1),
                                [acc[acc.length - 1][0], item]
                        ], []),
        });
    }

    _handleNewName = () => {
        this.setState(prevState => ({
            names: [...prevState.names, ''],
        }))
    }

    _handleChange = (index, name) => {
        this.setState(prevState => ({
            names: [
                ...prevState.names.slice(0, index),
                name,
                ...prevState.names.slice(index + 1, prevState.names.length)
            ]
        }));
    }

    render() {
        const { names, generatedNames } = this.state;

        return (
            <>
                <div className="wrapper">
                    <NameContainer names={names} onChange={this._handleChange} onNewName={this._handleNewName} generateNames={this._generateNames} />
                    <List names={generatedNames} />
                </div> 
                <style jsx>{`
                    .wrapper {
                        display: flex;
                    }
                `}</style>
            </>
        )
    }
};

export default BackupContainer;