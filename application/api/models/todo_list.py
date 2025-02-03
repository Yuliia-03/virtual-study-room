from django.db import models
class toDoList(models.Model):
    list_id = models.CharField(max_length=255, primary_key=True)
    title = models.CharField(max_length=255, blank=False)
    content = models.CharField(max_length=255)
    creation_date = models.DateField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)
    is_shared = models.BooleanField(default=False)

    def __str__(self):
        return(f"{self.title}")