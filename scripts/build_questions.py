"""Build the two beginner question banks (questions.json) from the source PDFs.

ai-basics = official 科目1 (50) + sample 科目一 (35)
genai     = official 科目2 (50) + sample 科目二 (35)
"""
import glob
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from extract_questions import extract, extract_sample, split_options

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BEG = os.path.join(ROOT, "初級")
APP = os.path.join(ROOT, "ipas-study-app", "src", "data", "beginner")

OFFICIAL = {
    "ai-basics": [f for f in glob.glob(os.path.join(BEG, "114*第一科*.pdf")) if "11.20" in f][0],
    "genai": [f for f in glob.glob(os.path.join(BEG, "114*第二科*.pdf")) if "11.20" in f][0],
}
SAMPLE = [f for f in glob.glob(os.path.join(BEG, "iPAS*樣題*.pdf")) if "20251226" not in f][0]
PREFIX = {"ai-basics": "AB", "genai": "GA"}


def to_question(level, subject, source, qnum, ans, txt):
    stem, opts = split_options(txt)
    options = [{"key": k, "text": opts[k]} for k in "ABCD" if k in opts]
    # id form: AB-114-4-Q001 / AB-sample-Q001
    tag = "114-4" if source == "114-4-official" else "sample"
    qid = f"{PREFIX[subject]}-{tag}-Q{qnum:03d}"
    return {
        "id": qid, "level": level, "subject": subject, "source": source,
        "stem": stem, "options": options, "answer": ans, "tags": [],
    }


def build_subject(subject):
    rows = []
    for qnum, ans, txt in extract(OFFICIAL[subject]):
        rows.append(to_question("beginner", subject, "114-4-official", qnum, ans, txt))
    for subj, qnum, ans, txt in extract_sample(SAMPLE):
        if subj == subject:
            rows.append(to_question("beginner", subject, "114-09-sample", qnum, ans, txt))
    return rows


def validate(rows):
    errs = []
    seen = set()
    for q in rows:
        if q["id"] in seen:
            errs.append(f"dup id {q['id']}")
        seen.add(q["id"])
        if not q["stem"]:
            errs.append(f"empty stem {q['id']}")
        keys = [o["key"] for o in q["options"]]
        if len(q["options"]) != 4:
            errs.append(f"{len(q['options'])} options {q['id']}")
        if q["answer"] not in keys:
            errs.append(f"answer {q['answer']} not in options {q['id']}")
    return errs


def main():
    for subject in ("ai-basics", "genai"):
        rows = build_subject(subject)
        errs = validate(rows)
        out = os.path.join(APP, subject, "questions.json")
        with open(out, "w", encoding="utf-8") as fh:
            json.dump(rows, fh, ensure_ascii=False, indent=2)
        n_off = sum(1 for q in rows if q["source"] == "114-4-official")
        n_smp = sum(1 for q in rows if q["source"] == "114-09-sample")
        print(f"{subject}: {len(rows)} questions (official {n_off}, sample {n_smp}) -> {out}")
        print("  errors:", errs if errs else "none")


if __name__ == "__main__":
    main()
