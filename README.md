Run

node server.js
Heroku

heroku login
heroku create chat-socket
git push heroku master
heroku ps:scale web=1
heroku open

heroku logs --tail
heroku run bash