import React, { Component } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import "../styles/ChatBox.css";

class ChatBox extends Component {
    //maintains state for all these features
    state = {
        isLoggedIn: false,
        messages: [],
        value: '',
        name: '',
        room: 'testRoom',
    };

    client = null;

    //websocket connnection happens when component is rendered
    componentDidMount() {
        this.client = new W3CWebSocket('ws://127.0.0.1:8001/ws/room/' + this.state.room + '/'); //websocket server it is connecting to
    
        this.client.onopen = () => {
            console.log("WebSocket Client Connected");
        };
    
        this.client.onmessage = (message) => {
            const data = JSON.parse(message.data);
            this.setState((prevState) => ({
                messages: [...prevState.messages, { msg: data.message, name: data.name }],
            }));
        };
    }

    //sends message to server when user submits the form
    onSendMessage = (e) => {
        e.preventDefault();
        if (this.state.value.trim() === "") return;
    
        this.client.send(
            JSON.stringify({
                type: "message",
                message: this.state.value,  //receive message from the server and updates the messages state
                name: this.state.name || "Anonymous",
            })
        );
    
        this.setState({ value: "" });
    };
    

    render() {
        return (
            <div className="chat-box">
                {this.state.isLoggedIn ? (  //display chat room ui if user is logged in *change this *
                    <div>
                        <h2>Room: {this.state.room}</h2>
                        <div className="messages">
                            {this.state.messages.map((message, index) => (
                                <p key={index}>
                                    <strong>{message.name}:</strong> {message.msg}
                                </p>
                            ))}
                        </div>
                        <form onSubmit={this.onSendMessage}>
                            <input 
                                type="text" 
                                value={this.state.value} 
                                onChange={(e) => this.setState({ value: e.target.value })} 
                                placeholder="Type a message..." 
                            />
                            <button type="submit">Send</button>
                        </form>
                    </div>
                ) : (
                    <div>
                        <h2>Join a Chat Room</h2>
                        <input 
                            type="text" 
                            placeholder="Enter your name" 
                            onChange={(e) => this.setState({ name: e.target.value })} 
                        />
                        <button onClick={() => this.setState({ isLoggedIn: true })}>Join</button>
                    </div>
                )}
            </div>
        );
    }
    
}

export default ChatBox;
