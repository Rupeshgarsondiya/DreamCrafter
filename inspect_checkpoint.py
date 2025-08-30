import torch
import json

def inspect_checkpoint(checkpoint_path):
    """Inspect the model checkpoint to understand its structure"""
    try:
        checkpoint = torch.load(checkpoint_path, map_location='cpu')
        print("Checkpoint keys:", list(checkpoint.keys()))
        
        if 'config' in checkpoint:
            print("\nConfig found in checkpoint:")
            print(json.dumps(checkpoint['config'], indent=2))
        else:
            print("\nNo config in checkpoint. Creating default config...")
            
            # Create default config based on the model architecture
            default_config = {
                'feature_dim': 19,
                'hidden_dim': 128,
                'vocab_size': 5000,
                'num_layers': 2,
                'dropout': 0.1,
                'use_sleep_stages': False
            }
            
            # Save config to file
            config_path = 'model_config.json'
            with open(config_path, 'w') as f:
                json.dump(default_config, f, indent=2)
            
            print(f"Default config saved to {config_path}")
            print("Config:", json.dumps(default_config, indent=2))
            
        if 'model_state_dict' in checkpoint:
            print("\nModel state dict keys:")
            for key in list(checkpoint['model_state_dict'].keys())[:10]:  # Show first 10
                print(f"  {key}")
                
        if 'epoch' in checkpoint:
            print(f"\nTraining epoch: {checkpoint['epoch']}")
            
        if 'best_loss' in checkpoint:
            print(f"Best validation loss: {checkpoint['best_loss']}")
            
    except Exception as e:
        print(f"Error inspecting checkpoint: {e}")

if __name__ == "__main__":
    checkpoint_path = "models/eeg_text_best.pth"
    inspect_checkpoint(checkpoint_path)

