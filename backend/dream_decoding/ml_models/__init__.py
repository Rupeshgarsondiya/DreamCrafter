"""
ML Models Package for Dream Decoding
"""

# Import key functions for easy access
from dream_decoding.ml_models.eeg_to_text_model import create_model, EEGToTextModel
from dream_decoding.ml_models.inference_wrapper import RobustEEGInferenceEngine
from dream_decoding.ml_models.inference_eeg_text import EEGInference

__all__ = [
    'create_model',
    'EEGToTextModel', 
    'RobustEEGInferenceEngine',
    'EEGInference'
]
