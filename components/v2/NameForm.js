import React from 'react';

class NameForm extends React.PureComponent {
    state = {
        fullName: '',
    };

    _handleChange = e => {
        this.setState({ fullName: e.target.value });
    }

    render() {
        const { onSubmit } = this.props;
        const { fullName } = this.state;

        return (
            <>
                <form onSubmit={e => {
                    e.preventDefault();
                    onSubmit(this.state.fullName);
                }}>
                    <label htmlFor="full-name">Enter your Full Name:</label>
                    <input id="full-name" onChange={this._handleChange} value={fullName} name="fullName"></input>
                    <button type="submit">Enter (if you dare)</button>
                </form>
                <style jsx>{`
                    form {
                        display: flex;
                        flex-direction: column;
                        max-width: 500px;
                        align-items: center;
                        margin: auto;
                    }

                    input {
                        padding: 15px;
                        margin: 30px 0;
                        width: 200px;
                        border: 1px solid #cccccc;
                        border-radius: 4px;
                        font-size: 14px;
                    }
                    
                    label {
                        font-size: 16px;
                    }

                    button {
                        border: 1px solid #cccccc;
                        background: white;
                        border-radius: 4px;
                        font-size: 14px;
                        padding: 10px;
                        width: 224px;
                    }
                `}</style>
            </>
        );
    }
};

export default NameForm