import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import os
import time
from tqdm import tqdm

from eeg_dataset import EEGTextDataset
from eeg_to_text_model import EEGToTextModel

class EEGTextTrainer:
    """
    Trainer for EEG-to-Text model
    Optimized for RTX 4050 with small dataset
    """
    
    def __init__(self, model, dataset, batch_size=4, learning_rate=1e-3, device=None):
        self.model = model
        self.dataset = dataset
        self.batch_size = batch_size
        
        # Setup device
        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = device
        
        self.model.to(self.device)
        
        # DataLoader
        self.dataloader = DataLoader(
            dataset, 
            batch_size=batch_size, 
            shuffle=True,
            num_workers=0,  # Set to 0 for small dataset
            pin_memory=True if self.device.type == 'cuda' else False
        )
        
        # Optimizer and loss
        self.optimizer = optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=0.01)
        self.criterion = nn.CrossEntropyLoss(ignore_index=0)  # 0 is padding token
        
        # Learning rate scheduler
        self.scheduler = optim.lr_scheduler.ReduceLROnPlateau(
            self.optimizer, mode='min', factor=0.5, patience=2
        )
        
        print(f"🎯 Training setup:")
        print(f"   Device: {self.device}")
        print(f"   Batch size: {batch_size}")
        print(f"   Dataset size: {len(dataset)}")
        print(f"   Batches per epoch: {len(self.dataloader)}")
    
    def create_dummy_targets(self, batch_size, seq_len):
        """Create dummy target sequences for unsupervised learning"""
        # Generate random sequences (in real implementation, use text tokenization)
        targets = torch.randint(1, self.model.vocab_size, (batch_size, seq_len))
        return targets.to(self.device)
    
    def train_epoch(self):
        """Train one epoch"""
        self.model.train()
        total_loss = 0
        num_batches = 0
        
        progress_bar = tqdm(self.dataloader, desc="Training")
        
        for batch_idx, (eeg_batch, text_batch) in enumerate(progress_bar):
            eeg_batch = eeg_batch.to(self.device)
            
            # Forward pass
            self.optimizer.zero_grad()
            
            # Get model predictions
            outputs = self.model(eeg_batch)  # (batch_size, seq_len, vocab_size)
            
            # Create dummy targets (in real implementation, tokenize text_batch)
            targets = self.create_dummy_targets(eeg_batch.size(0), outputs.size(1))
            
            # Calculate loss
            loss = self.criterion(outputs.reshape(-1, outputs.size(-1)), targets.reshape(-1))
            
            # Backward pass
            loss.backward()
            
            # Gradient clipping
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
            
            self.optimizer.step()
            
            # Track loss
            total_loss += loss.item()
            num_batches += 1
            
            # Update progress bar
            progress_bar.set_postfix({
                'Loss': f"{loss.item():.4f}",
                'Avg Loss': f"{total_loss/num_batches:.4f}"
            })
        
        return total_loss / num_batches
    
    def train(self, num_epochs=30):
        """Train the model for specified epochs"""
        print(f"\n🚀 Starting training for {num_epochs} epochs...")
        
        best_loss = float('inf')
        
        for epoch in range(num_epochs):
            print(f"\n📅 Epoch {epoch + 1}/{num_epochs}")
            
            # Train one epoch
            start_time = time.time()
            avg_loss = self.train_epoch()
            epoch_time = time.time() - start_time
            
            # Update learning rate
            self.scheduler.step(avg_loss)
            
            # Print epoch summary
            current_lr = self.optimizer.param_groups[0]['lr']
            print(f"✅ Epoch {epoch + 1} completed:")
            print(f"   Average Loss: {avg_loss:.4f}")
            print(f"   Time: {epoch_time:.2f}s")
            print(f"   Learning Rate: {current_lr:.6f}")
            
            # Save best model
            if avg_loss < best_loss:
                best_loss = avg_loss
                self.save_model(f"models/eeg_text_best.pth")
                print(f"   💾 Saved best model (loss: {best_loss:.4f})")
        
        print(f"\n🎉 Training completed!")
        print(f"   Best loss: {best_loss:.4f}")
    
    def save_model(self, filepath):
        """Save model checkpoint"""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        torch.save({
            'model_state_dict': self.model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
        }, filepath)

def main():
    """Main training function"""
    print("🧠 EEG-to-Text Dream Decoding Model Training")
    print("=" * 50)
    
    # Load dataset
    print("📊 Loading dataset...")
    dataset = EEGTextDataset()
    
    if len(dataset) == 0:
        print("❌ No data found! Please run preprocessing first.")
        return
    
    # Create model
    print("🔧 Creating model...")
    model = EEGToTextModel()
    
    # Setup trainer
    trainer = EEGTextTrainer(
        model=model,
        dataset=dataset,
        batch_size=2,  # Small batch size for RTX 4050
        learning_rate=1e-4
    )
    
    # Train model
    trainer.train(num_epochs=200)
    
    print("\n✅ Training completed successfully!")
    print("🚀 Ready for inference and evaluation!")

if __name__ == "__main__":
    main()
