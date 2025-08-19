"""
EEG-to-Text Neural Network Model - FIXED VERSION
Transforms EEG features into dream text descriptions
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import logging
from typing import Optional, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EEGFeatureEncoder(nn.Module):
    """Encodes EEG features into a latent representation"""

    def __init__(self, input_dim: int, hidden_dim: int = 256, dropout: float = 0.1):
        super().__init__()

        self.encoder = nn.Sequential(
            nn.Linear(input_dim, hidden_dim * 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, hidden_dim),
            nn.LayerNorm(hidden_dim)
        )

    def forward(self, x):
        return self.encoder(x)

class TextDecoder(nn.Module):
    """Decodes latent representation into text sequences"""

    def __init__(self, vocab_size: int, hidden_dim: int = 256, num_layers: int = 2, dropout: float = 0.1):
        super().__init__()
        self.vocab_size = vocab_size
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers

        self.embedding = nn.Embedding(vocab_size, hidden_dim)
        self.lstm = nn.LSTM(
            input_size=hidden_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            dropout=dropout if num_layers > 1 else 0,
            batch_first=True
        )
        self.output_projection = nn.Linear(hidden_dim, vocab_size)
        self.attention = nn.MultiheadAttention(hidden_dim, num_heads=8, dropout=dropout)

    def forward(self, eeg_features, target_sequence=None, max_length=50):
        batch_size = eeg_features.size(0)
        if target_sequence is not None:
            return self._forward_training(eeg_features, target_sequence)
        else:
            return self._forward_inference(eeg_features, max_length)

    def _forward_training(self, eeg_features, target_sequence):
        embedded = self.embedding(target_sequence)
        h_0 = eeg_features.unsqueeze(0).repeat(self.num_layers, 1, 1)
        c_0 = torch.zeros_like(h_0)

        lstm_out, _ = self.lstm(embedded, (h_0, c_0))

        attended_out, _ = self.attention(
            lstm_out.transpose(0, 1),
            eeg_features.unsqueeze(0).repeat(lstm_out.size(1), 1, 1),
            eeg_features.unsqueeze(0).repeat(lstm_out.size(1), 1, 1)
        )
        attended_out = attended_out.transpose(0, 1)

        output = self.output_projection(attended_out)
        return output

    def _forward_inference(self, eeg_features, max_length):
        batch_size = eeg_features.size(0)
        device = eeg_features.device

        outputs = []
        current_token = torch.ones(batch_size, 1, dtype=torch.long, device=device)

        h = eeg_features.unsqueeze(0).repeat(self.num_layers, 1, 1)
        c = torch.zeros_like(h)

        for _ in range(max_length):
            embedded = self.embedding(current_token)
            lstm_out, (h, c) = self.lstm(embedded, (h, c))

            attended_out, _ = self.attention(
                lstm_out.transpose(0, 1),
                eeg_features.unsqueeze(0),
                eeg_features.unsqueeze(0)
            )
            attended_out = attended_out.transpose(0, 1)

            logits = self.output_projection(attended_out)
            current_token = torch.argmax(logits, dim=-1)
            outputs.append(current_token)

            if (current_token == 2).all():  # EOS = 2
                break

        return torch.cat(outputs, dim=1)

# ✅ STEP 1: Define EEGToTextModel FIRST
class EEGToTextModel(nn.Module):
    """Complete EEG-to-Text model"""

    def __init__(self, feature_dim: int, vocab_size: int, hidden_dim: int = 256, num_layers: int = 2, dropout: float = 0.1):
        super().__init__()
        self.feature_dim = feature_dim
        self.vocab_size = vocab_size
        self.hidden_dim = hidden_dim

        self.eeg_encoder = EEGFeatureEncoder(feature_dim, hidden_dim, dropout)
        self.text_decoder = TextDecoder(vocab_size, hidden_dim, num_layers, dropout)

    def forward(self, eeg_features, target_sequence=None, max_length=50):
        # Handle 3D input properly
        if len(eeg_features.shape) == 3:
            batch_size, seq_len, feature_dim = eeg_features.shape
            eeg_features = eeg_features.view(batch_size, -1)

        encoded_eeg = self.eeg_encoder(eeg_features)
        text_output = self.text_decoder(encoded_eeg, target_sequence, max_length)
        return text_output

    def generate(self, eeg_features, max_length=50):
        """Generate text from EEG features (inference mode)"""
        self.eval()
        with torch.no_grad():
            return self.forward(eeg_features, target_sequence=None, max_length=max_length)

# ✅ STEP 2: Define EEGToTextWithSleepStage SECOND
class EEGToTextWithSleepStage(nn.Module):
    """Extended model that includes sleep stage information"""

    def __init__(self, feature_dim: int, vocab_size: int, num_sleep_stages: int = 5, 
                 hidden_dim: int = 256, num_layers: int = 2, dropout: float = 0.1):
        super().__init__()

        self.base_model = EEGToTextModel(
            feature_dim=feature_dim,
            vocab_size=vocab_size,
            hidden_dim=hidden_dim,
            num_layers=num_layers,
            dropout=dropout
        )

        self.sleep_stage_embedding = nn.Embedding(num_sleep_stages, hidden_dim // 4)
        self.feature_combiner = nn.Linear(hidden_dim + hidden_dim // 4, hidden_dim)

    @property
    def eeg_encoder(self):
        """Expose eeg_encoder from base_model"""
        return self.base_model.eeg_encoder

    @property
    def text_decoder(self):
        """Expose text_decoder from base_model"""
        return self.base_model.text_decoder

    def forward(self, eeg_features, sleep_stages, target_sequence=None, max_length=50):
        # Handle 3D input properly
        if len(eeg_features.shape) == 3:
            batch_size, seq_len, feature_dim = eeg_features.shape
            eeg_features = eeg_features.view(batch_size, -1)

        # Encode EEG features
        encoded_eeg = self.base_model.eeg_encoder(eeg_features)

        # Embed sleep stages
        embedded_sleep = self.sleep_stage_embedding(sleep_stages)

        # Handle dimension mismatch
        if embedded_sleep.dim() == 3:
            embedded_sleep = embedded_sleep.mean(dim=1)
        elif embedded_sleep.dim() == 2 and embedded_sleep.size(1) == 1:
            embedded_sleep = embedded_sleep.squeeze(1)

        # Ensure both are 2D before concatenation
        assert encoded_eeg.dim() == 2, f"encoded_eeg must be 2D, got {encoded_eeg.shape}"
        assert embedded_sleep.dim() == 2, f"embedded_sleep must be 2D, got {embedded_sleep.shape}"

        # Concatenate features
        combined_features = torch.cat([encoded_eeg, embedded_sleep], dim=-1)
        combined_features = self.feature_combiner(combined_features)

        # Decode to text
        text_output = self.base_model.text_decoder(combined_features, target_sequence, max_length)

        return text_output

# ✅ STEP 3: Define create_model function LAST
def create_model(config):
    """Factory function to create complete model"""
    logger.info(f"Creating model with config: {config}")
    
    if config.get('use_sleep_stages', False):
        model = EEGToTextWithSleepStage(
            feature_dim=config['feature_dim'],
            vocab_size=config['vocab_size'],
            num_sleep_stages=config.get('num_sleep_stages', 5),
            hidden_dim=config.get('hidden_dim', 256),
            num_layers=config.get('num_layers', 2),
            dropout=config.get('dropout', 0.1)
        )
        
    else:
        model = EEGToTextModel(
            feature_dim=config['feature_dim'],
            vocab_size=config['vocab_size'],
            hidden_dim=config.get('hidden_dim', 256),
            num_layers=config.get('num_layers', 2),
            dropout=config.get('dropout', 0.1)
        )
    
    logger.info(f"✅ Created {type(model).__name__} with {sum(p.numel() for p in model.parameters())} parameters")
    return model

if __name__ == "__main__":
    # Test model creation
    config = {
        'feature_dim': 28,
        'vocab_size': 100,
        'hidden_dim': 256,
        'num_layers': 2,
        'dropout': 0.1,
        'use_sleep_stages': True
    }

    model = create_model(config)
    print(f"Model created with {sum(p.numel() for p in model.parameters())} parameters")
