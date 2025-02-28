"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', TemplateView.as_view(template_name='index.html')),
    path('api/signup/', views.signup, name='signup'),
    path('api/login/', views.login, name='login'),
    
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/todolists/<str:is_shared>/', views.ViewToDoList.as_view(), name='to_do_list'),
    
    path('api/update_task/<int:task_id>/', views.ViewToDoList.as_view(), name='update_task_status'),
    path('api/new_task/', views.ViewToDoList.as_view(), name='create_new_task'),
    path('api/delete_task/<int:id>/', views.ViewToDoList.as_view(), name='delete_task'),

    path('api/new_list/', views.ViewToDoList.as_view(), name='create_new_list'),
    path('api/delete_list/<int:id>/',views.ViewToDoList.as_view(), name='delete_list'),
] 
