const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Certificate = require('../models/Certificate');

const cloudCourseTitle = /^Cloud Architecture(?:\s+\(archived duplicate [^)]+\))?$/i;
const sampleVideoPattern = /flower|mov_bbb|sample-lesson/i;
const videoFields = ['videoUrl', 'youtubeVideoId', 'videoFile'];

function isSampleVideo(value) {
  return typeof value === 'string' && sampleVideoPattern.test(value);
}

function hasSampleVideo(lesson) {
  return videoFields.some(field => isSampleVideo(lesson[field]));
}

function hasVideoSource(lesson) {
  return videoFields.some(field => lesson[field] && !isSampleVideo(lesson[field]));
}

function courseLessonNumber(lesson, index) {
  return Number(lesson.lessonNumber || lesson.order || index + 1);
}

function normalizeText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function lessonSignature(lessons = []) {
  return lessons
    .map((lesson, index) => ({
      number: courseLessonNumber(lesson, index),
      title: normalizeText(lesson.title),
      description: normalizeText(lesson.description),
      content: normalizeText(lesson.content)
    }))
    .sort((left, right) => left.number - right.number);
}

function hasSameCurriculum(canonical, duplicate) {
  if (normalizeText(canonical.category) !== normalizeText(duplicate.category)) return false;
  return JSON.stringify(lessonSignature(canonical.lessons)) ===
    JSON.stringify(lessonSignature(duplicate.lessons));
}

function assertNoConflictingVideos(canonical, duplicate) {
  const canonicalLessons = lessonSignature(canonical.lessons);
  const duplicateLessons = lessonSignature(duplicate.lessons);
  const canonicalByNumber = new Map(
    (canonical.lessons || []).map((lesson, index) => [courseLessonNumber(lesson, index), lesson])
  );
  const duplicateByNumber = new Map(
    (duplicate.lessons || []).map((lesson, index) => [courseLessonNumber(lesson, index), lesson])
  );

  for (const lesson of canonicalLessons) {
    const canonicalLesson = canonicalByNumber.get(lesson.number);
    const duplicateLesson = duplicateByNumber.get(lesson.number);
    if (!canonicalLesson || !duplicateLesson) continue;

    for (const field of videoFields) {
      const current = canonicalLesson[field];
      const incoming = duplicateLesson[field];
      if (current && incoming && !isSampleVideo(current) && !isSampleVideo(incoming) && current !== incoming) {
        throw new Error(
          `Cloud Architecture records have different valid ${field} mappings for lesson ${lesson.number}; no records were changed.`
        );
      }
    }
  }
}

function mergeVideoMapping(target, source) {
  for (const field of videoFields) {
    if ((!target[field] || isSampleVideo(target[field])) && source[field] && !isSampleVideo(source[field])) {
      target[field] = source[field];
    }
  }
  if ((!target.videoType || target.videoType === 'local') && source.videoType && hasVideoSource(source)) {
    target.videoType = source.videoType;
  }
}

function valuesForReferences(courseIds, lessonIds) {
  const courseIdStrings = courseIds.map(id => String(id));
  const lessonIdStrings = lessonIds.map(id => String(id));
  return {
    courseIdStrings,
    lessonIdStrings,
    query: {
      $or: [
        { courseId: { $in: courseIds } },
        { course: { $in: courseIds } },
        { courseId: { $in: courseIdStrings } },
        { course: { $in: courseIdStrings } },
        { lessonId: { $in: lessonIdStrings } },
        { completedLessons: { $in: lessonIdStrings } },
        { referenceId: { $in: courseIdStrings } }
      ]
    }
  };
}

function effectiveCourseId(document, duplicateIds, canonicalId) {
  for (const field of ['courseId', 'course']) {
    const value = document[field];
    if (value && duplicateIds.has(String(value))) return String(canonicalId);
    if (value) return String(value);
  }
  return '';
}

