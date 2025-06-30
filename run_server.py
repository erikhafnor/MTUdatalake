import json
from hl7_mllp_receiver import receive_hl7_messages
from parsing import (
    parse_hl7_string,
    send_to_questdb_ilp,
    hl7_timestamp_to_ns,
    safe_bitfield_key,
    ALL_BITFIELD_KEYS,
)
DEBUG = True

def handle_hl7_message(hl7_message):
    if DEBUG:#for troubleshooting, print the raw HL7 message
        print("=== RAW HL7 MESSAGE RECEIVED ===")
        print(repr(hl7_message))
        print("================================")

    data = parse_hl7_string(hl7_message)
    for row in data:
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
    if DEBUG:  # for troubleshooting, print the parsed data
        print("=== PARSED DATA ===")
        print(data)
        print("===================")
        print("HL7 message processed and sent to QuestDB.")

if __name__ == "__main__":
    receive_hl7_messages(callback=handle_hl7_message)