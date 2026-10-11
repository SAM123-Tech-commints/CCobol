/** Video lecture sources for lessons.
 *
 *  HOW TO ADD YOUR 2-HOUR LECTURE (free + unlimited):
 *
 *  Option A - YouTube (recommended for 2-hour videos):
 *    1. Verify your account once at youtube.com/verify (phone number) -
 *       this raises the upload limit from 15 minutes to 12 hours.
 *    2. Upload the video, set visibility to UNLISTED (not searchable,
 *       only people with the link / your site can watch).
 *    3. Copy the ID from the URL: youtu.be/<THIS_PART>  or  watch?v=<THIS_PART>
 *    4. Add an entry below with provider "youtube" and that ID.
 *
 *  Option B - Archive.org (direct MP4, no ads, truly unlimited):
 *    1. Create a free account at archive.org and upload your video.
 *    2. Open the item and copy the direct file URL, e.g.
 *       https://archive.org/download/my-lesson-1/lesson1.mp4
 *    3. Add an entry below with provider "file" and that URL as src.
 *
 *  Option C - Google Drive (semi-private, but NO clickable chapters -
 *    use the plain embed iframe; chapters only work with A or B):
 *    <iframe src="https://drive.google.com/file/d/FILE_ID/preview" ... />
 *
 *  Chapters: `time` is SECONDS into the video. Click a chapter to jump there.
 */

export interface VideoChapter {
  /** Seconds into the video */
  time: number;
  label: string;
}

export interface LessonVideo {
  provider: "youtube" | "file" | "drive";
  /** YouTube video ID (from youtu.be/ID) - for provider "youtube" */
  youtubeId?: string;
  /** Direct MP4/WebM URL (archive.org, Cloudflare R2, any CDN) - for provider "file" */
  src?: string;
  /** Google Drive file ID (from drive.google.com/file/d/<THIS>/view) - for provider "drive" */
  driveId?: string;
  title?: string;
  chapters: VideoChapter[];
}

/** Keyed by lesson slug. The special key "school" shows on the School page. */
export const lessonVideos: Record<string, LessonVideo> = {
  // Your 2-hour lecture recording (Google Drive).
  // IMPORTANT: in Drive, right-click the file -> Share -> set
  // "Anyone with the link" (Viewer), or the embed shows a login wall.
  "school": {
    provider: "drive",
    driveId: "1L1F9uHnu1pljmJSIXV1BvVux2CwfadOo",
    title: "COBOL Lecture - 1st Semester (full recording)",
    chapters: [
      // TODO: adjust these times (seconds) to where each section starts
      { time: 0, label: "Lesson 1 - Introduction to COBOL" },
      { time: 1800, label: "Lesson 2 - Divisions, PIC clause and VALUE" },
      { time: 3600, label: "Lesson 3 - Condition Statements" },
      { time: 5400, label: "Lesson 4 - PERFORM" },
    ],
  },
  // To attach a video to ONE lesson instead, move the entry to that slug, e.g.:
  // "school-l1": { provider: "drive", driveId: "...", chapters: [...] },
  //
  // Recommended upgrade for the FULL experience (clickable timeline):
  // upload the same video to YouTube (unlisted, verify your phone first) or
  // archive.org (direct MP4), then switch provider to "youtube"/"file" -
  // then every chapter becomes click-to-jump.
};

export function videoFor(slug: string): LessonVideo | undefined {
  return lessonVideos[slug];
}
