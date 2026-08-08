import glob, json

for f in glob.glob('templates/*.json'):
    try:
        data = json.load(open(f))
        changed = False
        for sec in ['ticker', 'sticky_cta']:
            if 'sections' in data and sec in data['sections']:
                del data['sections'][sec]
                changed = True
            if 'order' in data and sec in data['order']:
                data['order'].remove(sec)
                changed = True
        if changed:
            with open(f, 'w') as out:
                json.dump(data, out, indent=2)
            print(f"Removed static sections from {f}")
    except Exception as e:
        print(f"Error processing {f}: {e}")
