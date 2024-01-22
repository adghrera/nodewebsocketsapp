const { Kafka } = require("kafkajs");
const {
  KAFKA_SERVERS,
  KAFKA_CONNECTION_TIMEOUT,
  KAFKA_CLIENT,
  KAFKA_TOPIC,
} = require("./const");

const kafka = new Kafka({
  clientId: KAFKA_CLIENT,
  brokers: KAFKA_SERVERS,
  connectionTimeout: KAFKA_CONNECTION_TIMEOUT,
});

async function sendMsg({ from, msg }) {
  const producer = kafka.producer();
  await producer.connect();
  await producer.send({
    topic: KAFKA_TOPIC,
    messages: [
      { key: String(Date.now()), value: JSON.stringify({ from, msg }) },
    ],
  });
  await producer.disconnect();
  console.log("SENT KAFKA MESSAGE: ", { from, msg });
}

module.exports = {
  sendMsg,
};
