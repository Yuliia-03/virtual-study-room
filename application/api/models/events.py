from django.db import models

class Appointments(models.Model):
    name = models.CharField(max_length= 200)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    comments = models.CharField(max_length= 500, blank=True, null=True)
    status = models.CharField(max_length= 100, null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now = True)

    def __str__(self):
        return self.name