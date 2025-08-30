"""
EEG-to-Text Dream Decoder - FIXED INFERENCE SCRIPT
"""

import torch
import torch.nn as nn
import numpy as np
import json
from pathlib import Path
import logging
from typing import List, Dict, Optional
import argparse
from dream_decoding.ml_models.eeg_to_text_model import create_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EEGInference:
    def __init__(self, model_path: str, config_path: Optional[str] = None):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"Using device: {self.device}")
        
        self.model, self.config = self._load_model(model_path, config_path)
        self.model.eval()
        
        self.vocab = self._load_vocabulary()
        
        logger.info(f"✅ Inference engine ready with {sum(p.numel() for p in self.model.parameters()):,} parameters")

    def _load_model(self, model_path: str, config_path: Optional[str] = None):
        """Load trained model from checkpoint"""
        checkpoint = torch.load(model_path, map_location=self.device)
        
        if 'config' in checkpoint:
            config = checkpoint['config']
        elif config_path:
            with open(config_path, 'r') as f:
                config = json.load(f)
        else:
            raise ValueError("No config found in checkpoint or config_path")
        
        model = create_model(config)
        model.load_state_dict(checkpoint['model_state_dict'])
        model.to(self.device)
        
        logger.info(f"Loaded model from epoch {checkpoint.get('epoch', 'unknown')}")
        logger.info(f"Best validation loss: {checkpoint.get('best_loss', 'unknown')}")
        
        return model, config

    def _load_vocabulary(self):
        """Load vocabulary for text generation"""
        vocab_path = Path("data/processed/vocabulary.json")
        if vocab_path.exists():
            with open(vocab_path, 'r') as f:
                vocab = json.load(f)
            logger.info(f"✅ Loaded vocabulary with {len(vocab)} tokens")
            return vocab
        else:
            # Create enhanced fallback vocabulary with dream words
            logger.warning("❌ No vocabulary file found! Creating enhanced fallback...")
            fallback_vocab = {
                '<PAD>': 0, '<SOS>': 1, '<EOS>': 2, '<UNK>': 3,
                'peaceful': 4, 'sleep': 5, 'dreaming': 6, 'softly': 7,
                'flying': 8, 'falling': 9, 'running': 10, 'walking': 11,
                'house': 12, 'room': 13, 'door': 14, 'water': 15,
                'sky': 16, 'person': 17, 'friend': 18, 'animal': 19,
                'bright': 20, 'dark': 21, 'happy': 22, 'scared': 23,
                'seeing': 24, 'feeling': 25, 'beautiful': 26, 'strange': 27,
                'forest': 28, 'ocean': 29, 'mountain': 30, 'city': 31,
                'red': 32, 'blue': 33, 'green': 34, 'white': 35,
                'big': 36, 'small': 37, 'fast': 38, 'slow': 39,
                'warm': 40, 'cold': 41, 'quiet': 42, 'loud': 43,
                'through': 44, 'around': 45, 'above': 46, 'below': 47,
                'inside': 48, 'outside': 49, 'near': 50, 'far': 51,
                'colors': 52, 'sounds': 53, 'memories': 54, 'thoughts': 55,
                'journey': 56, 'adventure': 57, 'mystery': 58, 'wonder': 59,
                'floating': 60, 'dancing': 61, 'singing': 62, 'laughing': 63,
                'golden': 64, 'silver': 65, 'purple': 66, 'orange': 67,
                'crystal': 68, 'magic': 69, 'gentle': 70, 'powerful': 71,
                'endless': 72, 'ancient': 73, 'glowing': 74, 'shining': 75
            }
            logger.warning(f"Using enhanced fallback vocabulary with {len(fallback_vocab)} words")
            return fallback_vocab

    def _process_eeg_features(self, eeg_features):
        """Process and validate EEG features"""
        if isinstance(eeg_features, np.ndarray):
            eeg_features = torch.from_numpy(eeg_features).float()
        
        if len(eeg_features.shape) == 1:
            eeg_features = eeg_features.unsqueeze(0).unsqueeze(0)
        elif len(eeg_features.shape) == 2:
            eeg_features = eeg_features.unsqueeze(1)
        
        if len(eeg_features.shape) == 3:
            batch_size, seq_len, feature_dim = eeg_features.shape
            expected_dim = seq_len * feature_dim
            
            if expected_dim != self.config['feature_dim']:
                raise ValueError(f"Feature dimension mismatch: expected {self.config['feature_dim']}, got {expected_dim}")
            
            eeg_features = eeg_features.view(batch_size, expected_dim)
        
        return eeg_features.to(self.device)

    def _process_sleep_stage(self, sleep_stage):
        """Process sleep stage information"""
        if isinstance(sleep_stage, (int, float)):
            sleep_stage = torch.tensor([sleep_stage], dtype=torch.long)
        elif isinstance(sleep_stage, np.ndarray):
            sleep_stage = torch.from_numpy(sleep_stage).long()
        
        return sleep_stage.to(self.device)

    def _decode_tokens(self, token_ids: torch.Tensor) -> List[str]:
        """Convert token IDs to text using vocabulary"""
        if self.vocab is None:
            return [f"token_{tid.item()}" for tid in token_ids.flatten() if tid.item() not in [0, 1, 2]]
        
        # Create reverse mapping
        idx_to_word = {int(v): str(k) for k, v in self.vocab.items()}
        words = []
        
        for tid in token_ids.flatten():
            tid_val = int(tid.item())
            if tid_val == 0:  # PAD
                continue
            elif tid_val == 1:  # SOS
                continue
            elif tid_val == 2:  # EOS
                break
            else:
                word = idx_to_word.get(tid_val, f"<UNK_{tid_val}>")
                words.append(word)
        
        return words

    def predict_single(self, eeg_features, sleep_stage=None, max_length=50):
        """Generate dream text from single EEG sample"""
        with torch.no_grad():
            eeg_features = self._process_eeg_features(eeg_features)
            
            if self.config.get('use_sleep_stages', False):
                if sleep_stage is None:
                    sleep_stage = 2  # Default to REM sleep
                sleep_stage = self._process_sleep_stage(sleep_stage)
                
                output_tokens = self.model(eeg_features, sleep_stage, max_length=max_length)
            else:
                output_tokens = self.model(eeg_features, max_length=max_length)
            
            # Debug: Print raw tokens
            print(f"Debug - Raw tokens: {output_tokens[0].cpu().numpy().tolist()[:10]}")
            
            words = self._decode_tokens(output_tokens)
            text = " ".join(words)
            
            return {
                'dream_text': text,
                'tokens': output_tokens.cpu().numpy().tolist(),
                'num_tokens': len(words),
                'sleep_stage': sleep_stage.item() if hasattr(sleep_stage, 'item') else sleep_stage
            }

def main():
    parser = argparse.ArgumentParser(description="EEG-to-Text Dream Decoder Inference")
    parser.add_argument("--model", required=True, help="Path to trained model checkpoint")
    parser.add_argument("--config", help="Path to model config (if not in checkpoint)")
    parser.add_argument("--max-length", type=int, default=20, help="Maximum generation length")
    parser.add_argument("--demo", action="store_true", help="Run demo with synthetic data")
    
    args = parser.parse_args()
    
    inference = EEGInference(args.model, args.config)
    
    if args.demo:
        print("\n🧠 Demo: Generating dream text from synthetic EEG...")
        
        # Create synthetic EEG features with correct dimension
        synthetic_eeg = np.random.randn(inference.config['feature_dim'])
        
        result = inference.predict_single(synthetic_eeg, sleep_stage=2, max_length=args.max_length)
        
        print(f"Generated dream text: '{result['dream_text']}'")
        print(f"Number of tokens: {result['num_tokens']}")
        print(f"Sleep stage: {result['sleep_stage']}")
    else:
        print("Use --demo for demo")

if __name__ == "__main__":
    main()
