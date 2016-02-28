## Install & Start RabbitMQ
[Full instructions here](http://www.rabbitmq.com/download.html)

#### Mac OS X
`brew update`

`brew install rabbitmq`

#### Ubuntu
`sudo apt-get update`

`sudo apt-get install rabbitmq-server`

### Start RabbitMQ
`rabbitmq-server`

## Install & Start MongoDB
[Full instructions here](https://docs.mongodb.org/manual/installation/)

#### Mac OS X
`brew install mongodb`

#### Ubuntu
[Full instructions here](https://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/)

### Start MongoDB

#### Mac OS X
`mongod`

#### Ubuntu
`sudo service mongod start`

## Install Node.js and NPM
[Full instructions here](https://nodejs.org/en/download/package-manager/)

#### Mac OS X
`brew install node`

#### Ubuntu
`curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -`

`sudo apt-get install -y nodejs`

## Install PM2 for process management
`npm install pm2 -g`