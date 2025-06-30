import csv
import socket
import json
from datetime import datetime

from variable_mapping import (
    VARIABLE_LABELS_UNITS,
    VENTILATION_MODE_CODES,
    ENDOTRACHEAL_TUBE_TYPE_CODES,
    LANGUAGE_CODES,
    PATIENT_CATEGORY_CODES,
    DEVICE_GAS_TYPE_CODES,
    BREATH_TRIGGER_STATUS_CODES,
    BITFIELD_801,
    BITFIELD_802,
    BITFIELD_803,
    BITFIELD_804,
    DEVICE_DISPLAYED_UNIT_CODE_OF_PRESSURE,
    DEVICE_DISPLAYED_UNIT_CODE_OF_FLOW,
    AIRWAY_PRESSURE_MEASUREMENT_SOURCE,
    FLOW_MEASUREMENT_SOURCE,
    O2_MEASUREMENT_SOURCE,
    ON_OFF_CODES,
    CALIBRATION_STATUS_CODES,
    FLOW_SENSOR_TYPE_CODES,
    DEVICE_OPERATION_MODE_CODES,
    DEVICE_DISPLAYED_UNIT_CODE_OF_CO2,
    SIGH_BREATH_STATUS_CODES,
    DEVICE_MODEL_CODES,
    BACKUP_MODE_ACTIVE_STATUS_CODES,
    UNIT_CODE_MAP,
)

def decode_bitfield(value, bitfield_map):
    try:
        int_value = int(value)
    except (ValueError, TypeError):
        return {}
    return {
        desc: bool(int_value & (1 << bit))
        for bit, desc in bitfield_map.items()
    }

def parse_hl7_string(hl7_string):
    """
    Parse a single HL7 message string (as received from MLLP) and return parsed data.
    """
    # Split on both \r and \n, as HL7 segments are usually separated by \r
    lines = [line.strip() for line in hl7_string.replace('\r', '\n').split('\n') if line.strip()]
    return process_hl7_message(lines)

def parse_hl7_file(filepath):
    parsed_data = []
    with open(filepath, 'r') as f:
        message_lines = []
        for line in f:
            line = line.strip()
            if line.startswith('MSH'):
                # Process previous message
                if message_lines:
                    parsed_data.extend(process_hl7_message(message_lines))
                message_lines = [line]
            else:
                message_lines.append(line)
        # Process last message
        if message_lines:
            parsed_data.extend(process_hl7_message(message_lines))
    return parsed_data

def process_hl7_message(lines):
    # First, find device type and serial number
    device_type = None
    device_serial = None
    for line in lines:
        if line.startswith('OBR'):
            fields = line.split('|')
            for field in fields:
                if '^Elisa 800' in field:
                    device_type = 'Elisa 800'
        if line.startswith('OBX'):
            fields = line.split('|')
            if str(fields[3]).strip() == "1913":
                device_serial = fields[5]
    # Only process if device is Elisa 800
    if device_type != 'Elisa 800':
        return []
    # Now parse OBX lines as before, using the found device_serial for all
    result = []
    for line in lines:
        if line.startswith('OBX'):
            fields = line.split('|')
            variable_id = str(fields[3]).strip()
            value = fields[5]
            unit = fields[6] if len(fields) > 6 and fields[6] else VARIABLE_LABELS_UNITS.get(variable_id, {}).get('unit', '')
            label = VARIABLE_LABELS_UNITS.get(variable_id, {}).get('label', variable_id)
            unit_short = UNIT_CODE_MAP.get(str(unit), "")
            timestamp = fields[14] if len(fields) > 14 else ''
            # Use the imported mappings for value_description
            if variable_id == "538":
                value_desc = LANGUAGE_CODES.get(value, value)
            elif variable_id == "584":
                value_desc = VENTILATION_MODE_CODES.get(value, value)
            elif variable_id == "6388":
                value_desc = ENDOTRACHEAL_TUBE_TYPE_CODES.get(value, value)
            elif variable_id == "1410":
                value_desc = PATIENT_CATEGORY_CODES.get(value, value)
            elif variable_id == "2996":
                value_desc = DEVICE_GAS_TYPE_CODES.get(value, value)
            elif variable_id == "1959":
                value_desc = BREATH_TRIGGER_STATUS_CODES.get(value, value)
            elif variable_id == "8545":
                value_desc = DEVICE_DISPLAYED_UNIT_CODE_OF_PRESSURE.get(value, value)
            elif variable_id == "8546":
                value_desc = DEVICE_DISPLAYED_UNIT_CODE_OF_FLOW.get(value, value)
            elif variable_id == "8556":
                value_desc = AIRWAY_PRESSURE_MEASUREMENT_SOURCE.get(value, value)
            elif variable_id == "8557":
                value_desc = FLOW_MEASUREMENT_SOURCE.get(value, value)
            elif variable_id == "8558":
                value_desc = O2_MEASUREMENT_SOURCE.get(value, value)
            #elif variable_id in ["8581", "2046", "5712", "5713", "826", "810", "811", "8301", "812", "8601", "822", "8625", "8622", "8623", "8626", "8589", "8613"]:
            #    value_desc = ON_OFF_CODES.get(value, value)
            elif variable_id == "386":
                value_desc = CALIBRATION_STATUS_CODES.get(value, value)
            elif variable_id == "2899":
                value_desc = FLOW_SENSOR_TYPE_CODES.get(value, value)
            elif variable_id == "7452":
                value_desc = DEVICE_OPERATION_MODE_CODES.get(value, value)
            elif variable_id == "2895":
                value_desc = DEVICE_DISPLAYED_UNIT_CODE_OF_CO2.get(value, value)
            elif variable_id == "3888":
                value_desc = SIGH_BREATH_STATUS_CODES.get(value, value)
            elif variable_id == "50203":
                value_desc = DEVICE_MODEL_CODES.get(value, value)
            elif variable_id == "8627":
                value_desc = BACKUP_MODE_ACTIVE_STATUS_CODES.get(value, value)
            else:
                # Use label-based mapping for ON/OFF alarms and errors
                if any(word in label.lower() for word in ["alarm", "failure", "error"]):
                    value_desc = ON_OFF_CODES.get(value, value)
                    alarm_on = int(value == "1")
                else:
                    value_desc = value
                    alarm_on = None
                # Bitfield decoding
            bitfield_status = None
            if variable_id == "801":
                bitfield_status = decode_bitfield(value, BITFIELD_801)
            elif variable_id == "802":
                bitfield_status = decode_bitfield(value, BITFIELD_802)
            elif variable_id == "803":
                bitfield_status = decode_bitfield(value, BITFIELD_803)
            elif variable_id == "804":
                bitfield_status = decode_bitfield(value, BITFIELD_804)
            result.append({
                'variable_id': variable_id,
                'label': label,
                'value': value,
                'value_description': value_desc,
                'unit': unit,
                'unit_short': unit_short,
                'timestamp': timestamp,
                'bitfield_status': json.dumps(bitfield_status) if bitfield_status else "",
                'device_serial': device_serial  # <-- always set!
            })
    return result

