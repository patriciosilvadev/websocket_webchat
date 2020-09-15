const { MongoClient, ObjectID } = require('mongodb');
const fs = require('fs');

// Replace the uri string with your MongoDB deployment's connection string.
const options = { useUnifiedTopology: true };
const uri = 'mongodb://root:password@localhost:27017/?serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-256&3t.uriVersion=3&3t.connection.name=Local+LiveChat';

const client = new MongoClient(uri, options);

async function addCannedResponses(database) {
  const collection = database.collection('livechat_canned_response');
  // create a document to be inserted
  const obj = JSON.parse(fs.readFileSync('setup/livechatCannedResponses.json', 'utf8'));
  for (let i = 0; i < obj.responses.length; i++) {
    let doc = { ...obj.responses[i] };
    doc._id = ObjectID(obj.responses[i]._id);
    doc.user = ObjectID(obj.responses[i].user);
    doc.created_at = new Date(Date.now());
    doc.updated_at = new Date(Date.now());
    const result = await collection.replaceOne({ _id: doc._id }, doc, { upsert: true });

    console.log(
      `CannedResponses Documents were inserted with the _id: ${doc._id}`,
    );
  }
}

async function addAccessControl(database) {
  const collection = database.collection('livechat_access_control');
  // create a document to be inserted
  const obj = JSON.parse(fs.readFileSync('setup/livechatAccessControl.json', 'utf8'));
  for (let i = 0; i < obj.responses.length; i++) {
    let doc = { ...obj.responses[i] };
    doc._id = new ObjectID(obj.responses[i]._id);
    const result = await collection.replaceOne({ _id: doc._id }, doc, { upsert: true });

    console.log(
      `AccessControl Documents were inserted with the _id: ${doc._id}`,
    );
  }
}

async function addAgentGroup(database) {
  const collection = database.collection('livechat_agent_group');
  // create a document to be inserted
  const livechatAccessObj = JSON.parse(fs.readFileSync('setup/livechatAccessControl.json', 'utf8'));
  let accessArray = [];
  for (let i = 0; i < livechatAccessObj.responses.length; i++) {
    accessArray.push(ObjectID(livechatAccessObj.responses[i]._id));
  }

  const obj = JSON.parse(fs.readFileSync('setup/livechatAgentGroup.json', 'utf8'));
  for (let i = 0; i < obj.responses.length; i++) {
    let doc = { ...obj.responses[i] };
    doc._id = new ObjectID(obj.responses[i]._id);
    doc.access_control_ids = accessArray;
    doc.created_at = new Date(Date.now());
    doc.updated_at = new Date(Date.now());
    const result = await collection.replaceOne({ _id: doc._id }, doc, { upsert: true });

    console.log(
      `AgentGroup Documents were inserted with the _id: ${doc._id}`,
    );
  }
}

async function addDefaultUser(database) {
  const collection = database.collection('livechat_agent');
  // create a document to be inserted
  const obj = JSON.parse(fs.readFileSync('setup/livechatUser.json', 'utf8'));
  for (let i = 0; i < obj.responses.length; i++) {
    let doc = { ...obj.responses[i] };
    doc._id = new ObjectID(obj.responses[i]._id);
    doc.created_at = new Date(Date.now());
    doc.updated_at = new Date(Date.now());
    doc.livechat_agent_group_id = new ObjectID(obj.responses[i].livechat_agent_group_id);
    const result = await collection.replaceOne({ _id: doc._id }, doc, { upsert: true });

    console.log(
      `DefaultUser Documents were inserted with the _id: ${doc._id}`,
    );
  }
}

async function run() {
  try {
    await client.connect();

    const database = client.db('sample_mflix');
    await addCannedResponses(database);
    await addAccessControl(database);
    await addAgentGroup(database);
    await addDefaultUser(database);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);