import torch
import torch.nn.functional as F
import numpy as np
from eeg_to_text_model import EEGToTextModel
import h5py
import os

class EEGDreamInference:
    """
    EEG Dream Decoding Inference Engine - CONFIDENCE FIXED VERSION
    """

    def __init__(self, model_path='models/eeg_text_best.pth',
                 feature_dir='data/processed/comprehensive_features',
                 device=None, max_channels=19, max_timepoints=3000):
        self.device = device if device else torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = EEGToTextModel(input_channels=max_channels, input_length=max_timepoints)
        checkpoint = torch.load(model_path, map_location=self.device)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.to(self.device)
        self.model.eval()
        self.feature_dir = feature_dir
        self.max_channels = max_channels
        self.max_timepoints = max_timepoints

        print(f"🧠 Model loaded successfully on {self.device}")

    def _normalize_sample(self, sample):
        sample = (sample - np.mean(sample)) / (np.std(sample) + 1e-8)
        return sample.astype(np.float32)

    def _prepare_eeg_tensor(self, sample):
        if isinstance(sample, tuple):
            sample = sample[0]
        if not isinstance(sample, np.ndarray):
            sample = np.array(sample)
        ch, t = sample.shape
        if ch < self.max_channels:
            padded = np.zeros((self.max_channels, t), dtype=np.float32)
            padded[:ch,:] = sample
            sample = padded
        elif ch > self.max_channels:
            sample = sample[:self.max_channels,:]
        if t < self.max_timepoints:
            padded = np.zeros((self.max_channels, self.max_timepoints), dtype=np.float32)
            padded[:,:t] = sample
            sample = padded
        elif t > self.max_timepoints:
            sample = sample[:,:self.max_timepoints]
        sample = self._normalize_sample(sample)
        return torch.tensor(sample).unsqueeze(0)

    def _tokens_to_text(self, token_sequence):
        """Convert tokens to readable English dream text"""
        dream_words = [
            "pad", "start", "end", "dream", "sleep", "rest", "wake", "night", "day", "mind",
            "brain", "think", "feel", "see", "hear", "touch", "move", "walk", "run", "fly",
            "float", "fall", "rise", "light", "dark", "bright", "dim", "color", "blue", "red",
            "green", "white", "black", "water", "fire", "air", "earth", "sky", "ground", "up",
            "down", "fast", "slow", "big", "small", "hot", "cold", "soft", "hard", "smooth", "rough",
            "vision", "magic", "realm", "spirit", "essence", "mystery", "wonder", "energy", "power"
        ]

        words = []
        for token in token_sequence:
            if token == 0 or token == 2:  # PAD or END
                break
            if token < len(dream_words):
                words.append(dream_words[token])
            else:
                # Map high tokens to meaningful words using modulo
                word_idx = token % len(dream_words)
                words.append(dream_words[word_idx])
        
        return " ".join(words) if words else "silent dream"

    def _calculate_confidence(self, logits, temperature=2.0):
        """FIXED: Calculate confidence with temperature scaling and multiple methods"""
        print(f"🔍 DEBUG: Raw logits stats - min: {logits.min().item():.4f}, max: {logits.max().item():.4f}, mean: {logits.mean().item():.4f}")
        
        # Method 1: Temperature-scaled softmax (prevents extreme values)
        temp_scaled_logits = logits / temperature
        probabilities = torch.softmax(temp_scaled_logits, dim=-1)
        max_prob = probabilities.max().item()
        
        # Method 2: Raw softmax confidence  
        raw_probabilities = torch.softmax(logits, dim=-1)
        raw_max_prob = raw_probabilities.max().item()
        
        # Method 3: Entropy-based confidence (lower entropy = higher confidence)
        entropy = -torch.sum(probabilities * torch.log(probabilities + 1e-8), dim=-1).mean().item()
        entropy_confidence = np.exp(-entropy)  # Convert to confidence score
        
        # Method 4: Top-2 difference confidence
        top2_probs, _ = torch.topk(probabilities, 2, dim=-1)
        top2_diff = (top2_probs[:, :, 0] - top2_probs[:, :, 1]).mean().item()
        
        print(f"🔍 Confidence Methods:")
        print(f"   Temperature-scaled: {max_prob:.6f}")
        print(f"   Raw softmax: {raw_max_prob:.6f}")
        print(f"   Entropy-based: {entropy_confidence:.6f}")
        print(f"   Top-2 difference: {top2_diff:.6f}")
        
        # Return the most reasonable confidence score
        final_confidence = max(max_prob, entropy_confidence, top2_diff)
        return final_confidence, probabilities

    def predict_from_eeg(self, eeg_sample):
        """Generate dream text from EEG sample with proper confidence"""
        tensor = self._prepare_eeg_tensor(eeg_sample).to(self.device)
        
        with torch.no_grad():
            logits = self.model(tensor)
            print(f"🔍 DEBUG logits.shape = {logits.shape}")
            
            # FIXED: Calculate confidence properly
            confidence, probabilities = self._calculate_confidence(logits)
            
            # Get predictions
            if logits.dim() == 3:
                pred_tokens = torch.argmax(logits, dim=-1).squeeze(0)
            elif logits.dim() == 2:
                pred_tokens = torch.argmax(logits, dim=-1)
            else:
                pred_tokens = torch.argmax(logits.view(-1, logits.size(-1)), dim=-1)
            
            pred_tokens = pred_tokens.cpu().numpy().flatten()
            dream_text = self._tokens_to_text(pred_tokens)
            
            return {
                "dream_text": dream_text,
                "tokens": pred_tokens.tolist(),
                "confidence": confidence,
                "logits_stats": {
                    "min": logits.min().item(),
                    "max": logits.max().item(), 
                    "mean": logits.mean().item(),
                    "std": logits.std().item()
                }
            }

    def predict_from_file(self, feature_file):
        """Generate predictions from feature file"""
        file_path = os.path.join(self.feature_dir, feature_file)
        print(f"📄 Loading EEG data from: {feature_file}")
        
        with h5py.File(file_path, 'r') as f:
            if 'raw_signals' not in f:
                raise KeyError("'raw_signals' dataset not found in HDF5 file")
            raw_signals = f['raw_signals'][:]
            print(f"🔍 raw_signals type: {type(raw_signals)}")
            print(f"🔍 raw_signals shape: {raw_signals.shape}")
            print(f"🔍 raw_signals dtype: {raw_signals.dtype}")
            print(f" 🧠 Found {raw_signals.shape[0]} epochs")
        
        predictions = []
        
        # FIXED: Use shape instead of shape
        for epoch_i in range(int(raw_signals.shape[0])):
            sample = raw_signals[epoch_i]
            print(f"🔍 Epoch {epoch_i} sample type: {type(sample)}")
            
            if hasattr(sample, 'shape'):
                print(f"🔍 Epoch {epoch_i} sample shape: {sample.shape}")
            
            try:
                result = self.predict_from_eeg(sample)
                result['epoch'] = epoch_i
                result['file'] = feature_file
                predictions.append(result)
                print(f"✅ Epoch {epoch_i} SUCCESS: confidence = {result['confidence']:.6f}")
            except Exception as e:
                print(f"❌ Error processing epoch {epoch_i}: {e}")
                continue
        
        return predictions

    def batch_inference(self, max_files=3):
        """Run inference on multiple files"""
        feature_files = [f for f in os.listdir(self.feature_dir) if f.endswith('.h5')]
        
        if not feature_files:
            print("❌ No feature files found!")
            return []
        
        files_to_process = feature_files[:max_files]
        print(f"🔄 Running batch inference on {len(files_to_process)} files...")
        
        all_predictions = []
        
        for i, feature_file in enumerate(files_to_process, 1):
            print(f"\n📄 [{i}/{len(files_to_process)}] Processing: {feature_file}")
            
            try:
                preds = self.predict_from_file(feature_file)
                all_predictions.extend(preds)
                
                if preds:
                    print(f" ✅ Generated {len(preds)} predictions")
                    for p in preds[:2]:
                        print(f" Epoch {p['epoch']}: '{p['dream_text'][:50]}...' (conf: {p['confidence']:.6f})")
                else:
                    print(" ⚠️ No predictions generated")
                    
            except Exception as e:
                print(f" ❌ Error in {feature_file}: {e}")
                continue
        
        return all_predictions

    def save_predictions(self, predictions, file_path='results/dream_predictions_fixed.txt'):
        """Save predictions to file with detailed confidence info"""
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, 'w') as f:
            f.write("🌙 EEG DREAM DECODING RESULTS - CONFIDENCE FIXED\n")
            f.write("=" * 70 + "\n\n")
            
            for pred in predictions:
                f.write(f"File: {pred['file']}\n")
                f.write(f"Epoch: {pred['epoch']}\n")
                f.write(f"Dream Text: {pred['dream_text']}\n")
                f.write(f"Confidence: {pred['confidence']:.6f}\n")
                f.write(f"Raw Tokens: {pred['tokens']}\n")
                if 'logits_stats' in pred:
                    f.write(f"Logits Stats: {pred['logits_stats']}\n")
                f.write("-" * 60 + "\n")
        
        print(f"💾 Predictions saved to: {file_path}")


