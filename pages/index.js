import React from 'react';
import Head from 'next/head';

import NameForm from '../components/v2/NameForm';

const STEPS = {
  login: 'login',
  preVote: 'preVote',
  voting: 'voting',
  postVote: 'postVote'
}

class Home extends React.PureComponent {

  ws = null

  state = {
    currentStep: STEPS.login,
    username: '',
    users: { },
    currentUser: '',
    recentPartnered: '',
    timeLeft: 0,
    votes: {}
  }

  _handleSubmit = fullName => {
    if (this.ws) {
      this.ws.send(JSON.stringify({
        type: 'login',
        data: fullName,
      }));
      this.setState({ username: fullName });
    }
  };

  _handleVote = username => {
    this.ws.send(JSON.stringify({
      type: 'vote',
      data: username
    }))
  }

  _sortVotes = votes => {
    const sortable = [];

    for (const vote in votes) {
        sortable.push([vote, votes[vote]]);
    }

    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });

    return sortable.filter(item => item[0] !== "partner");
  };

  _setupWS = () => {
    const url = new URL('/', window.location.href);
    url.protocol = url.protocol.replace('http', 'ws');
    this.ws = new WebSocket(url.href);

    this.ws.addEventListener('message', (message) => {
      const { type, data } = JSON.parse(message.data);
      
      switch (type) {
        case 'vote-update':
          console.log(data);
          this.setState({ currentStep: STEPS.voting, currentUser: data.currentUser, users: data.users, timeLeft: data.timeLeft });
          break;
        case 'vote-finalised':
          this.setState({ currentStep: STEPS.postVote, recentPartnered: `${data.currentUser} and ${data.partner}`, votes: this._sortVotes(data.votes) })
          break;
        case 'reset':
          this.setState({ currentStep: STEPS.login });
          break;
        case 'logged-in':
        default:
          this.setState({ currentStep: STEPS.preVote });
      }
    });
  }

  renderStep() {
    const { currentStep, username, currentUser, users, recentPartnered, timeLeft, votes } = this.state;

    switch (currentStep) {
      case STEPS.voting:
        return (
          <div className="voteWrapper">
            <h2>Who should {currentUser} be paired with?</h2>
            <div className="buttonWrapper">
              {Object.keys(users).map(item => (
                <button
                  className="voteButton"
                  onKeyPress={e => { e.preventDefault(); }}
                  onClick={e => { e.preventDefault(); this._handleVote(item) }}
                >
                  <b>{item}</b>
                  <div>Votes: {users[item]}</div>
                </button>
              ))}
            </div>
            <h4>Time left: {20 - timeLeft} seconds</h4>
          </div>
        );
      case STEPS.postVote:
        console.log(votes);
        return (
          <div>
            <h2>A new pair!</h2>
            <p>{recentPartnered}</p>
            <h3>Votes:</h3>
            <ul>
              {votes.map(item => (
                <li>{item[0]} - {item[1]}</li>
              ))}
            </ul>
          </div>
        );
      case STEPS.preVote:
        return (
          <div>Howdy {username}. Voting will start soon!</div>
        )
      case STEPS.login:
      default:
        return (
          <div>
            <h1>FED Connect V1</h1>
            <NameForm onSubmit={this._handleSubmit} />
          </div>
        );
    }
  }

  componentDidMount() {
    this._setupWS();
  }

  render() {
    return (
      <div>
        <Head>
          <title>FED Connect</title>
        </Head>
        <div className="formWrapper">
          {this.renderStep()}
        </div>
        <style jsx global>{`
            body {
                font-family: 'Arial';
                margin: 0;
            }
            
            h1 {
              text-align: center;
              font-size: 50px;
            }

            .formWrapper {
              display: flex;
              min-height: 100vh;
              align-items: center;
              justify-content: center;
            }

            .buttonWrapper {
              display: flex;
              flex-wrap: wrap;
              max-width: 600px;
              justify-content: center;
              margin: auto;
            }

            .voteButton {
              margin: 10px;
              flex-basis: calc(33.33% - 20px);
              padding: 20px;
              background: white;
              border: 1px solid #cccccc;
              border-radius: 4px;
            }

            .voteButton:hover {
              cursor: pointer;
            }

            @media (max-width: 500px) {
              .voteButton {
                flex-basis: 100%;
              }
            }

            b {
              font-size: 14px;
              margin-bottom: 5px;
              display: block;
            }

            .voteWrapper {
              width: 100%;
            }

            h2, h4, p {
              text-align: center;
            }
        `}</style>
      </div>
    )
  }
}

export default Home;
