#  OCR Portal for Text Extraction & Verification

A web-based OCR (Optical Character Recognition) portal that automates
**document text extraction, structured field mapping, and data verification**
from PDFs and images such as ID cards, forms, and certificates.

The system is designed as an **offline-ready, open-source solution** using
Node.js and Tesseract.js, following a **two-API architecture**:
- OCR Extraction API
- Data Verification API

---

## 1. Problem Statement

Manual extraction and verification of data from physical documents is:
- Time-consuming
- Error-prone
- Difficult to scale

Traditional OCR systems often extract text but **lack structured field extraction,
verification, confidence scoring, and correction workflows**.

---

## 2. Solution Overview

Web portal provides:
- Automated OCR-based text extraction
- Document-type–aware preprocessing
- Structured field extraction (Name, DOB, ID, etc.)
- Human-in-the-loop correction
- Field-level verification with confidence scores
- Two language support : **English** and **Hindi**

The solution is implemented as a **web portal backed by REST APIs**.

---

## 3. High-Level Architecture

**Frontend**
- EJS-based web UI
- Upload, preview, correction, and verification pages

**Backend**
- Node.js + Express
- Session-based workflow
- REST APIs for extraction and verification

**OCR & Processing Layer**
- PDF → Image conversion
- Image preprocessing
- OCR text extraction
- Field parsing & confidence calculation

---

## 4. Project Folder Structure

<img width="286" height="570" alt="Screenshot 2025-12-13 225036" src="https://github.com/user-attachments/assets/3719936f-3808-4ba2-82a2-18ddec66ca87" />

---

## 5. Workflow

1. User uploads a PDF or image
2. PDF pages are converted into images
3. Images are preprocessed (resize, sharpen, threshold)
4. OCR is performed using Tesseract.js
5. Document type is detected from first page OCR and **Doc should be in either Hindi or English language**
6. OCR is re-run with docType-aware preprocessing
7. Structured fields are extracted
8. Field-level confidence is calculated
9. User reviews and edits extracted data
10. Verification API validates filled data

---

## 6. API Design

### API 1: OCR Extraction API

**GET /api/extract/:id**

**Purpose**
- Extract text and structured fields from uploaded documents

**Process**
- PDF/image detection
- Multi-page OCR support
- Document type detection
- Field extraction
- Confidence calculation

**Response**
```json
{
  "ok": true,
  "docType": "aadhaar",
  "fields": {
    "name": { "value": "John Doe", "confidence": 92, "matched": true },
    "dob": { "value": "12-03-1999", "confidence": 88, "matched": true }
  },
  "rawText": "..."
}
```
### API 2: Data Verification API

**POST /api/verify**

**Purpose**

Verify user-filled data against OCR output

**Verification Logic**

- Field-specific verifiers (DOB, Name, ID, Mobile, Address, etc.)

- Fuzzy similarity matching

- Empty-value handling

- Match status classification

**Response**
```json
{
  "ok": true,
  "verification": {
    "name": {
      "filled": "John Doe",
      "ocr": "John Doe",
      "matchScore": 1,
      "status": "match"
    }
  }
}
```
## 7.Verification strategy

| Field     | Verification Method        |
| --------- | -------------------------- |
| Name      | Fuzzy string similarity    |
| DOB       | Normalized date comparison |
| Mobile    | Exact numeric match        |
| ID Number | Checksum + similarity      |
| Gender    | Categorical match          |
| Age       | Derived from DOB           |
| Address   | Token-based similarity     |

## 8. Technology Stack

| Category | Technology / Tool | Purpose |
|--------|------------------|---------|
| Backend | Node.js | Server-side runtime for handling API logic and asynchronous processing |
| Backend | Express.js | Lightweight framework to build REST APIs for OCR extraction and verification |
| Frontend | EJS Templates | Dynamic rendering of web pages for upload, preview, and verification UI |
| Open-Source Tool | Multer | Handles secure upload of scanned images and PDF documents |
| Open-Source Tool | PDF-to-Image | Converts PDF documents into images for OCR processing |
| Open-Source Tool | Sharp | Image preprocessing (resize, crop, enhance) to improve OCR accuracy |
| Open-Source Tool | Tesseract.js | Performs OCR to extract text from scanned documents |
| Open-Source Tool | Express-Session | Maintains user session data during upload, correction, and verification flow |

## 9. Installation guide
```
git clone https://github.com/dwivediprashant/OCR_Portal.git
cd OCR_IITM
npm install
node app.js
```
## 10. Design Considerations

- No cloud services used

- Open-source libraries only

- Modular and extensible design

- Supports multi-page documents

- Human-in-the-loop correction

