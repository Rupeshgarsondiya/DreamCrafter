"""
GPU-accelerated feature processing for EEG data
"""

import torch
import numpy as np
from pathlib import Path
import h5py

class GPUFeatureProcessor:
    def __init__(self, device='auto'):
        if device == 'auto':
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = torch.device(device)
        
        print(f"Using device: {self.device}")

    def load_features_to_gpu(self, feature_file):
        """Load preprocessed features to GPU"""
        with h5py.File(feature_file, 'r') as f:
            features = f['features'][:]
        
        # Convert to GPU tensor
        features_tensor = torch.from_numpy(features).float().to(self.device)
        return features_tensor

    def gpu_feature_transforms(self, features_tensor):
        """Apply GPU-accelerated transformations"""
        # Normalize on GPU
        features_normalized = torch.nn.functional.normalize(features_tensor, dim=1)
        
        # Apply additional transforms
        features_processed = torch.relu(features_normalized)  # Example transform
        
        return features_processed

def main():
    """Example GPU processing"""
    processor = GPUFeatureProcessor()
    
    # Process all feature files
    feature_dir = Path("data/processed/comprehensive_features")
    for feature_file in feature_dir.glob("*_features.h5"):
        features_gpu = processor.load_features_to_gpu(feature_file)
        processed_features = processor.gpu_feature_transforms(features_gpu)
        print(f"Processed {feature_file.name} on GPU: {processed_features.shape}")

if __name__ == "__main__":
    main()