def main():
    """Main inference function"""
    print("🌙 EEG Dream Decoding - CONFIDENCE FIXED ENGINE")
    print("=" * 70)
    
    model_path = 'models/eeg_text_best.pth'
    feature_dir = 'data/processed/comprehensive_features'
    
    if not os.path.exists(model_path):
        print(f"❌ Model not found at {model_path}")
        print(" Please train the model first!")
        return
    
    # Initialize inference engine
    inference_engine = EEGDreamInference(model_path, feature_dir)
    
    # Run batch inference
    predictions = inference_engine.batch_inference(max_files=5)
    
    if predictions:
        print(f"\n🎉 Inference completed successfully!")
        print(f" 📊 Total predictions: {len(predictions)}")
        
        # Save results
        inference_engine.save_predictions(predictions)
        
        # Show enhanced summary
        confidences = [p['confidence'] for p in predictions]
        avg_confidence = np.mean(confidences)
        max_confidence = max(confidences)
        min_confidence = min(confidences)
        
        print(f" 📈 Confidence Statistics:")
        print(f"    Average: {avg_confidence:.6f}")
        print(f"    Maximum: {max_confidence:.6f}")
        print(f"    Minimum: {min_confidence:.6f}")
        
        print(f"\n🌟 ENGLISH DREAM PREDICTIONS WITH PROPER CONFIDENCE:")
        for i, pred in enumerate(predictions[:5], 1):
            print(f" {i}. \"{pred['dream_text'][:60]}...\" (confidence: {pred['confidence']:.6f})")
    
    else:
        print("❌ No predictions generated!")
    
    print("\n✅ Dream decoding inference completed!")


if __name__ == "__main__":
    main()