def hl7_timestamp_to_ns(ts):
    # HL7 timestamp format: YYYYMMDDHHMMSS
    if not ts or len(ts) < 14:
        return None
    dt = datetime.strptime(ts[:14], "%Y%m%d%H%M%S")
    # QuestDB expects nanoseconds since epoch
    return int(dt.timestamp() * 1_000_000_000)

def send_to_questdb_ilp(measurement, tags, fields, timestamp=None, host='localhost', port=9009):
    tag_str = ','.join(f"{k}={v}" for k, v in tags.items())
    # Only include non-empty fields
    field_str = ','.join(
        f'{k}="{str(v).replace("\"", "\\\"")}"' if isinstance(v, str) and v != '' else f"{k}={v}"
        for k, v in fields.items() if v not in [None, ""]
    )
    line = f"{measurement}"
    if tag_str:
        line += f",{tag_str}"
    line += f" {field_str}"
    if timestamp:
        line += f" {timestamp}"
    line += "\n"
    print("ILP line:", line)  # Debug print
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((host, port))
        s.sendall(line.encode())

ALL_BITFIELD_KEYS = set()
for bf in [BITFIELD_801, BITFIELD_802, BITFIELD_803, BITFIELD_804]:
    ALL_BITFIELD_KEYS.update(bf.values())

def safe_bitfield_key(k):
    return k.lower().replace(" ", "_").replace(".", "")

if __name__ == "__main__":
    hl7_file = "incoming/hl7-data.txt"
    data = parse_hl7_file(hl7_file)
    # Write to CSV for debugging
    with open('parsed_hl7.csv', 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=['variable_id', 'label', 'value', 'value_description', 'unit', 'timestamp', 'bitfield_status', 'device_serial'])
        writer.writeheader()
        for row in data:
            writer.writerow(row)
    print("Parsing complete. Output written to parsed_hl7.csv")
    # Write to QuestDB via ILP (for live/streaming use-case)
    for row in data:
        # Convert HL7 timestamp to nanoseconds for QuestDB
        ns_timestamp = hl7_timestamp_to_ns(row['timestamp'])
        fields = {
            "label": row['label'],
            "value": row['value'],
            "value_description": row.get('value_description', row['value']),
            "unit": row['unit'],
            "unit_short": row.get('unit_short', ""),  
            "timestamp_str": row['timestamp'],
        }
        # Prepare all bitfield fields, default to False
        bitfield_values = {safe_bitfield_key(k): False for k in ALL_BITFIELD_KEYS}
        if row.get('bitfield_status'):
            bitfield = json.loads(row['bitfield_status'])
            for k, v in bitfield.items():
                bitfield_values[safe_bitfield_key(k)] = v
        # Add all bitfield fields to fields dict
        for k, v in bitfield_values.items():
            fields[f"bitfield_{k}"] = v
        send_to_questdb_ilp(
            measurement="pdm_medical_device",
            tags={
                "variable_id": row['variable_id'],
                "device_serial": row.get('device_serial', 'unknown')
            },
            fields=fields,
            timestamp=ns_timestamp
        )
    print("Data sent to QuestDB via ILP.")