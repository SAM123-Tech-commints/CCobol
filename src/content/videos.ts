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
  provider: "youtube" | "file";
  /** YouTube video ID (from youtu.be/ID) - for provider "youtube" */
  youtubeId?: string;
  /** Direct MP4/WebM URL (archive.org, Cloudflare R2, any CDN) - for provider "file" */
  src?: string;
  title?: string;
  chapters: VideoChapter[];
}

/** Keyed by lesson slug. Add your lectures here. */
export const lessonVideos: Record<string, LessonVideo> = {
  // "school-l1": {
  //   provider: "youtube",
  //   youtubeId: "paste-your-video-id-here",
  //   title: "Lesson 1 - Introduction to COBOL (full lecture)",
  //   chapters: [
  //     { time: 0, label: "History of COBOL" },
  //     { time: 420, label: "COBOL in Today's World" },
  //     { time: 900, label: "Advantages and Disadvantages" },
  //     { time: 1800, label: "COBOL Terminology" },
  //     { time: 3600, label: "The Coding Sheet" },
  //     { time: 5400, label: "Variables, Literals and Constants" },
  //     { time: 6600, label: "Hierarchical Organization of Data" },
  //   ],
  // },
  // "school-l2": {
  //   provider: "file",
  //   src: "https://archive.org/download/your-item/lesson2.mp4",
  //   title: "Lesson 2 - Divisions, PIC clause and VALUE",
  //   chapters: [
  //     { time: 0, label: "Identification Division" },
  //     { time: 600, label: "Environment Division" },
  //     { time: 2400, label: "The PIC clause table" },
  //     { time: 4800, label: "VALUE clause" },
  //   ],
  // },
};

export function videoFor(slug: string): LessonVideo | undefined {
  return lessonVideos[slug];
}
