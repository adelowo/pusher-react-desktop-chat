import React, { Component } from 'react';
import { ChatManager, TokenProvider } from '@pusher/chatkit-client';
import MessageList from './MessageList';
import SendMessageForm from './SendMessageForm';
import OnlineList from './OnlineList';

class Chat extends Component {
  state = {
    currentUser: null,
    currentRoom: { id: '19373609' },
    messages: [],
  };

  componentDidMount() {
    const chatkit = new ChatManager({
      instanceLocator: 'PUSHER_INSTANCE_LOCATOR',
      userId: this.props.currentId,
      tokenProvider: new TokenProvider({
        url: 'PUSHER_TOKEN_URL',
      }),
    });

    chatkit
      .connect()
      .then(currentUser => {
        this.setState({ currentUser });
        console.log('Bleep bloop 🤖 You are connected to Chatkit');

        return currentUser.subscribeToRoom({
          roomId: this.state.currentRoom.id,
          messageLimit: 100,
          hooks: {
            onMessage: message => {
              this.setState({
                messages: [...this.state.messages, message],
              });
            },
          },
          onPresenceChanged: () => this.forceUpdate(),
          onUserJoinedRoom: () => this.forceUpdate(),
          onAddedToRoom: () => this.forceUpdate(),
        });
      })
      .then(currentRoom => {
        this.setState({ currentRoom });
      })
      .catch(error => console.error('error', error));
  }

  onSend = text => {
    this.state.currentUser.sendMessage({
      text,
      roomId: this.state.currentRoom.id,
    });
  };

  render() {
    return (
      <div>
        <div className="wrapper">
          <div>
            <OnlineList
              currentUser={this.state.currentUser}
              users={this.state.currentRoom.users}
            />
          </div>
          <div className="chat">
            <MessageList messages={this.state.messages} />
            <SendMessageForm onSend={this.onSend} />
          </div>
        </div>
      </div>
    );
  }
}

export default Chat;
