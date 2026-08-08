import glob, json

for f in glob.glob('templates/*.json'):
    try:
        data = json.load(open(f))
        changed = False
        if 'sections' in data and 'ticker' in data['sections']:
            del data['sections']['ticker']
            changed = True
        if 'order' in data and 'ticker' in data['order']:
            data['order'].remove('ticker')
            changed = True
        if changed:
            with open(f, 'w') as out:
                json.dump(data, out, indent=2)
            print(f"Removed ticker from {f}")
    except Exception as e:
        print(f"Error processing {f}: {e}")
