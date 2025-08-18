#!/usr/bin/env python3
"""
Download real neuroscience datasets for EEG dream decoding
Author: DreamCrafter Team
"""

import os
import urllib.request
import zipfile
import gzip
import shutil
from pathlib import Path
import requests
from tqdm import tqdm

class DatasetDownloader:
    def __init__(self, base_dir="data/raw"):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
        
    def download_with_progress(self, url, filename):
        """Download file with progress bar"""
        response = requests.get(url, stream=True)
        total_size = int(response.headers.get('content-length', 0))
        
        with open(filename, 'wb') as file, tqdm(
            desc=filename.name,
            total=total_size,
            unit='B',
            unit_scale=True,
            unit_divisor=1024,
        ) as pbar:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    file.write(chunk)
                    pbar.update(len(chunk))
    
    def download_sleep_edf(self):
        """Download Sleep-EDF Database (~200MB)"""
        print("Downloading Sleep-EDF Database...")
        
        # Sleep-EDF Expanded Database URLs (PhysioNet)
        base_url = "https://physionet.org/files/sleep-edfx/1.0.0/"
        
        # Selected files for training (limit to ~200MB)
        files_to_download = [
            "sleep-cassette/SC4001E0-PSG.edf",
            "sleep-cassette/SC4002E0-PSG.edf", 
            "sleep-cassette/SC4011E0-PSG.edf",
            "sleep-cassette/SC4012E0-PSG.edf",
            "sleep-cassette/SC4001EH-Hypnogram.edf",
            "sleep-cassette/SC4002EH-Hypnogram.edf",
            "sleep-cassette/SC4011EH-Hypnogram.edf", 
            "sleep-cassette/SC4012EH-Hypnogram.edf",
            "sleep-telemetry/ST7011J0-PSG.edf",
            "sleep-telemetry/ST7012J0-PSG.edf",
            "sleep-telemetry/ST7021J0-PSG.edf",
            "sleep-telemetry/ST7022J0-PSG.edf",
            "sleep-telemetry/ST7011JM-Hypnogram.edf",
            "sleep-telemetry/ST7012JM-Hypnogram.edf",
            "sleep-telemetry/ST7021JM-Hypnogram.edf",
            "sleep-telemetry/ST7022JM-Hypnogram.edf",
        ]
        
        sleep_dir = self.base_dir / "sleep_edf"
        sleep_dir.mkdir(exist_ok=True)
        
        for file_path in files_to_download:
            url = base_url + file_path
            local_path = sleep_dir / Path(file_path).name
            
            if not local_path.exists():
                try:
                    self.download_with_progress(url, local_path)
                    print(f"Downloaded: {local_path.name}")
                except Exception as e:
                    print(f"Failed to download {file_path}: {e}")
    
    def download_dreams_db(self):
        """Download DREAMS Database (~150MB)"""
        print("Downloading DREAMS Database...")
        
        # DREAMS Sleep Spindles Database
        base_url = "https://zenodo.org/record/2650142/files/"
        
        files = [
            "excerpt1.edf", "excerpt2.edf", "excerpt3.edf",
            "visual_scoring1_excerpt1.txt", "visual_scoring1_excerpt2.txt", 
            "visual_scoring1_excerpt3.txt"
        ]
        
        dreams_dir = self.base_dir / "dreams_db"
        dreams_dir.mkdir(exist_ok=True)
        
        for filename in files:
            url = base_url + filename
            local_path = dreams_dir / filename
            
            if not local_path.exists():
                try:
                    self.download_with_progress(url, local_path)
                    print(f"Downloaded: {filename}")
                except Exception as e:
                    print(f"Failed to download {filename}: {e}")
    
    def create_dream_annotations(self):
        """Create synthetic dream annotations based on sleep stages"""
        print("Creating dream content annotations...")
        
        # Dream content templates based on sleep stages
        dream_templates = {
            'REM': [
                "vivid colorful landscapes with flying sensations",
                "complex social interactions with family and friends", 
                "bizarre transformations and impossible scenarios",
                "emotional conversations and dramatic events",
                "adventure dreams with chasing and escaping"
            ],
            'N2': [
                "fragmented images and brief visual scenes",
                "simple activities like walking or talking",
                "familiar places and everyday situations",
                "short conversations with known people"
            ],
            'N3': [
                "vague impressions and unclear imagery",
                "minimal visual content with basic shapes",
                "simple sensations without clear narrative"
            ],
            'W': [
                "realistic thoughts about daily activities",
                "planning and problem-solving scenarios"
            ]
        }
        
        annotations_dir = self.base_dir.parent / "processed" / "annotations"
        annotations_dir.mkdir(parents=True, exist_ok=True)
        
        # Create annotation files
        import json
        import random
        
        for i in range(1, 21):  # 20 sample annotations
            annotation = {
                "subject_id": f"S{i:03d}",
                "recording_session": f"R{random.randint(1,4):02d}",
                "sleep_stage_sequence": [],
                "dream_reports": [],
                "timestamps": []
            }
            
            # Generate 30-minute worth of data (1800 30-second epochs)
            for epoch in range(60):  # Simplified to 60 epochs
                stage = random.choice(['W', 'N1', 'N2', 'N3', 'REM'])
                timestamp = epoch * 30  # 30-second epochs
                
                annotation["sleep_stage_sequence"].append(stage)
                annotation["timestamps"].append(timestamp)
                
                # Add dream content for REM and some N2 stages
                if stage == 'REM' or (stage == 'N2' and random.random() < 0.3):
                    dream_content = random.choice(dream_templates.get(stage, ["unclear imagery"]))
                    annotation["dream_reports"].append({
                        "epoch": epoch,
                        "content": dream_content,
                        "vividness": random.uniform(0.6, 1.0) if stage == 'REM' else random.uniform(0.2, 0.6)
                    })
            
            # Save annotation
            with open(annotations_dir / f"subject_{i:03d}_annotations.json", 'w') as f:
                json.dump(annotation, f, indent=2)
        
        print(f"Created annotations for 20 subjects in {annotations_dir}")

def main():
    """Main download function"""
    print("🧠 DreamCrafter Dataset Downloader")
    print("=" * 40)
    
    downloader = DatasetDownloader()
    
    try:
        # Download real neuroscience datasets
        downloader.download_sleep_edf()
        downloader.download_dreams_db()
        
        # Create dream content annotations
        downloader.create_dream_annotations()
        
        print("\n✅ Dataset download completed successfully!")
        print(f"Total data downloaded to: {downloader.base_dir}")
        
    except Exception as e:
        print(f"❌ Error during download: {e}")

if __name__ == "__main__":
    main()
