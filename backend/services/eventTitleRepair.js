const Event = require('../models/Event');

const LEGACY_TITLE_PATTERN = /^Global AI & Web3 Hackathon \d+$/;
const replacementTitles = [
  'AI & Web3 Decentralized Agent Buildathon',
  'Smart Contract and AI Innovation Sprint',
  'Autonomous Agents on Blockchain Hackathon',
  'Decentralized AI Applications Challenge',
  'Web3 Intelligent Systems Hackathon',
  'Blockchain-Powered AI Solutions Sprint',
  'Trustworthy AI Agents for Web3 Challenge'
];

async function repairRepeatedTechnicalEventTitles() {
  const legacyEvents = await Event.find({
    title: LEGACY_TITLE_PATTERN,
    description: 'Build decentralized intelligent agent apps.'
  }).sort({ createdAt: 1, _id: 1 });

  const usedTitles = new Set(
    (await Event.find({ _id: { $nin: legacyEvents.map(event => event._id) } }).select('title').lean())
      .map(event => event.title)
  );

  let updatedCount = 0;
  for (let index = 0; index < legacyEvents.length; index++) {
    const baseTitle = replacementTitles[index] || `AI & Web3 Innovation Challenge ${index + 1}`;
    let title = baseTitle;
    let suffix = 2;
    while (usedTitles.has(title)) title = `${baseTitle} ${suffix++}`;
    usedTitles.add(title);

    const event = legacyEvents[index];
    const result = await Event.updateOne(
      { _id: event._id, title: LEGACY_TITLE_PATTERN },
      { $set: { title } }
    );
    updatedCount += result.modifiedCount || 0;
  }

  return updatedCount;
}

module.exports = { repairRepeatedTechnicalEventTitles };
