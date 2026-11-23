# Release notes — SkyFire Education Hub

## v0.1 — Functional development prototype (2026-11-21)

**Separate new application, not a SkyFire Safety Library release.**

- Initial SkyFire-inspired responsive dashboard and training navigation.
- Fictional two-site workforce (240 records), course assignments, and training matrix.
- Core Powered Haulage demonstration course with learning activities and assessment feedback.
- Instructor slideshow, lesson/course authoring, assignments and practical evaluation demonstration.
- Local learning progress, sample records and fictional data export.
- Explicit notices that demo results are not MSHA certifications, equipment authorizations, or production records.

**Not included:** account authentication, production data hosting, MSHA documentation/certification, approval of actual site procedures, full LMS administrative capabilities, or public deployment.

**Status:** development draft, ready for user review and controlled iteration; not production approved.

## v0.2 — Learner Experience (November 22, 2026)

**Status:** Functional fictional-data prototype; not a production LMS.

- Added the approved five-part My Learning workspace, with Assigned Learning always first and Personal Learning as the approved elective section name.
- Added Active Assignments / Completed tabs. Status priority highlights the current cycle without showing an outdated Completed badge on an active recurring assignment. Past cycles are grouped by course and expand to reveal individual completion records.
- Added sorting (urgency, due date, name, progress), status filters, card/compact display, and browser-local learner preferences.
- Added a Course Library with Save for Later and elective enrollment separate from instructor assignments.
- Added soft and hard voluntary enrollment limits (4/10 by default), opt-in warning at the soft threshold, and a hard ceiling. Instructor assignments never consume elective slots.
- Added reusable instructor-authored learning pathways, saved personal versions with added courses, and prerequisite visibility / blocking (required vs recommended), plus batch enrollment for eligible courses.
- Added Instructor Studio pathway authoring, ordering, requirement editing and demo configuration for assignment warning windows.
- Preserved existing Powered Haulage learning experience, training matrix, and documentation exports.
- Improved mobile navigation and retained the exact official SkyFire Safety shield assets in the source and Pages deployment.
- Migrates compatible v0.1 browser-local records to v0.2 in place. No real learners or legally valid qualifications.

**Quality gates:** v0.1 core regression tests and new v0.2 browser tests include course progression, score reporting, learner tabs, prior completion history, course saving/enrollment, prerequisite locks, enrollment warning/cap, instructor pathway authoring and responsive mobile/desktop layouts.

**Next scope:** Full six-stage learning journey interactions and in-context course feedback workflow; advanced portfolio and mentoring remain separate planned milestones.