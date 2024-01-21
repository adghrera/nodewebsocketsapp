const { Kafka } = require("kafkajs");
const { KAFKA_SERVERS } = require("./const");

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["192.168.1.131:9092"],
});

async function startConsumer(callback) {
  const consumer = kafka.consumer({ groupId: "test-group" });

  await consumer.connect();
  await consumer.subscribe({ topic: "test-topic", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log("KAFKA MESSAGE ", {
        value: message?.value?.toString(),
      });
      if (callback) {
        callback(message.value);
      }
    },
  });
}

module.exports = {
  startConsumer,
};
