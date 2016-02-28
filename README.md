
## Requirements
* [Node.js](http://nodejs.org/) -- v5.6.0
* [RabbitMQ](http://www.rabbitmq.com/) -- v3.6.0
* [MongoDB](https://www.mongodb.org/) -- v3.2.1
* [PM2](http://pm2.keymetrics.io/) -- v1.0.1

## Install requirements
Consult [INSTALL.md](INSTALL.md)

## Clone the repo
`git clone https://github.com/anderfjord/node-wordcount`

## Change into the project directory
`cd node-wordcount`

## Configure the app
Consult [CONFIG.md](CONFIG.md)

## Install local Node.js dependencies
`npm install`

## Start the app
`pm2 start config/pm2.json`

## Run tests
`npm test`

## Run tests with code coverage
`npm run coverage`