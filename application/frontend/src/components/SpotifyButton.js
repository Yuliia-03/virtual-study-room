import React, { Component } from "react";

export default class SpotifyButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spotifyAuthenticated: false,
            redirecting: false,
            albumUrl: "",
            tracks: [],
            accessToken: '',  
            deviceId: '',     
            currentTrack: null 
        };
        this.fetchAlbumTracks = this.fetchAlbumTracks.bind(this);
    }

    handleUrlChange = (e) => {
        this.setState({ albumUrl: e.target.value });
    };

    componentDidMount() {
        console.log("Component mounted, initiating authentication check.");
        this.authenticateSpotify();
        this.loadSpotifyPlaybackSDK();
    }

    loadSpotifyPlaybackSDK() {
        if (window.Spotify) {
            console.log('Spotify SDK already loaded');
            this.initializeSpotifyPlayer();
        } else {
            console.log('Loading Spotify SDK...');
            const scriptTag = document.createElement('script');
            scriptTag.src = 'https://sdk.scdn.co/spotify-player.js';
            scriptTag.async = true;

            scriptTag.onload = () => {
                console.log('Spotify SDK loaded');
                window.onSpotifyWebPlaybackSDKReady = () => {
                    console.log('Spotify Web Playback SDK ready');
                    this.initializeSpotifyPlayer();
                };
            };

            document.body.appendChild(scriptTag);
        }
    }

    initializeSpotifyPlayer() {
        if (!this.state.accessToken) {
            console.error('Spotify Access Token is missing.');
            return;
        }

        if (!window.Spotify) {
            console.error('Spotify SDK not loaded.');
            return;
        }

        const player = new window.Spotify.Player({
            name: 'Your Web Player',
            getOAuthToken: cb => { cb(this.state.accessToken); },
            volume: 0.5
        });

        player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID:', device_id);
            this.setState({ deviceId: device_id });
        });

        player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
        });

        player.addListener('initialization_error', ({ message }) => {
            console.error('Initialization Error:', message);
        });

        player.addListener('authentication_error', ({ message }) => {
            console.error('Authentication Error:', message);
        });

        player.addListener('account_error', ({ message }) => {
            console.error('Account Error:', message);
        });

        player.connect();
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

    playTrack(trackUri) {
        console.log('Playing track:', trackUri);
        const { deviceId, accessToken } = this.state;
        if (!deviceId) {
            console.error('No Device ID found');
            return;
        }

        const url = `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        };
        const body = JSON.stringify({ uris: [trackUri] });

        fetch(url, { method: 'PUT', headers, body })
            .then(response => {
                if (response.ok) {
                    console.log('Playback initiated');
                } else {
                    console.error('Playback failed:', response.statusText);
                }
            })
            .catch(error => console.error('Error playing track:', error));
    }
    
    getCurrentTrack() {
        const url = 'https://api.spotify.com/v1/me/player/currently-playing';
        const headers = { 'Authorization': `Bearer ${this.state.accessToken}` };

        fetch(url, { headers })
            .then(response => response.json())
            .then(data => {
                if (data && data.item) {
                    this.setState({ currentTrack: data.item });
                    console.log('Current track fetched:', data.item);
                } else {
                    console.log('No track is currently playing');
                }
            })
            .catch(error => console.error('Error fetching current track:', error));
    }

    fetchAccessToken = () => {
        fetch("http://localhost:8000/api/token/", {credentials: "include"})
            .then(response => response.json())
            .then(data => {
                if (data.access_token) {
                    console.log("Access token received:", data.access_token);
                    this.setState({ accessToken: data.access_token }, () => {
                        console.log("Token set in state:", this.state.accessToken);
                        this.loadSpotifyPlaybackSDK();  // Make sure this is called here to ensure token is loaded
                    });
                } else {
                    console.error("Failed to retrieve access token");
                }
            })
            .catch(error => {
                console.error("Error fetching access token:", error);
            });
    }
    
    
    render() {
        return (
            <div>
                {this.state.spotifyAuthenticated ? "Connected to Spotify" : "Not connected"}
                <input
                    type="text"
                    placeholder="Paste Spotify Album URL here"
                    value={this.state.albumUrl}
                    onChange={this.handleUrlChange}
                />
                <button onClick={this.fetchAlbumTracks}>Fetch Tracks</button>
                <button 
                    onClick={() => this.playTrack(this.state.tracks[0]?.uri)}
                    disabled={!this.state.deviceId}  // Disable button if deviceId is not set
                >
                    Play First Track
                </button>
                <button onClick={this.getCurrentTrack}>Get Current Track</button>
                <div>
                    <h3>Album Tracks:</h3>
                    <ul>
                        {this.state.tracks.map(track => (
                            <li key={track.id}>{track.name}</li>
                        ))}
                    </ul>
                    <h3>Currently Playing:</h3>
                    <p>{this.state.currentTrack?.name}</p>
                </div>
            </div>
        );
    }
}