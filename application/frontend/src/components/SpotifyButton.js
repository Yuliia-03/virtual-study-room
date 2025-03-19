import React, { Component } from "react";

export default class SpotifyButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spotifyAuthenticated: false,
            redirecting: false,
            albumUrl: "",
            tracks: [],
        };
        this.fetchAlbumTracks = this.fetchAlbumTracks.bind(this);
    }

    handleUrlChange = (e) => {
        this.setState({ albumUrl: e.target.value });
    };

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

    fetchAlbumTracks = () => {
        const albumUrl = this.state.albumUrl;
        const match = albumUrl.match(/album\/([a-zA-Z0-9]+)/);
        if (match) {
            const albumId = match[1];
            fetch("http://localhost:8000/api/get-album-tracks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ album_url: this.state.albumUrl })
            })
            .then(response => response.json())
            .then(data => {
                console.log("Tracks fetched:", data);
                // Assuming 'data' is the array of tracks
                this.setState({ tracks: data.items }); // Adjust 'items' based on your actual data structure
            })
            .catch(error => {
                console.error("Error fetching tracks:", error);
                this.setState({ error: "Failed to fetch tracks" });
            });
        } else {
            console.error("Invalid Spotify URL");
            this.setState({ error: "Invalid Spotify URL" });
        }
    }
    
    render() {
        return (
            <div>
                {this.state.spotifyAuthenticated ? "Connected to Spotify" : "Not connected"}
                <input
                    type="text"
                    placeholder="Paste Spotify Album URL here"
                    value={this.state.albumUrl}
                    onChange={this.handleUrlChange}  // Already defined function for handling changes
                />
                <button onClick={this.fetchAlbumTracks}>Fetch Tracks</button>
                <div>
                    <h3>Album Tracks:</h3>
                    {this.state.tracks.length > 0 ? (
                        <ul>
                            {this.state.tracks.map(track => (
                                <li key={track.id}>{track.name}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>{this.state.error || "No tracks to display"}</p>
                    )}
                </div>
            </div>
        );
    }
    
    
}