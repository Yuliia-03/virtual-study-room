import React, { Component } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import "../styles/ChatBox.css";



// const styles = {
//     paper: {
//       marginTop: "64px",
//       display: "flex",
//       flexDirection: "column",
//       alignItems: "center",
//     },
//     avatar: {
//       margin: "8px",
//       backgroundColor: "#f50057",
//     },
//     form: {
//       width: "100%",
//       marginTop: "8px",
//     },
//     submit: {
//       margin: "24px 0 16px",
//     },
//     root: {
//       boxShadow: "none",
//     },
//   };
class ChatBox extends Component {
    state = {
        isLoggedIn: true,
        messages: [],
        value: '',
        name: '',
        room: 'testRoom',
    };

    client = null;

    // componentDidMount() {
    //     // Initialize WebSocket after the component mounts
    //     this.client = new W3CWebSocket('ws://127.0.0.1:8000/ws/room/' + this.state.room + '/');

    //     this.client.onopen = () => {
    //         console.log("WebSocket Client Connected");
    //     };
    // }

    componentDidMount() {
        this.client = new W3CWebSocket('ws://127.0.0.1:8000/ws/room/' + this.state.room + '/');
    
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

    onSendMessage = (e) => {
        e.preventDefault();
        if (this.state.value.trim() === "") return;
    
        this.client.send(
            JSON.stringify({
                type: "message",
                message: this.state.value,
                name: this.state.name || "Anonymous",
            })
        );
    
        this.setState({ value: "" });
    };
    
    
    // render() {
    //     const { classes } = this.props; 
    //     return (
    //         <div className="chat-box">
    //             {this.state.isLoggedIn ? <div>a</div> : <div>b</div>}
    //         </div>
    //     );
    // }

    render() {
        return (
            <div className="chat-box">
                {this.state.isLoggedIn ? (
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
