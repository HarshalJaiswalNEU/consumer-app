const env = process.env;
console.log("Consumer")
const Kafka = require('node-rdkafka');
const { Client } = require('@elastic/elasticsearch')
const fs = require("fs");
const logger = require('simple-node-logger').createSimpleLogger();

const client = new Client({
    node: env.ELASTIC_ENDPOINT,
    maxRetries: 5,
    requestTimeout: 60000
})

client.info().then(console.log, console.log)

// create a stream with broker list, options and topic
const consumer = Kafka.KafkaConsumer({
    'group.id': 'helm-chart-dependency',
    'metadata.broker.list': env.KAFKA_BROKER
}, {})

consumer.connect();

consumer.on('ready', () => {
    console.log('Consumer testing')
    consumer.subscribe([env.KAFKA_TOPIC])
    consumer.consume();
}).on('data', async (data) => {
    // console.log(`The message is received: ${data.value}`)
    let parsedData = JSON.parse(data.value);
    // console.log('parsedData ',parsedData)
    let {index, search_id, ...indexData} = {...parsedData}
    console.log("search Id: ", search_id," kafka topic: ", env.KAFKA_TOPIC)

    await client.update({
        index: parsedData.index,
        id: parsedData.search_id,
        doc: {
            task: indexData.task,
            summary: indexData.summary,
            duedate: indexData.dueDate,
            priority: indexData.priority
        }
    })
})