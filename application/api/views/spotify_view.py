from django.shortcuts import render, redirect
from api.credentials import REDIRECT_URI, CLIENT_ID, CLIENT_SECRET
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from requests import Request, post,get
from api.utils import Spotify_API
import re
from api.models import SpotifyToken
class AuthURL(APIView):
    def get(self, request, format=True):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)
    
def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')
    if not request.session.exists(request.session.session_key):
        request.session.create()

    spotify_api = Spotify_API()
    spotify_api.update_or_create_user_tokens(
        request.session.session_key, access_token, token_type, expires_in, refresh_token
    )

    return redirect('http://localhost:3000/musicPlayer')
    
class IsAuthenticated(APIView):
    def get(self, request, format=None):
        spotify_api = Spotify_API()
        is_authenticated = spotify_api.is_spotify_authenticated(
            self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)
    

class GetAlbumTracks(APIView):
    def post(self, request, *args, **kwargs):
        album_url = request.data.get('album_url')
        session_id = request.session.session_key

        if not session_id:
            request.session.create()
            session_id = request.session.session_key

        # Extract Album ID from URL
        album_id_match = re.search(r'spotify:album:(\w+)', album_url) or re.search(r'album/(\w+)', album_url)
        if not album_id_match:
            return Response({"Error": "Invalid Spotify URL"}, status=status.HTTP_400_BAD_REQUEST)

        album_id = album_id_match.group(1)
        spotify_api = Spotify_API()
        tokens = spotify_api.get_user_tokens(session_id)
        if not tokens:
            return Response({"Error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        headers = {'Authorization': f'Bearer {tokens.access_token}'}
        response = get(f'https://api.spotify.com/v1/albums/{album_id}/tracks', headers=headers)  # Corrected to use requests.get

        if response.status_code != 200:
            return Response({"Error": "Failed to fetch album tracks"}, status=response.status_code)

        return Response(response.json(), status=status.HTTP_200_OK)
    
class GetSpotifyToken(APIView):
    def get(self, request, format=None):
        session_id = request.session.session_key
        if not session_id:
            request.session.create()
            session_id = request.session.session_key
            print(f"New session created: {session_id}")
        else:
            print(f"Existing session: {session_id}")

        token = SpotifyToken.objects.filter(user=session_id).first()
        if token:
            print(f"Token found for session_id={session_id}: {token.access_token}")
            return Response({'access_token': token.access_token}, status=status.HTTP_200_OK)
        else:
            print(f"No token found for session_id={session_id}")
            return Response({'error': 'No token available'}, status=status.HTTP_404_NOT_FOUND)
