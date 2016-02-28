Copy `config/host.json-dist` to `config/host.json`

The contents of `config/host.json` should look something like this:

```javascript
{
    "host": "localhost",
    "port": 3000,
    "name": "Wordcount",
    "amqp": {
        "host": "localhost",
        "user": "guest",
        "pass": "guest",
        "queue": "wordcount",
        "max_message_size": 50000
    },
    "db": {
        "mongo": {
            "host": "localhost",
            "port": 27017,
            "user": "dbuser",
            "password": "123456",
            "database": "wordcounts"
        }
    }
}
```

Setting | Description
--- | --- 
**host** | IP or hostname of the local machine
**port** | Port on the local machine on which the API listens
**name** | Name for this application
**amqp.host** | IP or hostname of the machine on which the AMQP message queue (in this case, RabbitMQ) is running
**amqp.user** | Uses the guest account by default
**amqp.pass** | Uses the guest account by default
**amqp.queue** | Name of the queue on which to pass count requests to workers
**amqp.max_message_size** | Max size in bytes of messages passed via AMQP. Data exceeding this limit will be chunked.
**db.mongo.host** | IP or hostname of the machine on which MongoDB is running
**db.mongo.port** | Port on which to connect to MongoDB, which by default is 27017
**db.mongo.user** | MongoDB user
**db.mongo.password** | MongoDB password
**db.mongo.database** | Default database to use



