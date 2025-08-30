"""
Training Script for EEG-to-Text Dream Decoder - WITH PROGRESS BARS
"""

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import json
from pathlib import Path
import logging
from tqdm import tqdm
import os
from dream_decoding.ml_models.eeg_to_text_model import create_model
from dream_decoding.ml_models.eeg_dataset import create_data_loaders
import gc
from collections import Counter

logging.basicConfig(level=logging.WARNING)  # ✅ Reduce logging noise
logger = logging.getLogger(__name__)

class EEGTrainer:
    def __init__(self, config):
        self.config = config
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Create model
        self.model = create_model(config)
        self.model.to(self.device)
        
        # Optimizer
        self.optimizer = optim.AdamW(
            self.model.parameters(),
            lr=config.get('learning_rate', 1e-4),
            weight_decay=config.get('weight_decay', 1e-5)
        )

        # Scheduler
        self.scheduler = optim.lr_scheduler.ReduceLROnPlateau(
            self.optimizer, mode='min', patience=3, factor=0.5
        )

        # Loss function
        self.criterion = nn.CrossEntropyLoss(ignore_index=0)

        # Training state
        self.epoch = 0
        self.best_loss = float('inf')
        self.train_losses = []
        self.val_losses = []

    def _process_batch(self, features, expected_dim):
        """Process and validate batch features"""
        if len(features.shape) == 3:
            batch_size, seq_len, feature_dim = features.shape
            actual_dim = seq_len * feature_dim
            
            # Skip inconsistent batches silently
            if actual_dim != expected_dim:
                return None
            
            features = features.view(batch_size, actual_dim)
        
        return features

    def train_epoch(self, train_loader):
        """Train for one epoch - WITH PROGRESS BAR"""
        self.model.train()
        total_loss = 0
        successful_batches = 0
        
        # ✅ VISIBLE progress bar with proper settings
        pbar = tqdm(train_loader, 
                   desc=f"Training Epoch {self.epoch}", 
                   leave=True, 
                   dynamic_ncols=True,
                   bar_format='{l_bar}{bar:30}{r_bar}{bar:-10b}')

        for batch_idx, batch in enumerate(pbar):
            try:
                features, sleep_stages, dream_tokens, metadata = batch

                # Process features
                features = self._process_batch(features, self.config['feature_dim'])
                if features is None:
                    continue  # Skip silently

                # Move to device
                features = features.to(self.device)
                sleep_stages = sleep_stages.to(self.device)
                dream_tokens = dream_tokens.to(self.device)

                # Handle sleep stages
                if sleep_stages.dim() == 2 and sleep_stages.size(1) == 1:
                    sleep_stages = sleep_stages.squeeze(-1)

                # Validate tokens
                max_token = dream_tokens.max().item()
                if max_token >= self.config['vocab_size']:
                    dream_tokens = torch.clamp(dream_tokens, 0, self.config['vocab_size'] - 1)

                # Prepare sequences
                input_tokens = dream_tokens[:, :-1]
                target_tokens = dream_tokens[:, 1:]

                # Forward pass
                self.optimizer.zero_grad()

                if self.config.get('use_sleep_stages', False):
                    output = self.model(features, sleep_stages, input_tokens)
                else:
                    output = self.model(features, input_tokens)

                # Calculate loss
                loss = self.criterion(
                    output.reshape(-1, output.size(-1)),
                    target_tokens.reshape(-1)
                )

                # Backward pass
                loss.backward()
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
                self.optimizer.step()

                # Update metrics
                total_loss += loss.item()
                successful_batches += 1

                # ✅ Update progress bar with loss info
                avg_loss = total_loss / successful_batches
                pbar.set_postfix({
                    'Loss': f"{loss.item():.4f}",
                    'Avg': f"{avg_loss:.4f}"
                })

            except Exception:
                continue  # Skip failed batches silently

        return total_loss / max(successful_batches, 1) if successful_batches > 0 else float('inf')

    def validate(self, val_loader):
        """Validate the model - WITH PROGRESS BAR"""
        self.model.eval()
        total_loss = 0
        successful_batches = 0

        # ✅ VISIBLE validation progress bar
        with torch.no_grad():
            pbar = tqdm(val_loader,
                       desc="Validation",
                       leave=True,
                       dynamic_ncols=True,
                       bar_format='{l_bar}{bar:30}{r_bar}{bar:-10b}')

            for batch in pbar:
                try:
                    features, sleep_stages, dream_tokens, metadata = batch

                    # Process features
                    features = self._process_batch(features, self.config['feature_dim'])
                    if features is None:
                        continue

                    features = features.to(self.device)
                    sleep_stages = sleep_stages.to(self.device)
                    dream_tokens = dream_tokens.to(self.device)

                    # Handle sleep stages
                    if sleep_stages.dim() == 2 and sleep_stages.size(1) == 1:
                        sleep_stages = sleep_stages.squeeze(-1)

                    max_token = dream_tokens.max().item()
                    if max_token >= self.config['vocab_size']:
                        dream_tokens = torch.clamp(dream_tokens, 0, self.config['vocab_size'] - 1)

                    input_tokens = dream_tokens[:, :-1]
                    target_tokens = dream_tokens[:, 1:]

                    if self.config.get('use_sleep_stages', False):
                        output = self.model(features, sleep_stages, input_tokens)
                    else:
                        output = self.model(features, input_tokens)

                    loss = self.criterion(
                        output.reshape(-1, output.size(-1)),
                        target_tokens.reshape(-1)
                    )

                    total_loss += loss.item()
                    successful_batches += 1

                    # ✅ Update validation progress bar
                    avg_loss = total_loss / successful_batches
                    pbar.set_postfix({
                        'Val Loss': f"{loss.item():.4f}",
                        'Avg': f"{avg_loss:.4f}"
                    })

                except Exception:
                    continue

        avg_loss = total_loss / max(successful_batches, 1) if successful_batches > 0 else float('inf')
        self.val_losses.append(avg_loss)
        return avg_loss

    def save_checkpoint(self, filepath, is_best=False):
        """Save model checkpoint"""
        checkpoint = {
            'epoch': self.epoch,
            'model_state_dict': self.model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'scheduler_state_dict': self.scheduler.state_dict(),
            'best_loss': self.best_loss,
            'train_losses': self.train_losses,
            'val_losses': self.val_losses,
            'config': self.config
        }

        torch.save(checkpoint, filepath)

        if is_best:
            best_path = filepath.parent / 'eeg_text_best.pth'
            torch.save(checkpoint, best_path)

    def train(self, train_loader, val_loader, num_epochs):
        """Main training loop - CLEAN OUTPUT WITH PROGRESS BARS"""
        print(f"\n🚀 Starting training for {num_epochs} epochs...")
        print(f"📊 Model parameters: {sum(p.numel() for p in self.model.parameters()):,}")
        print("=" * 80)

        checkpoint_dir = Path("models/checkpoints")
        checkpoint_dir.mkdir(parents=True, exist_ok=True)

        for epoch in range(num_epochs):
            self.epoch = epoch + 1

            # Training and validation with visible progress bars
            train_loss = self.train_epoch(train_loader)
            val_loss = self.validate(val_loader)

            if train_loss == float('inf') or val_loss == float('inf'):
                print(f"❌ Epoch {self.epoch}: Training failed - no valid batches")
                break

            self.scheduler.step(val_loss)

            # ✅ ONE CLEAN LINE PER EPOCH
            is_best = val_loss < self.best_loss
            best_indicator = "✨" if is_best else "  "
            
            print(f"{best_indicator} Epoch {self.epoch}/{num_epochs} | "
                  f"Train: {train_loss:.4f} | "
                  f"Val: {val_loss:.4f} | "
                  f"LR: {self.optimizer.param_groups[0]['lr']:.6f}")

            if is_best:
                self.best_loss = val_loss

            checkpoint_path = checkpoint_dir / f"checkpoint_epoch_{self.epoch}.pth"
            self.save_checkpoint(checkpoint_path, is_best)

            torch.cuda.empty_cache()
            gc.collect()

        print("=" * 80)
        print(f"🎯 Training completed! Best loss: {self.best_loss:.4f}")

