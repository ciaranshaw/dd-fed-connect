const express = require('express');
const next = require('next');
const WebSocket = require('ws');
const http = require('http');
    
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const sockets = [];

class Users {
    users = {};
    currentUser = '';
    voteOpen = false;
    started = false;

    getCurrentUser() {
        return this.currentUser;
    }

    getUsers() {
        return this.users;
    }

    getUser(fullName) {
        return this.users[fullName];
    }

    setUser(fullName) {
        this.users[fullName] = {};
    }

    startUserVotes(fullName) {
        this.currentUser = fullName;
        
        if (!this.started) {
            Object.keys(this.users).forEach(fullName => {
                const votes = Object.keys(this.users).reduce((acc, name) => {
                    if (name !== fullName) acc[name] = 0;
                    return acc;
                }, {});
                this.users[fullName] = votes;
            });
            this.started = true;
        }
    }

    calculateUserPartner(fullName) {
        return Object.keys(this.users[fullName]).reduce((acc, partnerName) => {
            if (!acc || this.users[fullName][partnerName] > this.users[fullName][acc]) {
                return partnerName;
            }
            return acc;
        }, null);
    }

    updateUserPartner(fullName, partner) {
        if (this.users[fullName]) {
            this.users[fullName].partner = partner
        }
    }

    setVoteOpen(voteOpen) {
        this.voteOpen = voteOpen;
    }

    getVoteOpen() {
        return this.voteOpen;
    }

    vote(user, partner) {
        console.log(this.users, user, partner);
        this.users[user][partner] = this.users[user][partner] + 1;
    }

    getFullPicture() {
        return {
            users: this.users,
            currentUser: this.currentUser,
            voteOpen: this.voteOpen,
        }
    }

    reset() {
        this.users = {};
        this.currentUser = '';
        this.voteOpen = false;
        this.started = false;
    }
}

const users = new Users();

const startEventLoop = ws => {
    let timeSpent = 0;
    users.setVoteOpen(true);
    const interval = setInterval(() => {
        timeSpent = timeSpent + 100;
        const voteOptions = users.getUsers()[users.getCurrentUser()];
        
        sockets.forEach(ws => {
            ws.send(JSON.stringify({
                type: 'vote-update',
                data: {
                    currentUser: users.getCurrentUser(),
                    users: Object.keys(voteOptions).reduce((acc, item) => {
                        if (!users.getUsers()[item].partner) {
                            acc[item] = voteOptions[item]; 
                        }
                        return acc;
                    }, {}),
                    timeLeft: parseInt(timeSpent / 1000)
                } 
            }));
        });
    }, 100);

    setTimeout(() => {
        clearInterval(interval);
        users.setVoteOpen(false);
        const partner = users.calculateUserPartner(users.getCurrentUser());
        users.updateUserPartner(users.getCurrentUser(), partner);
        users.updateUserPartner(partner, users.getCurrentUser());
        sockets.forEach(ws => {
            ws.send(JSON.stringify({
                type: 'vote-finalised',
                data: {
                    currentUser: users.getCurrentUser(),
                    partner,
                    votes: users.getUsers()[users.getCurrentUser()]
                }
            }));
        });
    }, 20000);
}

const setupWs = server => {
    const wss = new WebSocket.Server({ server });

    // Handle initial connection
    wss.on('connection', function (ws) {
        // After connection - send login
        ws.on('message', function (message) {
            const { type, data } = JSON.parse(message);
            switch(type) {
                case 'login':
                    users.setUser(data);
                    ws.send(JSON.stringify({ type: 'logged-in' }));
                    sockets.push(ws);
                    break;
                case 'begin-votes':
                    if (!users.getVoteOpen()) {
                        const userList = users.getUsers()
                        const nextUser = Object.keys(userList).find(item => !userList[item].partner);
                        users.startUserVotes(nextUser);
                        startEventLoop();
                    }
                    break;
                case 'vote':
                    users.getVoteOpen() && users.vote(users.getCurrentUser(), data);
                    break;
                case 'reset':
                    users.reset();
                    sockets.forEach(ws => {
                        ws.send(JSON.stringify({ type: 'reset' }));
                    });
                    break;
            }
        });
    });
}
    
app.prepare()
.then(() => {
    const expressServer = express();

    expressServer.get('/users', (_, res) => {
        res.json(users.getFullPicture());
    });

    expressServer.get('*', (req, res) => {
        return handle(req, res)
    });

    const server = http.createServer(expressServer);

    setupWs(server);

    server.listen(3000, (err) => {
    
        if (err) throw err
        console.log('> Ready on http://localhost:3000')
    });

})
.catch((ex) => {
    console.error(ex.stack)
    process.exit(1)
})