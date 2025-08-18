"""
PyTorch Dataset class for EEG dream decoding
Memory-efficient loading for RTX 4050 GPU constraints
"""

import re
import torch
from torch.utils.data import Dataset, DataLoader
import h5py
import numpy as np
import json
from pathlib import Path
import random
from typing import List, Tuple, Dict
import logging

logger = logging.getLogger(__name__)

class EEGDreamDataset(Dataset):
    def __init__(self,
                 features_dir: str,
                 annotations_dir: str,
                 sequence_length: int = 10,
                 prediction_horizon: int = 1,
                 include_sleep_stage: bool = True,
                 augment_data: bool = True):
        """
        EEG Dream Dataset
        Args:
            features_dir: Directory containing preprocessed EEG features (.h5 files)
            annotations_dir: Directory containing dream annotations (.json files) 
            sequence_length: Number of consecutive epochs to use as input
            prediction_horizon: Number of epochs ahead to predict
            include_sleep_stage: Whether to include sleep stage as additional input
            augment_data: Whether to apply data augmentation
        """
        self.features_dir = Path(features_dir)
        self.annotations_dir = Path(annotations_dir)
        self.sequence_length = sequence_length
        self.prediction_horizon = prediction_horizon
        self.include_sleep_stage = include_sleep_stage
        self.augment_data = augment_data
        
        # Load data
        self.data_samples = self._load_dataset()
        
        # Dream content vocabulary
        self.dream_vocab = self._build_vocabulary()
        self.vocab_size = len(self.dream_vocab)
        
        # Sleep stage mapping
        self.sleep_stage_map = {'W': 0, 'N1': 1, 'N2': 2, 'N3': 3, 'REM': 4}
        
        logger.info(f"Dataset loaded: {len(self.data_samples)} samples")
        logger.info(f"Dream vocabulary size: {self.vocab_size}")

    def _load_dataset(self) -> List[Dict]:
        """Load and align EEG features with dream annotations"""
        data_samples = []
        
        # Get all feature files
        feature_files = list(self.features_dir.glob("*_features.h5"))
        annotation_files = list(self.annotations_dir.glob("*_annotations.json"))

        print(f"Found {len(feature_files)} feature files")
        print(f"Found {len(annotation_files)} annotation files")

        for feature_file in feature_files:
            # Find corresponding annotation file using robust subject ID extraction
            subject_id = self._extract_subject_id(feature_file.name)
            annotation_file = None
            
            for ann_file in annotation_files:
                ann_subject_id = self._extract_subject_id(ann_file.name)
                if ann_subject_id == subject_id:
                    annotation_file = ann_file
                    break
            
            if annotation_file is None:
                logger.warning(f"No annotation found for {feature_file.name} (subject_id: {subject_id})")
                continue

            # Load data
            try:
                with h5py.File(feature_file, 'r') as f:
                    features = f['features'][:]
                    n_epochs = f['n_epochs'][()]
                
                with open(annotation_file, 'r') as f:
                    annotations = json.load(f)
                
                # Create samples
                samples = self._create_samples(features, annotations, subject_id)
                data_samples.extend(samples)
                
                logger.info(f"Loaded {len(samples)} samples from {feature_file.name}")
                
            except Exception as e:
                logger.error(f"Error loading {feature_file}: {e}")
                continue
        
        return data_samples

    def _extract_subject_id(self, filename: str) -> str:
        """Extract subject ID from filename - FIXED VERSION"""
        # For features like S001R01_features.h5 extract '001'
        m = re.search(r"S(\d{3})R\d{2}", filename)
        if m:
            return m.group(1)
        
        # For annotations like subject_001_annotations.json extract '001'
        m = re.search(r"subject_(\d{3})_", filename)
        if m:
            return m.group(1)
        
        # Fallback for other patterns
        if "SC4" in filename:
            return filename.split("SC4")[1][:3]
        elif "ST7" in filename:
            return filename.split("ST7")[1][:3]
        
        # Default fallback
        return filename.split("_")

    def _create_samples(self, features: np.ndarray, annotations: Dict, subject_id: str) -> List[Dict]:
        """Create training samples from features and annotations"""
        samples = []
        n_epochs = len(features)
        sleep_stages = annotations.get('sleep_stage_sequence', [])
        dream_reports = annotations.get('dream_reports', [])

        # Pad sleep stages if necessary
        if len(sleep_stages) < n_epochs:
            sleep_stages.extend(['N2'] * (n_epochs - len(sleep_stages)))
        
        # Create dream content mapping
        dream_content_map = {}
        for report in dream_reports:
            epoch_idx = report.get('epoch', -1)
            if 0 <= epoch_idx < n_epochs:
                dream_content_map[epoch_idx] = report['content']

        # Create sequences
        for i in range(n_epochs - self.sequence_length - self.prediction_horizon + 1):
            # Input sequence
            input_features = features[i:i + self.sequence_length]
            input_sleep_stages = sleep_stages[i:i + self.sequence_length]
            
            # Target (future epochs)
            target_start = i + self.sequence_length
            target_end = target_start + self.prediction_horizon
            
            # Check if any target epochs have dream content
            target_dream_content = []
            has_dream = False
            
            for j in range(target_start, min(target_end, n_epochs)):
                if j in dream_content_map:
                    target_dream_content.append(dream_content_map[j])
                    has_dream = True
                else:
                    # Use sleep stage to generate default content
                    stage = sleep_stages[j] if j < len(sleep_stages) else 'N2'
                    default_content = self._get_default_dream_content(stage)
                    target_dream_content.append(default_content)
            
            if target_dream_content:  # Only add if we have target content
                sample = {
                    'subject_id': subject_id,
                    'epoch_start': i,
                    'features': input_features,
                    'sleep_stages': input_sleep_stages,
                    'target_dream_content': ' '.join(target_dream_content),
                    'has_explicit_dream': has_dream
                }
                samples.append(sample)
        
        return samples

    def _get_default_dream_content(self, sleep_stage: str) -> str:
        """Generate default dream content based on sleep stage"""
        default_content = {
            'W': 'alert conscious thoughts and planning',
            'N1': 'drowsy imagery and fleeting thoughts',
            'N2': 'fragmented visual scenes and brief narratives',
            'N3': 'minimal content with vague sensations',
            'REM': 'vivid complex dreams with emotional content'
        }
        return default_content.get(sleep_stage, 'unclear mental activity')

    def _build_vocabulary(self) -> Dict[str, int]:
        """Build vocabulary from dream content"""
        vocab = {'<PAD>': 0, '<UNK>': 1, '<START>': 2, '<END>': 3}
        word_freq = {}
        
        # Count word frequencies
        for sample in self.data_samples:
            content = sample['target_dream_content'].lower()
            words = content.split()
            for word in words:
                # Simple tokenization (you might want to use spaCy/NLTK)
                clean_word = ''.join(c for c in word if c.isalnum())
                if clean_word:
                    word_freq[clean_word] = word_freq.get(clean_word, 0) + 1
        
        # Add words that appear at least twice
        for word, freq in word_freq.items():
            if freq >= 2:
                vocab[word] = len(vocab)
        
        return vocab

    def _text_to_tokens(self, text: str) -> List[int]:
        """Convert text to token indices"""
        words = text.lower().split()
        tokens = [self.dream_vocab['<START>']]
        
        for word in words:
            clean_word = ''.join(c for c in word if c.isalnum())
            if clean_word in self.dream_vocab:
                tokens.append(self.dream_vocab[clean_word])
            else:
                tokens.append(self.dream_vocab['<UNK>'])
        
        tokens.append(self.dream_vocab['<END>'])
        return tokens

    def _augment_features(self, features: np.ndarray) -> np.ndarray:
        """Apply data augmentation to EEG features"""
        if not self.augment_data:
            return features
        
        augmented = features.copy()
        
        # Add small amount of noise
        if random.random() < 0.5:
            noise_factor = 0.02
            noise = np.random.normal(0, noise_factor, features.shape)
            augmented += noise
        
        # Scale variation
        if random.random() < 0.3:
            scale_factor = random.uniform(0.95, 1.05)
            augmented *= scale_factor
        
        return augmented

    def __len__(self) -> int:
        return len(self.data_samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]:
        sample = self.data_samples[idx]
        
        # EEG features
        features = sample['features'].astype(np.float32)
        if self.augment_data and hasattr(self, 'training') and self.training:
            features = self._augment_features(features)
        
        # Sleep stages (if included)
        sleep_stages = [self.sleep_stage_map.get(stage, 1) for stage in sample['sleep_stages']]
        
        # Dream content tokens
        dream_tokens = self._text_to_tokens(sample['target_dream_content'])
        
        # Convert to tensors
        features_tensor = torch.tensor(features, dtype=torch.float32)
        sleep_stages_tensor = torch.tensor(sleep_stages, dtype=torch.long)
        dream_tokens_tensor = torch.tensor(dream_tokens, dtype=torch.long)
        
        # Additional metadata
        metadata = torch.tensor([
            1.0 if sample['has_explicit_dream'] else 0.0,
            float(sample['epoch_start'])
        ], dtype=torch.float32)
        
        return features_tensor, sleep_stages_tensor, dream_tokens_tensor, metadata

