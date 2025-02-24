from django.urls import path
from .views.login_page import login
#from.views.calendar import event_list
urlpatterns = [
    path('views/login-page', login),
    #path('calendar/', event_list),
]