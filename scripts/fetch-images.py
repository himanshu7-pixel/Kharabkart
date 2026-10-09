import json, sys, urllib.parse, urllib.request, os
UA = {"User-Agent": "KharabKart/1.0 (hackathon demo; himanshu91355@gmail.com)"}
OUT = os.path.join(os.path.dirname(__file__), "..", "client", "public", "products")
QUERIES = {
  "cow-dung-cake": "cow dung cakes drying wall India",
  "birthday-belt": "leather belt buckle",
  "cake-for-face": "pie in the face",
  "chappal": "Kolhapuri chappal",
  "shoes": "sneakers pair shoes",
  "belan": "rolling pin wooden",
  "kalchhul": "ladle soup kitchen",
  "big-spoons": "wooden spoons kitchen",
  "cheese-sharam": "cheese wheels",
  "private-jet": "Gulfstream G650 landing",
  "chartered-plane": "Bombardier Challenger 350",
  "boeing-777": "Boeing 777-300ER takeoff",
  "airbus": "Airbus A380 Emirates",
  "helicopter": "Bell 407 helicopter",
  "mortuary-room": "mortuary refrigerator morgue",
  "fridge": "refrigerator open kitchen",
  "birthday-eggs": "eggs in carton",
  "trick-candles": "birthday candles lit",
  "gift-box-air": "cardboard box",
  "popped-balloons": "deflated balloon",
  "dimag": "human brain model",
  "akal": "incandescent light bulb white background",
  "sabr": "sand timer hourglass",
  "izzat": "crown jewels gold",
  "neend": "sleeping cat pillow",
  "crispy-tawa": "tawa griddle",
  "pressure-cooker": "pressure cooker stainless steel",
  "brick-biscuit": "stack of red bricks",
  "soap-paneer": "bars of soap",
  "bullock-cart": "bullock cart India",
  "hot-air-balloon": "hot air balloon",
  "submarine": "submarine underway surface navy",
  "rocket": "rocket launch",
  "single-ice-cube": "ice cubes close-up",
  "desert-cooler": "air cooler evaporative India",
  "igloo": "igloo snow",
  "hand-fan": "folding fan paper",
}
only = sys.argv[1:]
skip = {}
if os.path.exists(os.path.join(os.path.dirname(__file__), "image-skip.json")):
    skip = json.load(open(os.path.join(os.path.dirname(__file__), "image-skip.json")))
credits = {}
cpath = os.path.join(OUT, "CREDITS.json")
if os.path.exists(cpath): credits = json.load(open(cpath))
for slug, q in QUERIES.items():
    if only and slug not in only: continue
    params = {"action":"query","format":"json","generator":"search","gsrnamespace":"6",
              "gsrsearch": q + " filetype:bitmap","gsrlimit":"15","prop":"imageinfo",
              "iiprop":"url|mime|extmetadata","iiurlwidth":"640"}
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    data = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA)))
    pages = sorted(data.get("query",{}).get("pages",{}).values(), key=lambda p: p.get("index", 99))
    for p in pages:
        ii = p["imageinfo"][0]
        if p["title"] in skip.get(slug, []): continue
        if ii["mime"] not in ("image/jpeg","image/png"): continue
        img = urllib.request.urlopen(urllib.request.Request(ii["thumburl"], headers=UA)).read()
        open(os.path.join(OUT, slug + ".jpg"), "wb").write(img)
        md = ii.get("extmetadata", {})
        credits[slug] = {"file": p["title"], "page": ii["descriptionurl"],
            "license": md.get("LicenseShortName",{}).get("value",""),
            "artist": md.get("Artist",{}).get("value","")}
        print(slug, "->", p["title"], credits[slug]["license"])
        break
    else:
        print(slug, "-> NOTHING FOUND")
json.dump(credits, open(cpath, "w"), indent=2, ensure_ascii=False)
