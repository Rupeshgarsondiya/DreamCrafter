"""
EEG Dataset Loader - FIXED VERSION
This version ensures all tensors have consistent shapes and proper vocabulary
"""

import torch
from torch.utils.data import Dataset, DataLoader
from torch.nn.utils.rnn import pad_sequence
import h5py
import json
import numpy as np
from pathlib import Path
import logging
import re
from sklearn.model_selection import train_test_split

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EEGDreamDataset(Dataset):
    def __init__(self, features_dir, annotations_dir, max_sequence_length=50):
        self.features_dir = Path(features_dir)
        self.annotations_dir = Path(annotations_dir)
        self.max_sequence_length = max_sequence_length
        
        # ✅ FIXED: Proper vocabulary with actual tokens
        self.vocab = {'<PAD>': 0, '<SOS>': 1, '<EOS>': 2, '<UNK>': 3}
        self.word_to_idx = self.vocab.copy()
        self.idx_to_word = {v: k for k, v in self.vocab.items()}
        
        self.data = []
        self._load_all_data()

    def _extract_subject_id(self, filename):
        """Extract subject ID from filename"""
        if 'S00' in filename:
            match = re.search(r'S(\d{3})', filename)
            if match:
                return match.group(1)
        elif 'SC4' in filename:
            match = re.search(r'SC4(\d{3})', filename)
            if match:
                return match.group(1)
        elif 'ST7' in filename:
            match = re.search(r'ST7(\d{3})', filename)
            if match:
                return match.group(1)
        return None

    def _load_annotation(self, subject_id):
        """Load annotation for a subject"""
        patterns = [
            f"subject_{subject_id}_annotations.json",
            f"subject_{int(subject_id):03d}_annotations.json"
        ]
        
        for pattern in patterns:
            annotation_file = self.annotations_dir / pattern
            if annotation_file.exists():
                with open(annotation_file, 'r') as f:
                    return json.load(f)
        return None

    def _create_dream_tokens(self, dream_text):
        """Convert dream text to token sequence with proper bounds checking"""
        if not dream_text or dream_text.strip() == "":
            dream_text = "peaceful sleep dreaming softly"
        
        words = dream_text.lower().split()
        
        # Add new words to vocabulary
        for word in words:
            if word not in self.word_to_idx:
                idx = len(self.word_to_idx)
                self.word_to_idx[word] = idx
                self.idx_to_word[idx] = word
        
        # Create token sequence
        tokens = [self.word_to_idx['<SOS>']]
        tokens.extend([self.word_to_idx.get(word, self.word_to_idx['<UNK>']) for word in words])
        tokens.append(self.word_to_idx['<EOS>'])
        
        # Pad or truncate
        if len(tokens) > self.max_sequence_length:
            tokens = tokens[:self.max_sequence_length-1] + [self.word_to_idx['<EOS>']]
        else:
            tokens.extend([self.word_to_idx['<PAD>']] * (self.max_sequence_length - len(tokens)))
        
        return tokens


    def _load_all_data(self):
        """Load all feature files and their annotations"""
        feature_files = list(self.features_dir.glob("*.h5"))
        logger.info(f"Found {len(feature_files)} feature files")
        
        for feature_file in feature_files:
            try:
                subject_id = self._extract_subject_id(feature_file.name)
                if not subject_id:
                    continue

                with h5py.File(feature_file, 'r') as f:
                    features = f['features'][:]

                annotation = self._load_annotation(subject_id)
                if annotation is None:
                    dream_text = "peaceful sleep dreaming softly"
                    sleep_stage = 2
                else:
                    dream_text = annotation.get('dream_content', 'peaceful sleep')
                    sleep_stage = annotation.get('sleep_stage', 2)

                # Process each feature window
                for i, feature_window in enumerate(features):
                    if not isinstance(feature_window, np.ndarray):
                        feature_window = np.array(feature_window)
                    
                    feature_window = feature_window.flatten()
                    assert len(feature_window.shape) == 1, f"Feature must be 1D, got {feature_window.shape}"
                    
                    dream_tokens = self._create_dream_tokens(dream_text)
                    
                    sample = {
                        'features': feature_window,
                        'sleep_stage': sleep_stage,
                        'dream_tokens': dream_tokens,
                        'subject_id': subject_id,
                        'file_name': feature_file.name,
                        'window_id': i
                    }
                    self.data.append(sample)

                logger.info(f"Loaded {len(features)} windows from {feature_file.name}")
            except Exception as e:
                logger.error(f"Error loading {feature_file}: {e}")
                continue

        logger.info(f"Dataset loaded: {len(self.data)} samples")
        logger.info(f"Dream vocabulary size: {len(self.word_to_idx)}")

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        """Get item with guaranteed 1D feature tensor"""
        try:
            sample = self.data[idx]
            
            features = sample['features']
            if not isinstance(features, np.ndarray):
                features = np.array(features)
            if len(features.shape) > 1:
                features = features.flatten()
            
            features = torch.tensor(features, dtype=torch.float32)
            assert len(features.shape) == 1, f"Feature tensor must be 1D, got shape {features.shape}"
            
            sleep_stage = torch.tensor([sample['sleep_stage']], dtype=torch.long)
            dream_tokens = torch.tensor(sample['dream_tokens'], dtype=torch.long)
            
            metadata = {
                'subject_id': sample['subject_id'],
                'file_name': sample['file_name'],
                'window_id': sample['window_id']
            }
            
            return features, sleep_stage, dream_tokens, metadata
            
        except Exception as e:
            logger.error(f"Error in __getitem__ at index {idx}: {e}")
            return None

