# MTUdatalake
HL7 receiving application for storing medical device technical data to QuestDB for future ML use

# HL7 MLLP Receiver & Parser for Predictive Maintenance

This project provides a Python-based HL7 MLLP (Minimal Lower Layer Protocol) receiver and parser, designed for ingesting medical device data (e.g., Elisa 800 ventilator) into [QuestDB](https://questdb.io/) for predictive maintenance and analytics.

## Features

- **HL7 MLLP Server:** Listens for incoming HL7 v2.x messages over TCP/IP.
- **ACK Response:** Automatically sends HL7 ACKs with correct Message Control ID.
- **Flexible Parsing:** Extracts and flattens all relevant HL7 OBX segments and bitfields.
- **QuestDB Integration:** Streams parsed data directly to QuestDB using the Influx Line Protocol (ILP).
- **CSV Export:** Optionally writes parsed data to CSV for debugging or batch analysis.
- **Configurable:** Easily adapt variable mappings and bitfield definitions.

## Project Structure

```
.
├── hl7_mllp_receiver.py   # MLLP server and ACK logic
├── parsing.py             # HL7 parsing and QuestDB integration
├── run_server.py          # Main entry point for live ingestion
├── variable_mapping.py    # Variable and bitfield definitions
├── .gitignore
├── README.md
└── (other files)
```

## Quick Start

### 1. Clone the Repository

```sh
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2. Install Python Requirements

No external dependencies required for core functionality (uses Python standard library).  
If you use optional features (e.g., Pandas for CSV), install as needed:

```sh
pip install pandas
```

### 3. Run the Server

```sh
python run_server.py
```

The server will listen for HL7 MLLP connections on port `2575` by default.

### 4. Send HL7 Messages

Use a tool like [HAPI TestPanel](https://hapifhir.github.io/hapi-hl7v2/hapi-testpanel.html) to send HL7 messages to your server’s IP and port.

### 5. View Data in QuestDB

Open [http://localhost:9000](http://localhost:9000) and query your data:

```sql
SELECT * FROM pdm_medical_device;
```

## Configuration

- **QuestDB Host/Port:** Edit `send_to_questdb_ilp` in `parsing.py` if your QuestDB is not on `localhost:9009`.
- **Application/Facility Names:** Edit `my_app` and `my_fac` in `hl7_mllp_receiver.py` for ACK messages.
- **Variable/Bitfield Mappings:** Update `variable_mapping.py` as needed for your device.

## Security

- Restrict inbound TCP connections to trusted hospital networks.
- Do not expose the HL7 port to the public internet.
- Use a firewall to control access.

## License

MIT License

## Acknowledgements

- [QuestDB](https://questdb.io/)
- [HAPI HL7](https://hapifhir.github.io/hapi-hl7v2/)
- [HL7 International](https://www.hl7.org/)

---

*For questions or contributions, please open an issue or pull request!*
