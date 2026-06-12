"""Extract iPAS single-choice questions from official/sample exam PDFs into structured rows.

Layout (official 公告試題): three columns
  answer letter (x0 ~82) | question number "N." (x0 ~112) | body: stem + (A)(B)(C)(D) (x0 >125)
Answer letter and its question number share the same row (y).
Body wraps across lines and pages; a question owns all body words between its
number row and the next question's number row (in global reading order).
"""
import re
import sys
import unicodedata


def nfkc(s):
    return unicodedata.normalize("NFKC", s)


def join_words(ws):
    """Join tokens; keep a space only between two ASCII-alphanumeric boundaries
    so English terms stay readable while CJK stays tight."""
    out = ""
    for w in ws:
        if out and out[-1].isascii() and out[-1].isalnum() and w[:1].isascii() and w[:1].isalnum():
            out += " " + w
        else:
            out += w
    return out


def extract(path):
    import fitz
    doc = fitz.open(path)
    answers = []   # (gy, letter)
    numbers = []   # (gy, qnum)
    body = []      # (gy, x0, text)
    PAGE = 100000  # global-y offset per page
    for pi, pg in enumerate(doc):
        off = pi * PAGE
        for x0, y0, x1, y1, w, *_ in pg.get_text("words"):
            gy = off + y0
            nw = nfkc(w)
            if x0 < 95 and re.fullmatch(r"[ABCD]", nw):
                answers.append((gy, nw))
            elif 100 <= x0 <= 125 and re.fullmatch(r"\d{1,3}\.", nw):
                numbers.append((gy, int(nw[:-1])))
            elif x0 > 125:
                body.append((gy, x0, w))
    numbers.sort()
    answers.sort()
    body.sort(key=lambda t: (t[0], t[1]))

    # match each number to nearest answer by global-y
    used = [False] * len(answers)
    def nearest_answer(gy):
        best, bi = 1e9, -1
        for i, (ay, letter) in enumerate(answers):
            if used[i]:
                continue
            d = abs(ay - gy)
            if d < best:
                best, bi = d, i
        if bi >= 0 and best < 8:
            used[bi] = True
            return answers[bi][1]
        return None

    questions = []
    for idx, (gy, qnum) in enumerate(numbers):
        nxt = numbers[idx + 1][0] if idx + 1 < len(numbers) else 1e18
        seg = [w for (wy, wx, w) in body if gy - 6 <= wy < nxt - 6]
        txt = join_words(seg)
        ans = nearest_answer(gy)
        questions.append((qnum, ans, txt))
    return questions


def split_options(txt):
    # stem is text before first option marker; options split on (A)(B)(C)(D),
    # tolerating full-width parens/letters. Keys normalized to half-width.
    parts = re.split(r"[(（]\s*([ABCDＡＢＣＤ])\s*[)）]", txt)
    stem = parts[0].strip(" 　")
    opts = {}
    i = 1
    while i + 1 < len(parts):
        key = nfkc(parts[i])
        val = parts[i + 1].strip(" 　")
        opts[key] = val
        i += 2
    return stem, opts


CJK = r"[　-〿一-鿿＀-￯]"


def clean_cell(s):
    """Normalize a table cell: collapse whitespace, then drop spaces that sit
    between two CJK/full-width chars (artifacts of line wraps), keeping the
    spaces inside English terms."""
    s = re.sub(r"\s+", " ", s.replace("\n", " ")).strip()
    prev = None
    while prev != s:
        prev = s
        s = re.sub(r"(?<=" + CJK + r") (?=" + CJK + r")", "", s)
    return s


def extract_sample(path):
    """Sample PDF is a ruled table: 題號 | 答案 | 題目(stem + inline options).
    Two subject sections; question numbers reset to 1 at 科目二."""
    import pdfplumber
    settings = {"vertical_strategy": "lines", "horizontal_strategy": "lines"}
    out = []  # mutable rows: [subject, qnum, ans, raw_body]
    subject = "ai-basics"
    started = False
    with pdfplumber.open(path) as pdf:
        for pg in pdf.pages:
            for table in pg.extract_tables(settings):
                for raw in table:
                    cells = [c for c in raw if c not in (None, "")]
                    if not cells:
                        continue
                    m = re.match(r"^\s*(\d{1,3})\.\s*$", cells[0])
                    if not m:
                        # continuation of the previous question's body
                        # (options spilled onto the next page), not the header
                        cont = next((c for c in cells if len(c.strip()) > 5
                                     and c.strip() not in ("題號", "答案", "題目")), None)
                        if cont and out:
                            out[-1][3] += " " + cont
                        continue
                    qnum = int(m.group(1))
                    ans, body = None, None
                    for c in cells[1:]:
                        cn = nfkc(c.strip())
                        if ans is None and re.fullmatch(r"[ABCD]", cn):
                            ans = cn
                        elif body is None and len(c.strip()) > 5:
                            body = c
                    if body is None:
                        continue
                    if qnum == 1 and started:
                        subject = "genai"
                    started = True
                    out.append([subject, qnum, ans, body])
    return [(s, q, a, clean_cell(b)) for s, q, a, b in out]


if __name__ == "__main__":
    if sys.argv[1] == "--sample":
        rows = extract_sample(sys.argv[2])
        from collections import Counter
        print("rows:", len(rows), "by subject:", Counter(r[0] for r in rows))
        bad = []
        for subj, qnum, ans, txt in rows:
            stem, opts = split_options(txt)
            if not (ans in "ABCD" and len(opts) == 4 and stem):
                bad.append((subj, qnum, ans, len(opts), bool(stem)))
        print("anomalies:", bad)
        for subj, qnum, ans, txt in rows[:2]:
            stem, opts = split_options(txt)
            print("---", subj, "Q", qnum, "ans", ans)
            print("stem:", stem[:100])
            for k in "ABCD":
                print(" ", k, opts.get(k, "<MISSING>")[:70])
        sys.exit(0)
    path = sys.argv[1]
    qs = extract(path)
    print("questions found:", len(qs))
    bad = []
    for qnum, ans, txt in qs:
        stem, opts = split_options(txt)
        ok = ans in ("A", "B", "C", "D") and len(opts) == 4 and stem
        if not ok:
            bad.append((qnum, ans, len(opts), bool(stem)))
    print("anomalies (qnum, ans, #opts, has_stem):", bad)
    # show first two parsed
    for qnum, ans, txt in qs[:2]:
        stem, opts = split_options(txt)
        print("----- Q", qnum, "ans", ans)
        print("stem:", stem[:120])
        for k in "ABCD":
            print(" ", k, opts.get(k, "<MISSING>")[:80])
