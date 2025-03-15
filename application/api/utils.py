from datetime import datetime, timedelta
from calendar import HTMLCalendar
from .models.events import Event
from .models.spotify_token import SpotifyToken
from django.utils import timezone

class Calendar(HTMLCalendar):
	def __init__(self, year=None, month=None):
		self.year = year
		self.month = month
		super(Calendar, self).__init__()

	# formats a day as a td
	# filter events by day
	def formatday(self, day, events):
		events_per_day = events.filter(start_time__day=day)
		d = ''
		for event in events_per_day:
			d += f'<li> {event.title} </li>'

		if day != 0:
			return f"<td><span class='date'>{day}</span><ul> {d} </ul></td>"
		return '<td></td>'

	# formats a week as a tr 
	def formatweek(self, theweek, events):
		week = ''
		for d, weekday in theweek:
			week += self.formatday(d, events)
		return f'<tr> {week} </tr>'

	# formats a month as a table
	# filter events by year and month
	def formatmonth(self, withyear=True):
		events = Event.objects.filter(start_time__year=self.year, start_time__month=self.month)

		cal = f'<table border="0" cellpadding="0" cellspacing="0" class="calendar">\n'
		cal += f'{self.formatmonthname(self.year, self.month, withyear=withyear)}\n'
		cal += f'{self.formatweekheader()}\n'
		for week in self.monthdays2calendar(self.year, self.month):
			cal += f'{self.formatweek(week, events)}\n'
		return cal
	

class Spotify_API():
	def get_user_tokens(self, session_id):
		user_tokens = SpotifyToken.objects.filter(user=session_id)
		if user_tokens.exists():
			return user_tokens
		else:
			return None
		
	def update_or_create_user_tokens(self, session_id, access_token, token_type, expires_in, refresh_token):
		tokens = self.get_user_tokens(session_id)
		expires_in = timezone.now() + timedelta(seconds=expires_in)
		if tokens:
			tokens.access_token = access_token
			tokens.refresh_token = refresh_token
			tokens.expires_in = expires_in
			tokens.token_type = token_type
			tokens.save(update_fields = ['access_token', 'refresh_token', 'expires_in', 'token_type'])
		else:
			tokens = SpotifyToken(user=session_id, access_token=access_token, refresh_token=refresh_token, token_type=token_type, expires_in=expires_in)
			tokens.save()