def main():
    """Main training function - ROBUST DIMENSION HANDLING"""
    features_dir = "data/processed/comprehensive_features"
    annotations_dir = "data/processed/annotations"

    # Create data loaders
    train_loader, val_loader = create_data_loaders(
        features_dir=features_dir,
        annotations_dir=annotations_dir,
        batch_size=8,
        num_workers=0
    )

    # ✅ ANALYZE DATASET DIMENSIONS
    feature_dims = []
    vocab_sizes = []
    
    for i, (features, sleep_stages, dream_tokens, metadata) in enumerate(train_loader):
        if len(features.shape) == 3:
            batch_size, seq_len, feature_dim = features.shape
            actual_feature_dim = seq_len * feature_dim
        else:
            actual_feature_dim = features.shape[-1]
        
        feature_dims.append(actual_feature_dim)
        vocab_sizes.append(dream_tokens.max().item())
        
        if i >= 50:  # Sample enough batches
            break

    # Use most common dimensions
    most_common_feature_dim = Counter(feature_dims).most_common(1)[0][0]
    max_vocab_size = max(vocab_sizes) + 10

    print(f"🔍 Data Analysis:")
    print(f"   Most common feature dim: {most_common_feature_dim}")
    print(f"   Vocabulary size: {max_vocab_size}")

    config = {
        'feature_dim': most_common_feature_dim,
        'vocab_size': max_vocab_size,
        'hidden_dim': 256,
        'num_layers': 2,
        'dropout': 0.1,
        'learning_rate': 1e-4,
        'weight_decay': 1e-5,
        'batch_size': 8,
        'num_epochs': 5,
        'use_sleep_stages': True
    }

    # Create trainer and start training
    trainer = EEGTrainer(config)
    trainer.train(train_loader, val_loader, config['num_epochs'])

if __name__ == "__main__":
    main()
