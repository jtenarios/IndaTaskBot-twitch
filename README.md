# webpack-basics

Proyecto usado como ejemplo en el video:
https://youtu.be/2UBKjshUwM8
https://www.youtube.com/watch?v=bZD8qcJIEIE&list=PL9T-KKyKXNCl7XuLL-U7i1TFg78HKCB8C&index=2

Este es el resultado final del ejemplo.
Pueden entontrar el código inicial que pueden usar para seguir el ejemplo en el branch *starting-code*.

Muchas gracias


npm i webpack-dev-server -D
###### cambiar los require por import de EMC6
npm install
npm i tmi.js --dev



npm i node-fetch --save
npm install --save-dev webpack webpack-cli
npm install exports-loader --save-dev # Para poder usar exports en otros .js # https://webpack.js.org/loaders/exports-loader/

npm i nodemon -g

nodemon ./src/server.js


# Crear fichero .env con las claves
# USERNAME = 'xxx'
# PASSWORD = 'xxx'
# CHANNELS ='xxx'
# 
# CLIENT_ID = 'xxx'
# CLIENT_SECRET = 'xxx'


# npm install jquery
# npm install animate.css --save # https://animate.style/

# npm install dotenv-webpack --save-dev // https://www.npmjs.com/package/dotenv-webpack"# jymybot-twitch"  git init

# Como consigo que me funcione en local:
#     0. Poner el webpack.config.js en versio local
#     1. npm run build --> Construir el proyecto
#     2. Heroku local --> Arrancar el servidor en http://localhost:5000/
#

# Comando para subir a heroku
#     0. Poner el webpack.config.js en versio Heroku
#     1. npm run build --> Construir el proyecto
#     2. Guardar los cambios en github
#     3. Desplegar la rama Heroku-branch