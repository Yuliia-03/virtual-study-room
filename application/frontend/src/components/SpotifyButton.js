import React, { Component } from "react";

export default class SpotifyButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spotifyAuthenticated: false,
            redirecting: false,
        };
    }

    componentDidMount() {
        console.log("Component mounted, initiating authentication check.");
        this.authenticateSpotify();
    }

    authenticateSpotify() {

        if (this.state.spotifyAuthenticated) {
            console.log("User is already authenticated.");
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('code')) {
            console.log("Authorization code received, skipping redirect.");
            return;
        }

        fetch("http://localhost:8000/api/is-authenticated", {credentials: "include"})
            .then(response => response.json())
            .then(data => {
                console.log("Authentication status received:", data.status);
                this.setState({ spotifyAuthenticated: data.status });
                if (!data.status && !this.state.redirecting) {
                    console.log("User not authenticated, fetching auth URL.");
                    this.setState({ redirecting: true }); 
                    fetch("http://localhost:8000/api/get-auth-url", {credentials: "include"})
                        .then(response => response.json())
                        .then(data => {
                            console.log("Redirecting to Spotify login:", data.url);
                            // Using window.location.replace to ensure the history is replaced not to fall back to the same unauthenticated state
                            window.location.replace(data.url);
                        });
                }
            })
            .catch(error => {
                console.error("Error during authentication process:", error);
            });
    }

    render() {
        return (
            <div>
                {this.state.spotifyAuthenticated ? "Connected to Spotify" : "Not connected"}
            </div>
        );
    }
}