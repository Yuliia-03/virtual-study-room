import React, { Component } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";

class ChatBox extends Component {
    state = {
        isLoggedIn: false,
        messages: [],
        value: '',
        name: '',
        room: 'testRoom',
    };

    client = null;

    componentDidMount() {
        // Initialize WebSocket after the component mounts
        this.client = new W3CWebSocket('ws://127.0.0.1:8000/ws/room/' + this.state.room + '/');

        this.client.onopen = () => {
            console.log("WebSocket Client Connected");
        };

        // this.client.onmessage = (message) => {
        //     this.setState((prevState) => ({
        //         messages: [...prevState.messages, message.data],
        //     }));
        // };

        // this.client.onclose = () => {
        //     console.log("WebSocket Disconnected");
        // };
    }

    // componentWillUnmount() {
    //     if (this.client) {
    //         this.client.close();
    //     }
    // }

    render() {
        return (
            <div className="chat-box">
                <h2>Chat Room: {this.state.room}</h2>
                <div>
                    {this.state.messages.map((msg, index) => (
                        <p key={index}>{msg}</p>
                    ))}
                </div>
            </div>
        );
    }
}

export default ChatBox;