function assertNoUniqueReferenceCollisions(collectionName, documents, duplicateIds, canonicalId) {
  const uniqueFields = {
    courseregistrations: ['user', 'course'],
    lessonprogresses: ['userId', 'courseId', 'lessonId'],
    certificates: ['userId', 'courseId'],
    quizzes: ['courseId']
  }[collectionName];
  if (!uniqueFields) return;

  const seen = new Set();
  for (const document of documents) {
    const fields = uniqueFields.map(field => {
      if (field === 'course' || field === 'courseId') {
        return effectiveCourseId(document, duplicateIds, canonicalId);
      }
      return String(document[field] || '');
    });
    const key = fields.join('|');
    if (key.includes('||')) continue;
    if (seen.has(key)) {
      throw new Error(
        `Cannot consolidate Cloud Architecture records: ${collectionName} has conflicting unique records. No records were changed.`
      );
    }
    seen.add(key);
  }
}

async function writeBackup(snapshot) {
  const backupDirectory = path.join(__dirname, '..', 'backups');
  await fs.promises.mkdir(backupDirectory, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDirectory, `course-repair-${timestamp}-${process.pid}.json`);
  await fs.promises.writeFile(backupPath, JSON.stringify(snapshot, null, 2), { flag: 'wx' });
  return backupPath;
}

