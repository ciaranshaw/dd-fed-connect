import React from 'react';
import Head from 'next/head';

class Login extends React.PureComponent {

  ws = null;

  state = {
    users: {}
  }

  _fetchUsers = () => {
    fetch('/users').then(res => res.json()).then(users => {
      this.setState({ users });
    });
  }

  _setupWS = () => {
    const url = new URL('/', window.location.href);
    url.protocol = url.protocol.replace('http', 'ws');
    this.ws = new WebSocket(url.href);
  }

  _handleStart = () => {
    this.ws.send(JSON.stringify({ type: 'begin-votes' }));
  }

  _handleReset = () => {
    this.ws.send(JSON.stringify({ type: 'reset' }));
  }

  componentDidMount() {
    this._fetchUsers();
    this._setupWS();
  }

  render() {
    const { users } = this.state;

    return (
      <div>
        <Head>
          <title>Admin</title>
        </Head>
        {JSON.stringify(users, null, 2)}
        <button onClick={this._handleStart}>Start</button>
        <button onClick={this._handleReset}>Reset</button>
        <style jsx global>{`
            body {
                font-family: 'Arial';
            }
        `}</style>
      </div>
    );
  }
}

export default Login;
