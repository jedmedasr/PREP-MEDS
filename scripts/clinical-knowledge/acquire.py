"""Bounded primary-PDF acquisition and two-reader passage checks, NOT clinical AI review."""
import argparse
import datetime
import hashlib
import io
import json
import pathlib
import re
import subprocess
import tempfile
import unicodedata
import urllib.parse
import urllib.request
from pypdf import PdfReader

HOSTS = {"www.esge.com", "gi.org", "www.bsg.org.uk", "mediacdn.gi.org"}
MAX_BYTES = 12 * 1024 * 1024

def sha(data):
    return hashlib.sha256(data).hexdigest()

def normalize(text):
    text = unicodedata.normalize("NFKC", text).replace("\u00ad", "").replace("\x02", "")
    text = re.sub(r"(?<=[A-Za-z])[-\u2010]\s*\n(?=[A-Za-z])", "", text)
    return re.sub(r"\s+", " ", text).strip()

def allowed(url):
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme != "https" or parsed.hostname not in HOSTS or parsed.username or parsed.password or parsed.port not in (None, 443):
        raise ValueError("SOURCE_URL_NOT_ALLOWED")
    return url

class SafeRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return super().redirect_request(req, fp, code, msg, headers, allowed(newurl))

def inspect(source, capture=False):
    request = urllib.request.Request(allowed(source["url"]), headers={"User-Agent":"PREP-MEDS-source-integrity/1.0"})
    with urllib.request.build_opener(SafeRedirect()).open(request, timeout=40) as response:
        allowed(response.url)
        raw = response.read(MAX_BYTES + 1)
        if len(raw) > MAX_BYTES or not raw.startswith(b"%PDF-"):
            raise ValueError("NOT_A_BOUNDED_PDF")
    raw_hash = sha(raw)
    if not capture and raw_hash != source.get("rawSha256"):
        raise ValueError("SOURCE_REVISION_CHANGED_OR_UNPINNED")
    reader = PdfReader(io.BytesIO(raw))
    result = {"sourceId":source["id"],"version":source["version"],"rawSha256":raw_hash,
              "url":source["url"],"pages":len(reader.pages),"checkedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),
              "method":"pypdf-and-poppler-passage-match","semanticVerification":"NOT_PERFORMED","passages":[],"contexts":[]}
    with tempfile.TemporaryDirectory(prefix="prep-source-") as directory:
        pdf = pathlib.Path(directory) / "source.pdf"
        pdf.write_bytes(raw)
        page_numbers = sorted({p["page"] for p in source["passages"] + source["contextLocations"]})
        for number in page_numbers:
            a = normalize(reader.pages[number-1].extract_text())
            b = normalize(subprocess.check_output(["pdftotext","-f",str(number),"-l",str(number),str(pdf),"-"], timeout=30).decode("utf-8"))
            result["contexts"].append({"page":number,"readerAHash":sha(a.encode()),"readerBHash":sha(b.encode()),"fullContextRetained":False})
            for passage in [p for p in source["passages"] if p["page"] == number]:
                quote = normalize(passage["quote"])
                b_passage = b
                region = passage.get("readerBRegion")
                if region:
                    if len(region) != 4 or any(not isinstance(v, (int, float)) or v < 0 or v > 1 for v in region) or region[0]+region[2]>1 or region[1]+region[3]>1:
                        raise ValueError("INVALID_SOURCE_REGION")
                    box = reader.pages[number-1].mediabox
                    x,y,w,h = [int(v*float(box.width if i%2==0 else box.height)) for i,v in enumerate(region)]
                    b_passage = normalize(subprocess.check_output(["pdftotext","-f",str(number),"-l",str(number),"-r","72","-x",str(x),"-y",str(y),"-W",str(w),"-H",str(h),str(pdf),"-"], timeout=30).decode("utf-8"))
                matches = [quote in a, quote in b_passage]
                result["passages"].append({"id":passage["id"],"page":number,"matches":matches,"readerBRegion":region,"quoteSha256":sha(passage["quote"].encode()),"deepLink":source["url"]+"#page="+str(number)})
                if not all(matches):
                    raise ValueError("PASSAGE_MISMATCH:"+passage["id"]+":"+str(matches))
    result["status"] = "PASSAGE_MATCH_ONLY"
    return result

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--capture", action="store_true")
    parser.add_argument("--output", default="knowledge-artifacts/source-check.json")
    args = parser.parse_args()
    registry = json.loads(pathlib.Path("clinical-knowledge/source-register.json").read_text())
    report = {"schemaVersion":1,"mode":"capture" if args.capture else "pinned-verification","sources":[],"errors":[],"independentClinicalAgents":0,"modelCalls":0,"clinicalVerificationComplete":False}
    for source in registry["sources"]:
        try:
            report["sources"].append(inspect(source, args.capture))
        except Exception as error:
            report["errors"].append({"sourceId":source["id"],"error":str(error),"status":"UNVERIFIED"})
    output = pathlib.Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2)+"\n")
    print(json.dumps(report, indent=2))
    raise SystemExit(1 if report["errors"] else 0)

if __name__ == "__main__":
    main()
