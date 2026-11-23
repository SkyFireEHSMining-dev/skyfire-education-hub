# SkyFire Education Hub — v0.2 Learner Experience

**Development demonstration only — fictional employees, sites, and records.**

SkyFire Education Hub is a separate prototype from SkyFire Safety Library. It models instructor-managed training alongside self-directed learning, planning, and role-specific development for fictional surface and underground mining operations.

## Demonstration links

- Live fictional-data site: https://skyfireehsmining-dev.github.io/skyfire-education-hub/
- Source branch: `main`
- GitHub Pages branch: `demo-pages` (separate published copy)

## New in v0.2

- **My Learning** with five sections: Assigned Learning, Personal Learning, My Pathway, My Achievements, and Explore Learning.
- **Assigned Learning** has Active Assignments and Completed tabs, precise primary statuses, due-date countdowns, due-soon threshold, recurring-cycle indicator, grouped completion history, optional expanded records, and configurable card/compact views, sorting and filtering.
- **Personal Learning** separates voluntary enrollments, saved-for-later courses, and completed electives. Saving a course never creates an assignment or deadline.
- **Enrollment controls**: default soft warning above 4 active voluntary courses, default hard cap of 10; mandatory assignments are exempt. Thresholds are configurable within demo settings; no production governance decisions are implied.
- **Learning Pathways**: instructor-designed groups of existing courses, saved personal pathways, personalized course additions, independent or recommended/required prerequisites, visible locked courses, and individual or eligible-batch enrollment.
- **Instructor Studio** supports creating and editing pathways, adding existing courses, ordering steps, assigning required or recommended prerequisite links, and configuring due-soon warning thresholds.
- Improved mobile navigation with a menu that opens without horizontal clipping.
- Learners can preview optional courses but cannot record assessment or completion progress without enrollment or an instructor assignment.
- Browser-local v0.1 data is upgraded to the v0.2 data structure without intentionally discarding progress or user-created courses.

## Existing v0.1 workflows retained

- Powered Haulage Safety sample course: reading, synthesized narration, interactive scenario, quiz, and instructor presentation.
- Fictional employee dataset across Quartette and Spirit Mountain; instructor course authoring and practical-evaluation demonstration.
- Training matrix, sample learning evidence and CSV/JSON export, demo data import/reset.
- The official SkyFire Safety shield logo is reused without modification from `SkyFireEHSMining-dev/skyfire-safety-library`.

## Local development

Run from the repository root:

```bash
python -m http.server 8000
```

Open http://localhost:8000/ and test in a modern browser. The `index.html` app uses JavaScript modules; use an HTTP server rather than opening it as a local file.

```bash
python tests/smoke.py
python tests/test_v02.py
python tools_build_standalone.py
```

Browser QA runs with Playwright and a local Chromium installation. The standalone builder creates a synthetic single-file test artifact; the GitHub Pages demo uses the application module files.

### Suggested demonstration sequence

1. Change the **Demo role** to Learner. Open **My Learning**, inspect Active Assignments, then expand the grouped Completed history.
2. Switch between Card and Compact views. Change assignment sorting and filtering.
3. Open the **Course Library**, save an elective for later, then enroll. Return to **Personal Learning**.
4. Save the **Future Mine Supervisor** pathway. Observe the visible **Advanced Supervisory Decisions** prerequisite lock. Enroll in **Leading Through Listening** and complete its introductory lesson to satisfy that example prerequisite.
5. Switch to Instructor. Open **Instructor Studio**, build a sample pathway from existing courses, establish a prerequisite, and assign sample training to fictional learners.
6. Revisit the Powered Haulage Safety instructor presentation and reporting tools.

## Safety, privacy and compliance boundaries

**Do not upload real people, certifications, evidence, workplace video, regulated training records, or personal information.** The demo's storage is browser-local and neither authenticated nor secure. Demo roles do not enforce access restrictions; visible course locks are instructional prototypes, not production authorization. Local changes on one device do not synchronize with other devices.

A lesson completion, quiz pass, practical observation or simulated equivalent-course credit is **not** MSHA Part 48 certification, equipment qualification, or mine authorization. Training plan validation, authorized instructor/evaluator workflows, controlled records, cybersecurity, independent audit trails, and the production platform remain separate future engineering requirements.

Future features (not implemented in v0.2): complete six-stage mastery/coaching workflows, learner feedback queue, portable encrypted Portfolio Vault, real equivalency approval workflows, real authentication, supporting evidence media storage, workplace training certification, official records retention.

See `docs/ARCHITECTURE.md` and `docs/RELEASE_NOTES.md`.