# SkyFire Education Hub — v0.1 Functional Prototype

**Status: development demonstration only.** SkyFire Education is a separate, proposed private learning management platform for mining operations. This repository is a functional prototype made with **fictional workers and fictional training records**. It is not the existing SkyFire Safety Library.

## What works in this prototype

- Familiar SkyFire Safety-inspired visual language: light blue-gray background, white rounded cards, blue headings, orange top accents, and responsive layout.
- Two demonstration operating sites: Quartette (surface) and Spirit Mountain (underground scenario).
- 240 fictional workers, including fictional contractors, with site filtering.
- Training pathways and sample course catalog.
- Complete first demonstration course: **Powered Haulage Safety** with reading, device-narrated audio transcript, interactive scenario, and knowledge assessment.
- Learner enrollment, progress updates, quizzes with feedback, and an instructor presentation mode.
- Instructor Studio: edit course metadata, create additional courses, add lessons or single-question quizzes, and assign training to fictional learners.
- Practical evaluation checklist with fictional evaluator observation notes.
- Training matrix, individual learning evidence and CSV/JSON exports.
- Browser-local persistence and export/import/reset of the fictional demonstration dataset.

## Run locally

No packages or build tools are needed. Serve the folder using an HTTP server because JavaScript modules do not run reliably when the index file is opened directly from the filesystem.

From the directory containing `index.html`:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/` in a modern browser.

On Windows, if `python` is unavailable, try `py -m http.server 8000`.

### Suggested five-minute demonstration

1. In **Course Library**, open **Powered Haulage Safety**.
2. Use the lessons to mark the first two reviewed, answer the scenario safely, and pass the quiz.
3. Open **Training Matrix**, locate fictional worker W-001, and review their status.
4. Change to the **Instructor** demo role. Open **Instructor Studio**, present the course, and record the practical checklist for W-001.
5. Visit **Training Records** for W-001 and export the fictional learning evidence JSON.
6. Edit or add a course lesson in **Instructor Studio**; return to the learner view to see it.

## Important limitations

**Do not use for production training data, personnel information, MSHA certifications, or contractor qualification decisions.**

- No user accounts, login, MFA, security boundary, or enforcement of role/site permissions. Role switching is simulated.
- No server database, concurrent users, shared updates, or trustworthy audit history.
- No approvals for MSHA training plans, instructor authorizations, mine rescue procedures, site operating controls, or course content have been represented.
- Practical evaluations and quizzes are learning demonstrations, not proof of regulatory certification or equipment authorization.
- No Form 5000-23 certificates are issued.
- Browser-local data can be cleared, replaced, or edited. It is not suitable for official record retention.
- The demonstration uses browser speech synthesis for its audio lesson; it does not contain stored audio or approved video media.
- GitHub Pages could host a static demonstration after a separate publication decision, but it is not an appropriate production LMS backend. Do not upload real records to Pages.

## Governance and repository separation

- This project is independent from `SkyFireEHSMining-dev/skyfire-safety-library` and its release/backlog process.
- Prototype implementation does not approve the mine's training requirements or regulatory record workflow.
- Repository creation, production hosting, funding, security, and launch approval are separately controlled.

See `docs/ARCHITECTURE.md` for the production transition strategy and `docs/RELEASE_NOTES.md` for this prototype's scope.