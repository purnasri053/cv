from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
import os

import pdfplumber
from docx import Document

app = Flask(__name__)
CORS(app)

# ✅ ADD THIS HERE
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "root",
    "database": "ai_recruitment_system"
}

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

SKILL_KEYWORDS = [
    "python", "html", "css", "javascript", "react", "react js",
    "node.js", "node", "mongodb", "mongo", "sql", "mysql",
    "flask", "java", "c", "c++", "machine learning",
    "deep learning", "nlp", "data analysis", "excel",
    "power bi", "communication", "problem solving"
]

def extract_text_from_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    return text


def extract_text_from_docx(file_path):
    doc = Document(file_path)
    text = []
    for para in doc.paragraphs:
        text.append(para.text)
    return "\n".join(text)


def extract_skills(text):
    text_lower = text.lower()
    found_skills = []

    for skill in SKILL_KEYWORDS:
        if skill in text_lower:
            found_skills.append(skill.title())

    return list(set(found_skills))


@app.route("/")
def home():
    return "Flask backend is running successfully!"
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        full_name = data.get("full_name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")

        if not full_name or not email or not password or not role:
            return jsonify({"error": "All fields are required"}), 400

        if role not in ["candidate", "hr"]:
            return jsonify({"error": "Invalid role"}), 400

        password_hash = generate_password_hash(password)

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            cursor.close()
            conn.close()
            return jsonify({"error": "Email already registered"}), 400

        cursor.execute(
            "INSERT INTO users (full_name, email, password_hash, role) VALUES (%s, %s, %s, %s)",
            (full_name, email, password_hash, role)
        )
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"message": f"{role.title()} registered successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")

        if not email or not password or not role:
            return jsonify({"error": "Email, password, and role are required"}), 400

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM users WHERE email = %s AND role = %s", (email, role))
        user = cursor.fetchone()

        cursor.close()
        conn.close()

        if not user:
            return jsonify({"error": "User not found"}), 404

        if not check_password_hash(user["password_hash"], password):
            return jsonify({"error": "Invalid password"}), 401

        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user["id"],
                "full_name": user["full_name"],
                "email": user["email"],
                "role": user["role"]
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/analyze", methods=["POST"])
def analyze_resume():
    try:
        if "resume" not in request.files:
            return jsonify({"error": "No resume file uploaded"}), 400

        resume = request.files["resume"]
        job_description = request.form.get("jobDescription", "")
           
        if resume.filename == "":
            return jsonify({"error": "Empty file name"}), 400

        if not job_description.strip():
            return jsonify({"error": "Job description is required"}), 400

        file_path = os.path.join(app.config["UPLOAD_FOLDER"], resume.filename)
        resume.save(file_path)

        resume_text = ""
        if resume.filename.endswith(".pdf"):
            resume_text = extract_text_from_pdf(file_path)
        elif resume.filename.endswith(".docx"):
            resume_text = extract_text_from_docx(file_path)
        else:
            return jsonify({"error": "Unsupported file type. Upload PDF or DOCX only."}), 400

        extracted_skills = extract_skills(resume_text)
        required_skills = extract_skills(job_description)
        missing_skills = [skill for skill in required_skills if skill not in extracted_skills]

        match_score = 0
        if required_skills:
            matched_count = len([skill for skill in required_skills if skill in extracted_skills])
            match_score = int((matched_count / len(required_skills)) * 100)

        candidate_name = os.path.splitext(resume.filename)[0]
        candidate_name = candidate_name.replace("_", " ").replace("-", " ").strip().title()

        response = {
            "message": "Resume uploaded and analyzed successfully",
            "fileName": resume.filename,
            "candidateName": candidate_name,
            "extractedSkills": extracted_skills,
            "requiredSkills": required_skills,
            "missingSkills": missing_skills,
            "matchScore": match_score,
            "rankedCandidates": [
                {"name": candidate_name, "score": match_score}
            ]
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/analyze-multiple", methods=["POST"])
def analyze_multiple_resumes():
    try:
        resumes = request.files.getlist("resumes")
        job_description = request.form.get("jobDescription", "")
        shortlist_count = int(request.form.get("shortlistCount", 5))

        if not resumes or len(resumes) == 0:
            return jsonify({"error": "No resumes uploaded"}), 400

        if not job_description.strip():
            return jsonify({"error": "Job description is required"}), 400

        required_skills = extract_skills(job_description)
        ranked_candidates = []
        all_results = []

        for resume in resumes:
            if resume.filename == "":
                continue

            file_path = os.path.join(app.config["UPLOAD_FOLDER"], resume.filename)
            resume.save(file_path)

            resume_text = ""
            if resume.filename.endswith(".pdf"):
                resume_text = extract_text_from_pdf(file_path)
            elif resume.filename.endswith(".docx"):
                resume_text = extract_text_from_docx(file_path)
            else:
                continue

            extracted_skills = extract_skills(resume_text)
            missing_skills = [skill for skill in required_skills if skill not in extracted_skills]

            match_score = 0
            if required_skills:
                matched_count = len([skill for skill in required_skills if skill in extracted_skills])
                match_score = int((matched_count / len(required_skills)) * 100)

            candidate_name = os.path.splitext(resume.filename)[0]
            candidate_name = candidate_name.replace("_", " ").replace("-", " ").strip()
            ranked_candidates.append({
                "name": candidate_name,
                "score": match_score
            })

            all_results.append({
                "name": candidate_name,
                "score": match_score,
                "extractedSkills": extracted_skills,
                "missingSkills": missing_skills
            })

        ranked_candidates = sorted(ranked_candidates, key=lambda x: x["score"], reverse=True)
        all_results = sorted(all_results, key=lambda x: x["score"], reverse=True)

        top_result = all_results[0] if all_results else {
            "name": "N/A",
            "score": 0,
            "extractedSkills": [],
            "missingSkills": []
        }

        response = {
            "message": "Resumes analyzed successfully",
            "requiredSkills": required_skills,
            "rankedCandidates": ranked_candidates,
            "allResults": all_results,
            "shortlistCount": shortlist_count,
            "extractedSkills": top_result["extractedSkills"],
            "missingSkills": top_result["missingSkills"],
            "matchScore": top_result["score"],
            "candidateName": top_result["name"]
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/test-db")
def test_db():
    try:
        conn = mysql.connector.connect(**db_config)
        conn.close()
        return "Database connected successfully!"
    except Exception as e:
        return f"Database connection failed: {str(e)}"

if __name__ == "__main__":
    app.run(debug=True, port=5000)