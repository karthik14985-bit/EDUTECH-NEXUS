const Internship = require('../models/Internship');

const LEGACY_TITLE = 'Cloud DevOps Associate Intern';
const LEGACY_DESCRIPTION = 'Hands-on Kubernetes and Terraform automation internship.';
const replacementTitles = [
  'Kubernetes Platform Engineering Intern',
  'Infrastructure as Code Intern',
  'Cloud Deployment Automation Intern',
  'Container Orchestration Intern',
  'Cloud Reliability Engineering Intern',
  'DevOps Tooling Intern',
  'Cloud Operations Intern'
];

async function repairRepeatedCloudInternshipTitles() {
  const legacyInternships = await Internship.find({
    title: LEGACY_TITLE,
    company: /^Nexus Cloud Labs \d+$/,
    category: 'Cloud Engineering',
    description: LEGACY_DESCRIPTION
  }).sort({ createdAt: 1, _id: 1 });

  let updatedCount = 0;
  for (let index = 0; index < Math.min(legacyInternships.length, replacementTitles.length); index++) {
    const internship = legacyInternships[index];
    const result = await Internship.updateOne(
      { _id: internship._id, title: LEGACY_TITLE },
      { $set: { title: replacementTitles[index] } }
    );
    updatedCount += result.modifiedCount || 0;
  }

  return updatedCount;
}

module.exports = { repairRepeatedCloudInternshipTitles };
