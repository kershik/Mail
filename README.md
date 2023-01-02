# Mail
Front-end for an email client that makes API calls to send and receive emails. 

## Getting started

1. Clone the repo

```
git clone git@github.com:kershik/Mail.git
```

2. Go to Mail directory.

```
cd Mail
```

2. Make migrations for mail app.

```
python manage.py makemigrations mail
```

3. Apply migrations to your database.

```
python manage.py migrate
```
4. Run server.

```
python manage.py runserver
```