def collate_fn(batch):
    """Custom collate function for variable length sequences"""
    features, sleep_stages, dream_tokens, metadata = zip(*batch)
    
    # Pad dream tokens to same length
    max_dream_length = max(len(tokens) for tokens in dream_tokens)
    
    padded_dream_tokens = []
    for tokens in dream_tokens:
        # Convert to list if it's a tensor, then pad
        tokens_list = tokens.tolist() if hasattr(tokens, 'tolist') else tokens
        padded = tokens_list + [0] * (max_dream_length - len(tokens_list))  # 0 is <PAD>
        padded_dream_tokens.append(torch.tensor(padded, dtype=torch.long))
    
    return (
        torch.stack(features),
        torch.stack(sleep_stages), 
        torch.stack(padded_dream_tokens),
        torch.stack(metadata)
    )

def create_data_loaders(features_dir: str, 
                       annotations_dir: str,
                       batch_size: int = 8,
                       train_ratio: float = 0.8,
                       num_workers: int = 2) -> Tuple[DataLoader, DataLoader]:
    """Create train and validation data loaders"""
    
    # Create full dataset
    full_dataset = EEGDreamDataset(features_dir, annotations_dir)
    
    # Check if dataset is empty
    total_size = len(full_dataset)
    if total_size == 0:
        raise ValueError("Dataset is empty. Check data files and annotation matching.")
    
    # Split into train/val
    train_size = int(train_ratio * total_size)
    val_size = total_size - train_size
    
    train_dataset, val_dataset = torch.utils.data.random_split(
        full_dataset, [train_size, val_size]
    )
    
    # Create data loaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        collate_fn=collate_fn,
        pin_memory=True
    )
    
    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        collate_fn=collate_fn,
        pin_memory=True
    )
    
    return train_loader, val_loader

if __name__ == "__main__":
    # Test dataset loading
    features_dir = "data/processed/comprehensive_features"
    annotations_dir = "data/processed/annotations"
    
    dataset = EEGDreamDataset(features_dir, annotations_dir)
    print(f"Dataset size: {len(dataset)}")
    print(f"Vocabulary size: {dataset.vocab_size}")
    
    # Test data loader if dataset is not empty
    if len(dataset) > 0:
        train_loader, val_loader = create_data_loaders(features_dir, annotations_dir, batch_size=4)
        
        for batch in train_loader:
            features, sleep_stages, dream_tokens, metadata = batch
            print(f"Features shape: {features.shape}")
            print(f"Sleep stages shape: {sleep_stages.shape}")
            print(f"Dream tokens shape: {dream_tokens.shape}")
            print(f"Metadata shape: {metadata.shape}")
            break
    else:
        print("No data samples were matched. Check your data directories and filenames.")
        print("\nDebug info:")
        print(f"Features directory: {Path(features_dir).absolute()}")
        print(f"Annotations directory: {Path(annotations_dir).absolute()}")
        print(f"Features directory exists: {Path(features_dir).exists()}")
        print(f"Annotations directory exists: {Path(annotations_dir).exists()}")
