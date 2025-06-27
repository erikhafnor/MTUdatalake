import csv

# Import your mapping dictionary
from variable_mapping import VARIABLE_LABELS_UNITS

def parse_hl7_file(filepath):
    parsed_data = []
    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            if line.startswith('OBX'):
                fields = line.split('|')
                variable_id = fields[3]
                value = fields[5]
                # Try to get unit from OBX-6, else from mapping
                unit = fields[6] if len(fields) > 6 and fields[6] else VARIABLE_LABELS_UNITS.get(variable_id, {}).get('unit', '')
                label = VARIABLE_LABELS_UNITS.get(variable_id, {}).get('label', variable_id)
                # Optionally get timestamp from OBX-14 (fields[14])
                timestamp = fields[14] if len(fields) > 14 else ''
                parsed_data.append({
                    'variable_id': variable_id,
                    'label': label,
                    'value': value,
                    'unit': unit,
                    'timestamp': timestamp
                })
    return parsed_data

if __name__ == "__main__":
    hl7_file = "incoming/hl7-data.txt"
    data = parse_hl7_file(hl7_file)
    # Example: print as CSV
    with open('parsed_hl7.csv', 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=['variable_id', 'label', 'value', 'unit', 'timestamp'])
        writer.writeheader()
        for row in data:
            writer.writerow(row)
    print("Parsing complete. Output written to parsed_hl7.csv")