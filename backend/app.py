from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
import re
from difflib import SequenceMatcher

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load FAQ data
def load_faq():
    try:
        with open('faq.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"faq": []}

# Function to calculate similarity between two strings
def similar(a, b):
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

# Find best matching question
def find_best_match(question, faq_data, threshold=0.6):
    best_match = None
    best_score = 0
    
    for item in faq_data['faq']:
        score = similar(question, item['question'])
        if score > best_score and score >= threshold:
            best_score = score
            best_match = item
    
    return best_match, best_score

@app.route('/')
def home():
    return jsonify({"message": "Sinhala Farmer Chatbot API"})

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_question = data.get('question', '').strip()
        
        if not user_question:
            return jsonify({"error": "Question is required"}), 400
        
        faq_data = load_faq()
        
        # Find best matching question
        best_match, score = find_best_match(user_question, faq_data)
        
        if best_match:
            response = {
                "answer": best_match['answer'],
                "matched_question": best_match['question'],
                "confidence": score
            }
        else:
            response = {
                "answer": "මට ඒ පිළිබඳ තොරතුරු නොමැත. කරුණාකර ඔබේ ප්‍රශ්නය 0717096964 යනු දුරකතනයට කතාකර දැනුවත් කරන්න.",
                "matched_question": None,
                "confidence": 0
            }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)  # Production ready!