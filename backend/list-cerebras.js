const Cerebras = require('@cerebras/cerebras_cloud_sdk').default;
require('dotenv').config();
async function main() {
  const client = new Cerebras({ apiKey: process.env.CEREBRAS_API_KEY });
  const models = await client.models.list();
  console.log(JSON.stringify(models, null, 2));
}
main().catch(console.error);
