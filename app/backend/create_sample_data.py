#!/usr/bin/env python
"""
Create sample learning materials for Point3 Learning Tool
This script creates sample JSON files and generates simple audio files for testing
"""

import os
import sys
import json
import uuid
from datetime import datetime
import numpy as np
import soundfile as sf

# Add services to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'services', 'dbservice'))

sample_materials = [
    {
        "title": "Greetings_Basic",
        "text": "Hello, how are you?",
        "level": 1
    },
    {
        "title": "Introduction_Simple",
        "text": "My name is Sarah. I am a student.",
        "level": 1
    },
    {
        "title": "Daily_Routine",
        "text": "I wake up at seven o'clock every morning. Then I brush my teeth and eat breakfast.",
        "level": 2
    },
    {
        "title": "Weather_Description",
        "text": "Today is a beautiful sunny day. The sky is blue and there are no clouds.",
        "level": 2
    },
    {
        "title": "Shopping_Conversation",
        "text": "Excuse me, how much does this shirt cost? I would like to buy two of them please.",
        "level": 3
    },
    {
        "title": "Travel_Planning",
        "text": "I am planning to travel to London next summer. I want to visit the British Museum and see Big Ben.",
        "level": 3
    },
    {
        "title": "Job_Interview",
        "text": "I have extensive experience in software development and have worked on several international projects.",
        "level": 4
    },
    {
        "title": "Environmental_Issues",
        "text": "Climate change is one of the most pressing challenges facing humanity today. We must take immediate action.",
        "level": 4
    },
    {
        "title": "Literature_Discussion",
        "text": "Shakespeare's influence on English literature cannot be overstated. His works continue to resonate with audiences worldwide.",
        "level": 5
    },
    {
        "title": "Scientific_Research",
        "text": "Recent studies in quantum mechanics have revealed fascinating insights into the fundamental nature of reality and space-time.",
        "level": 5
    }
]


def generate_simple_audio(text, output_path, duration=3.0, sample_rate=16000):
    t = np.linspace(0, duration, int(sample_rate * duration))
    frequency = 440 + len(text) * 2
    audio = 0.3 * np.sin(2 * np.pi * frequency * t)
    audio += 0.1 * np.sin(2 * np.pi * (frequency * 1.5) * t)
    sf.write(output_path, audio, sample_rate)
    print(f"Created audio: {output_path}")


def create_sample_materials():
    backend_dir = os.path.dirname(os.path.abspath(__file__))

    database_origin = os.path.join(backend_dir, 'databaseOrigin')
    audio_origin = os.path.join(backend_dir, 'audioOrigin')
    database_self = os.path.join(backend_dir, 'databaseSelf')
    audio_self = os.path.join(backend_dir, 'audioSelf')

    os.makedirs(database_origin, exist_ok=True)
    os.makedirs(audio_origin, exist_ok=True)
    os.makedirs(database_self, exist_ok=True)
    os.makedirs(audio_self, exist_ok=True)

    print("=" * 60)
    print("Creating Sample Learning Materials")
    print("=" * 60)

    for material in sample_materials:
        material_id = str(uuid.uuid4())
        title = material['title']
        text = material['text']
        level = material['level']

        json_filename = f"{title}.json"
        text_filename = f"{title}.txt"
        audio_filename = f"{title}.wav"

        metadata = {
            "id": material_id,
            "title": title,
            "text_file_dir": text_filename,
            "audio_file_dir": audio_filename,
            "level": level,
            "upgrade_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "typeA": "standard_material"
        }

        json_path = os.path.join(database_origin, json_filename)
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
        print(f"Created metadata: {json_filename}")

        text_path = os.path.join(database_origin, text_filename)
        with open(text_path, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f"Created text: {text_filename}")

        audio_path = os.path.join(audio_origin, audio_filename)
        generate_simple_audio(text, audio_path)

        print(f"✓ Material '{title}' (Level {level}) created successfully")
        print("-" * 60)

    print("=" * 60)
    print(f"Successfully created {len(sample_materials)} sample materials!")
    print("=" * 60)


if __name__ == '__main__':
    create_sample_materials()
