const { Kafka } = require("kafkajs");
const {
  KAFKA_SERVERS,
  KAFKA_CONNECTION_TIMEOUT,
  KAFKA_TOPIC,
  KAFKA_GROUP,
  KAFKA_CLIENT,
} = require("./const");

const kafka = new Kafka({
  clientId: KAFKA_CLIENT,
  brokers: KAFKA_SERVERS,
  connectionTimeout: KAFKA_CONNECTION_TIMEOUT,
});

async function startConsumer(callback) {
  const consumer = kafka.consumer({ groupId: KAFKA_GROUP });

  await consumer.connect();
  await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log("KAFKA MESSAGE ", {
        value: message?.value?.toString(),
      });
      if (callback) {
        callback(message?.value?.toString());
      }
    },
  });
}

module.exports = {
  startConsumer,
};
