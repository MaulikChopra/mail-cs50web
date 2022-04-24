release: python manage.py collectstatic
release: python manage.py migrate
web: gunicorn project3.wsgi --log-file -
