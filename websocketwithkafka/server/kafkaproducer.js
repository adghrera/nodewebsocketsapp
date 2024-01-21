const { Kafka } = require("kafkajs");
const { KAFKA_SERVERS } = require("./const");

const kafka = new Kafka({
  clientId: "my-app",
  brokers: KAFKA_SERVERS,
});

async function sendMsg({ from, msg }) {
  const producer = kafka.producer();
  await producer.connect();
  await producer.send({
    topic: "test-topic",
    messages: [{ from, msg }],
  });
  await producer.disconnect();
  console.log("SENT KAFKA MESSAGE: ", { from, msg });
}

module.exports = {
  sendMsg,
};
