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

The most import settings to change are likely:

**host**

**port**

**amqp.host**

**amqp.queue**

**db.mongo.host**