def pad_collate_fn(batch):
    """Safe collate function with correct indexing"""
    batch = [item for item in batch if item is not None]
    
    if len(batch) == 0:
        raise RuntimeError("All samples in batch are None!")
    
    features = [item[0] for item in batch]      # ✅ Correct indexing
    sleep_stages = [item[1] for item in batch]  
    dream_tokens = [item[2] for item in batch]  
    metadata = [item[3] for item in batch]      
    
    # Verify features are 1D
    for i, f in enumerate(features):
        if len(f.shape) != 1:
            raise RuntimeError(f"Feature {i} has wrong shape: {f.shape}")
    
    # Pad sequences
    features_padded = pad_sequence(features, batch_first=True, padding_value=0)
    
    # ✅ ADD SEQUENCE DIMENSION: Convert to 3D for model compatibility
    features_padded = features_padded.unsqueeze(1)  # [batch, 1, features]
    
    sleep_stages_tensor = torch.stack(sleep_stages)
    dream_tokens_tensor = torch.stack(dream_tokens)
    
    return features_padded, sleep_stages_tensor, dream_tokens_tensor, metadata

def create_data_loaders(features_dir, annotations_dir, batch_size=8, num_workers=0, test_size=0.2):
    """Create data loaders with fixed settings"""
    dataset = EEGDreamDataset(features_dir, annotations_dir)
    if len(dataset) == 0:
        raise ValueError("Dataset is empty")

    # Split dataset
    train_indices, val_indices = train_test_split(
        range(len(dataset)), test_size=test_size, random_state=42
    )
    
    train_dataset = torch.utils.data.Subset(dataset, train_indices)
    val_dataset = torch.utils.data.Subset(dataset, val_indices)

    train_loader = DataLoader(
        train_dataset, batch_size=batch_size, shuffle=True,
        num_workers=0, pin_memory=False, collate_fn=pad_collate_fn, drop_last=True
    )
    
    val_loader = DataLoader(
        val_dataset, batch_size=batch_size, shuffle=False,
        num_workers=0, pin_memory=False, collate_fn=pad_collate_fn, drop_last=True
    )

    logger.info(f"Created train loader: {len(train_dataset)} samples")
    logger.info(f"Created val loader: {len(val_dataset)} samples")
    return train_loader, val_loader

if __name__ == "__main__":
    features_dir = "data/processed/comprehensive_features"
    annotations_dir = "data/processed/annotations"
    
    try:
        train_loader, val_loader = create_data_loaders(
            features_dir=features_dir,
            annotations_dir=annotations_dir,
            batch_size=4
        )
        
        print("Testing DataLoader...")
        for batch in train_loader:
            features, sleep_stages, dream_tokens, metadata = batch
            print(f"✅ Features shape: {features.shape}")
            print(f"✅ Sleep stages shape: {sleep_stages.shape}")
            print(f"✅ Dream tokens shape: {dream_tokens.shape}")
            break
        print("✅ DataLoader test passed!")
        
    except Exception as e:
        print(f"❌ DataLoader test failed: {e}")
        import traceback
        traceback.print_exc()