async function backupAndDeduplicateCourseRecords() {
  const allCourses = await Course.find({});
  const allLessons = await Lesson.find({});
  const cloudCourses = allCourses
    .filter(course => cloudCourseTitle.test(course.title))
    .sort((left, right) => {
      const leftCanonical = normalizeText(left.title) === 'cloud architecture' ? 0 : 1;
      const rightCanonical = normalizeText(right.title) === 'cloud architecture' ? 0 : 1;
      return leftCanonical - rightCanonical ||
        new Date(left.createdAt || 0) - new Date(right.createdAt || 0) ||
        String(left._id).localeCompare(String(right._id));
    });

  const canonical = cloudCourses[0] || null;
  const duplicates = canonical ? cloudCourses.slice(1) : [];
  const duplicateIds = duplicates.map(course => course._id);
  const duplicateIdSet = new Set(duplicateIds.map(String));
  const cloudIds = cloudCourses.map(course => course._id);
  const cloudExternalLessons = allLessons.filter(lesson =>
    cloudIds.some(id => String(id) === String(lesson.courseId))
  );
  const sampleCourses = allCourses.filter(course =>
    (course.lessons || []).some(hasSampleVideo)
  );
  const sampleLessons = allLessons.filter(hasSampleVideo);
  const cloudCertificates = canonical
    ? await Certificate.find({
      $or: [
        { courseId: { $in: cloudIds } },
        { course: { $in: cloudIds } }
      ]
    })
    : [];
  const certificatesNeedCourseNameUpdate = cloudCertificates.some(
    certificate => certificate.courseName !== 'Cloud Architecture'
  );

  if (canonical) {
    for (const duplicate of duplicates) {
      if (!hasSameCurriculum(canonical, duplicate)) {
        throw new Error(
          `Cloud Architecture record ${duplicate._id} has a different curriculum; no records were changed.`
        );
      }
      assertNoConflictingVideos(canonical, duplicate);
    }

    const canonicalExternalLessons = cloudExternalLessons
      .filter(lesson => String(lesson.courseId) === String(canonical._id));
    for (const duplicateLesson of cloudExternalLessons.filter(lesson =>
      duplicateIds.some(id => String(id) === String(lesson.courseId))
    )) {
      const number = courseLessonNumber(duplicateLesson, 0);
      const target = canonicalExternalLessons.find(lesson =>
        courseLessonNumber(lesson, 0) === number
      );
      if (!target) continue;
      if (normalizeText(target.title) !== normalizeText(duplicateLesson.title) ||
          normalizeText(target.description) !== normalizeText(duplicateLesson.description) ||
          normalizeText(target.content) !== normalizeText(duplicateLesson.content)) {
        throw new Error(
          `Cloud Architecture external lesson ${number} differs between records; no records were changed.`
        );
      }
      for (const field of videoFields) {
        const current = target[field];
        const incoming = duplicateLesson[field];
        if (current && incoming && !isSampleVideo(current) && !isSampleVideo(incoming) && current !== incoming) {
          throw new Error(
            `Cloud Architecture external lessons have different valid ${field} mappings for lesson ${number}; no records were changed.`
          );
        }
      }
    }

    const slugConflict = await Course.findOne({
      slug: 'cloud-architecture',
      _id: { $ne: canonical._id }
    }).select('_id title');
    if (slugConflict) {
      throw new Error(
        `Cannot assign the Cloud Architecture slug: it is already used by "${slugConflict.title}" (${slugConflict._id}).`
      );
    }
  }

  const needsCanonicalUpdate = canonical && (
    canonical.title !== 'Cloud Architecture' ||
    canonical.slug !== 'cloud-architecture' ||
    duplicates.length > 0 ||
    certificatesNeedCourseNameUpdate
  );
  const needsBackup = duplicates.length > 0 || needsCanonicalUpdate ||
    sampleCourses.length > 0 || sampleLessons.length > 0;
  if (!needsBackup) {
    return { backupPath: null, removedCourses: 0, removedLessons: 0 };
  }

  let relatedDocuments = {};
  let referenceInfo = { query: { $or: [] }, courseIdStrings: [], lessonIdStrings: [] };
  const embeddedLessonIds = [];
  if (duplicates.length > 0 || certificatesNeedCourseNameUpdate) {
    for (const duplicate of duplicates) {
      for (const lesson of duplicate.lessons || []) {
        embeddedLessonIds.push(lesson._id);
      }
    }
    const externalLessonIds = cloudExternalLessons
      .map(lesson => lesson._id);
    referenceInfo = valuesForReferences(cloudIds, [...embeddedLessonIds, ...externalLessonIds]);

    const collections = await mongoose.connection.db.listCollections({ type: 'collection' }).toArray();
    for (const { name } of collections) {
      if (name === Course.collection.name || name === Lesson.collection.name) continue;
      const collection = mongoose.connection.db.collection(name);
      const documents = await collection.find(referenceInfo.query).toArray();
      if (documents.length) relatedDocuments[name] = documents;
      if (duplicates.length > 0 &&
          (name === 'courseregistrations' ||
          name === 'lessonprogresses' ||
          name === 'certificates' ||
          name === 'quizzes')) {
        const allCourseDocuments = await collection.find({
          $or: [
            { courseId: { $in: cloudIds } },
            { course: { $in: cloudIds } }
          ]
        }).toArray();
        assertNoUniqueReferenceCollisions(name, allCourseDocuments, duplicateIdSet, canonical._id);
      }
    }
  }

  const affectedCourseIds = new Set([
    ...sampleCourses.map(course => String(course._id)),
    ...cloudCourses.map(course => String(course._id))
  ]);
  const backupPath = await writeBackup({
    database: mongoose.connection.name,
    backedUpAt: new Date().toISOString(),
    courses: allCourses
      .filter(course => affectedCourseIds.has(String(course._id)))
      .map(course => course.toObject()),
    lessons: allLessons
      .filter(lesson =>
        sampleLessons.some(sample => String(sample._id) === String(lesson._id)) ||
        cloudIds.some(id => String(id) === String(lesson.courseId))
      )
      .map(lesson => lesson.toObject()),
    relatedDocuments
  });

  let removedLessons = 0;
  if (canonical) {
    const embeddedLessonMap = new Map();
    const canonicalEmbedded = new Map(
      (canonical.lessons || []).map((lesson, index) => [
        courseLessonNumber(lesson, index),
        lesson
      ])
    );
    for (const duplicate of duplicates) {
      for (const [index, duplicateLesson] of (duplicate.lessons || []).entries()) {
        const number = courseLessonNumber(duplicateLesson, index);
        const canonicalLesson = canonicalEmbedded.get(number);
        if (canonicalLesson) {
          mergeVideoMapping(canonicalLesson, duplicateLesson);
          if (duplicateLesson._id) {
            embeddedLessonMap.set(String(duplicateLesson._id), String(canonicalLesson._id));
          }
        }
      }
    }

    canonical.title = 'Cloud Architecture';
    canonical.slug = 'cloud-architecture';
    canonical.lessons = Array.from(canonicalEmbedded.values());
    await canonical.save();

    const canonicalExternalLessons = cloudExternalLessons
      .filter(lesson => String(lesson.courseId) === String(canonical._id));
    const canonicalExternalByNumber = new Map(
      canonicalExternalLessons.map((lesson, index) => [
        courseLessonNumber(lesson, index),
        lesson
      ])
    );
    const externalLessonMap = new Map();
    const externalLessonsToRemove = [];
    for (const lesson of cloudExternalLessons) {
      if (String(lesson.courseId) === String(canonical._id)) continue;
      const number = courseLessonNumber(lesson, 0);
      const target = canonicalExternalByNumber.get(number);
      if (target && normalizeText(target.title) === normalizeText(lesson.title)) {
        if (normalizeText(target.description) !== normalizeText(lesson.description) ||
            normalizeText(target.content) !== normalizeText(lesson.content)) {
          throw new Error(
            `Cloud Architecture lesson ${number} differs between records; no duplicate lessons were removed.`
          );
        }
        mergeVideoMapping(target, lesson);
        await target.save();
        externalLessonMap.set(String(lesson._id), String(target._id));
        externalLessonsToRemove.push(lesson._id);
      } else {
        lesson.courseId = canonical._id;
        await lesson.save();
        canonicalExternalByNumber.set(number, lesson);
      }
    }

    const allLessonIdMap = new Map([...embeddedLessonMap, ...externalLessonMap]);

    for (const [name, documents] of Object.entries(relatedDocuments)) {
      const collection = mongoose.connection.db.collection(name);
      for (const document of documents) {
        const update = {};
        for (const field of ['courseId', 'course']) {
          if (document[field] && duplicateIdSet.has(String(document[field]))) {
            update[field] = typeof document[field] === 'string'
              ? String(canonical._id)
              : canonical._id;
          }
        }
        if (typeof document.courseId === 'string' && duplicateIdSet.has(document.courseId)) {
          update.courseId = String(canonical._id);
        }
        if (typeof document.course === 'string' && duplicateIdSet.has(document.course)) {
          update.course = String(canonical._id);
        }
        if (typeof document.lessonId === 'string' && allLessonIdMap.has(document.lessonId)) {
          update.lessonId = allLessonIdMap.get(document.lessonId);
        }
        if (Array.isArray(document.completedLessons)) {
          update.completedLessons = document.completedLessons.map(value =>
            allLessonIdMap.get(String(value)) || value
          );
        }
        if (typeof document.referenceId === 'string' && duplicateIdSet.has(document.referenceId)) {
          update.referenceId = String(canonical._id);
        }
        if (name === 'certificates' &&
            [document.courseId, document.course].some(value =>
              value && cloudIds.some(id => String(id) === String(value))
            ) &&
            document.courseName !== 'Cloud Architecture') {
          update.courseName = 'Cloud Architecture';
        }
        if (Object.keys(update).length) {
          await collection.updateOne({ _id: document._id }, { $set: update });
        }
      }
    }

    if (externalLessonsToRemove.length) {
      const result = await Lesson.deleteMany({ _id: { $in: externalLessonsToRemove } });
      removedLessons = result.deletedCount || 0;
    }
    if (duplicateIds.length) {
      await Course.deleteMany({ _id: { $in: duplicateIds } });
    }
  }

  return {
    backupPath,
    removedCourses: duplicateIds.length,
    removedLessons
  };
}

async function removeSampleVideoMappings() {
  let removedMappings = 0;
  const courseDocs = await Course.find({});
  for (const course of courseDocs) {
    let changed = false;
    for (const lesson of course.lessons || []) {
      for (const field of videoFields) {
        if (isSampleVideo(lesson[field])) {
          lesson[field] = '';
          removedMappings++;
          changed = true;
        }
      }
    }
    if (changed) await course.save();
  }

  const lessons = await Lesson.find({});
  for (const lesson of lessons) {
    let changed = false;
    for (const field of videoFields) {
      if (isSampleVideo(lesson[field])) {
        lesson[field] = '';
        removedMappings++;
        changed = true;
      }
    }
    if (changed) await lesson.save();
  }
  return removedMappings;
}

module.exports = {
  backupAndDeduplicateCourseRecords,
  hasSampleVideo,
  isSampleVideo,
  removeSampleVideoMappings
};
