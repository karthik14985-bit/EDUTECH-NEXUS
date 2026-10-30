const User = require('../models/User');
const XPTransaction = require('../models/XPTransaction');
const XPConfig = require('../models/XPConfig');

function calculateLevel(xp) {
  // Level progression: Level 1: 0-249, Level 2: 250-499, Level 3: 500-749, etc.
  return Math.floor(Math.max(0, xp) / 250) + 1;
}

async function getXPConfig() {
  let config = await XPConfig.findOne({ key: 'default_xp_config' });
  if (!config) {
    config = await XPConfig.create({
      key: 'default_xp_config',
      courseRegistration: 10,
      lessonCompletion: 50,
      quizPass: 100,
      courseCompletion: 100,
      certificateClaim: 200,
      eventParticipation: 50,
      gameParticipation: 20,
      gameAchievement: 50
    });
  }
  return config;
}

async function awardXP(userId, actionOrAmount, description, optionsOrSource = 'course') {
  let xp = 0;
  let action = 'lesson_completion';
  let source = 'course';
  let referenceId = '';

  if (typeof optionsOrSource === 'object' && optionsOrSource !== null) {
    source = optionsOrSource.source || (optionsOrSource.courseId ? 'course' : 'platform');
    referenceId = optionsOrSource.referenceId || (optionsOrSource.lessonId ? `${optionsOrSource.courseId}:${optionsOrSource.lessonId}` : optionsOrSource.courseId) || '';
  } else if (typeof optionsOrSource === 'string') {
    source = optionsOrSource;
  }

  if (typeof actionOrAmount === 'number') {
    xp = actionOrAmount;
    action = source === 'game' ? 'game_achievement' : (source === 'quiz' ? 'quiz_pass' : 'lesson_completion');
  } else {
    action = actionOrAmount;
    const config = await getXPConfig();
    switch (action) {
      case 'course_registration':
        xp = config.courseRegistration || 10;
        break;
      case 'lesson_completion':
        xp = 50; // Requirement 26: 50 XP per lesson
        break;
      case 'quiz_pass':
        xp = 100; // Requirement 26: 100 XP for quiz
        break;
      case 'course_completion':
        xp = 100;
        break;
      case 'certificate_claim':
        xp = 200; // Requirement 26: 200 XP for certificate
        break;
      case 'event_participation':
        xp = config.eventParticipation || 50;
        break;
      case 'game_participation':
        xp = config.gameParticipation || 20;
        break;
      case 'game_achievement':
        xp = config.gameAchievement || 50;
        break;
      default:
        xp = 50;
    }
  }

  if (!Number.isFinite(xp) || xp <= 0) return null;

  const desc = description || `Awarded ${xp} XP for ${action.replace(/_/g, ' ')}`;

  const transaction = await XPTransaction.create({
    userId,
    studentId: userId,
    user: userId,
    action,
    xp,
    amount: xp,
    description: desc,
    reason: desc,
    source,
    referenceId: String(referenceId || '')
  });

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { xp } },
    { new: true }
  );

  if (user) {
    user.level = calculateLevel(user.xp);
    await user.save();
  }

  return { transaction, user, xpAwarded: xp };
}

module.exports = { awardXP, calculateLevel, getXPConfig };
