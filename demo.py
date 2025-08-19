import numpy as np
import mne
from datetime import datetime
import os

def create_demo_edf_file(filename="demo_dream_eeg.edf", duration_minutes=5):
    """
    Create a realistic demo EDF file for EEG dream analysis testing
    FIXED VERSION - Compatible with all MNE versions
    """
    
    # EEG parameters
    sfreq = 256  # Sampling frequency (Hz)
    duration = duration_minutes * 60  # Duration in seconds
    n_channels = 19  # Number of EEG channels
    
    # Standard 10-20 EEG channel names
    ch_names = [
        'Fp1', 'Fp2', 'F7', 'F3', 'Fz', 'F4', 'F8',
        'T3', 'C3', 'Cz', 'C4', 'T4',
        'T5', 'P3', 'Pz', 'P4', 'T6',
        'O1', 'O2'
    ]
    
    # Generate realistic EEG data
    print(f"Generating {duration_minutes} minutes of synthetic EEG data...")
    
    # Time vector
    times = np.arange(0, duration, 1/sfreq)
    n_samples = len(times)
    
    # Initialize data array
    data = np.zeros((n_channels, n_samples))
    
    # Generate synthetic EEG with different frequency components
    for ch_idx, ch_name in enumerate(ch_names):
        # Base signal with various brain wave frequencies
        
        # Delta waves (0.5-4 Hz) - deep sleep
        delta = 30 * np.sin(2 * np.pi * 2 * times) * np.random.rand()
        
        # Theta waves (4-8 Hz) - light sleep, REM
        theta = 25 * np.sin(2 * np.pi * 6 * times) * (0.5 + 0.5 * np.random.rand())
        
        # Alpha waves (8-13 Hz) - relaxed wakefulness
        alpha = 20 * np.sin(2 * np.pi * 10 * times) * (0.3 + 0.7 * np.random.rand())
        
        # Beta waves (13-30 Hz) - active thinking
        beta = 15 * np.sin(2 * np.pi * 20 * times) * (0.2 + 0.3 * np.random.rand())
        
        # Gamma waves (30-100 Hz) - high-level cognitive functions
        gamma = 10 * np.sin(2 * np.pi * 40 * times) * (0.1 + 0.2 * np.random.rand())
        
        # Combine all frequency components
        eeg_signal = delta + theta + alpha + beta + gamma
        
        # Add realistic noise
        noise = np.random.normal(0, 5, n_samples)
        
        # Add occasional artifacts (eye blinks, muscle artifacts)
        artifacts = np.zeros(n_samples)
        artifact_times = np.random.choice(n_samples, size=int(n_samples * 0.001), replace=False)
        artifacts[artifact_times] = np.random.normal(0, 50, len(artifact_times))
        
        # Channel-specific modifications
        if 'Fp' in ch_name:  # Frontal channels - more eye artifacts
            artifacts *= 2
            alpha *= 0.7
        elif 'O' in ch_name:  # Occipital channels - more alpha
            alpha *= 1.5
        elif 'C' in ch_name:  # Central channels - more sensorimotor rhythms
            beta *= 1.3
        
        # Combine all components
        data[ch_idx] = eeg_signal + noise + artifacts
        
        # Apply realistic amplitude scaling (microvolts)
        data[ch_idx] = data[ch_idx] * 1e-6  # Convert to Volts for MNE
    
    # Create MNE info structure
    ch_types = ['eeg'] * n_channels
    info = mne.create_info(ch_names=ch_names, sfreq=sfreq, ch_types=ch_types)
    
    # Set standard montage
    try:
        montage = mne.channels.make_standard_montage('standard_1020')
        info.set_montage(montage)
    except:
        print("Warning: Could not set montage, continuing without it...")
    
    # Create Raw object
    raw = mne.io.RawArray(data, info)
    
    # FIXED: Use set_meas_date method instead of direct assignment
    try:
        raw.set_meas_date(datetime.now())
    except:
        print("Warning: Could not set measurement date")
    
    # Add some realistic metadata
    raw.info['description'] = 'Synthetic EEG data for dream analysis testing'
    
    # Save as EDF
    print(f"Saving EDF file: {filename}")
    try:
        raw.export(filename, fmt='edf', overwrite=True)
        
        # Verify file creation
        if os.path.exists(filename):
            file_size = os.path.getsize(filename) / (1024 * 1024)  # Size in MB
            
            print(f"✅ Demo EDF file created successfully!")
            print(f"📁 File: {filename}")
            print(f"📊 Size: {file_size:.2f} MB")
            print(f"⏱️  Duration: {duration_minutes} minutes")
            print(f"🧠 Channels: {n_channels} EEG channels")
            print(f"📡 Sampling Rate: {sfreq} Hz")
            
            return filename
        else:
            raise Exception("File was not created")
            
    except Exception as e:
        print(f"❌ Error saving EDF file: {str(e)}")
        return None

def create_simple_demo_files():
    """Create simple demo files with error handling"""
    
    demo_files = [
        ("demo_short_dream.edf", 2),      # 2 minutes - quick test
        ("demo_medium_dream.edf", 5),     # 5 minutes - standard test
        ("demo_long_dream.edf", 10),      # 10 minutes - comprehensive test
    ]
    
    created_files = []
    
    for filename, duration in demo_files:
        try:
            file_path = create_demo_edf_file(filename, duration)
            if file_path:
                created_files.append(file_path)
        except Exception as e:
            print(f"❌ Error creating {filename}: {str(e)}")
    
    return created_files

if __name__ == "__main__":
    print("🧠 DreamCrafter Demo EDF Generator (Fixed Version)")
    print("=" * 50)
    
    try:
        # Create demo files
        print("\n🚀 Creating demo EDF files...")
        created_files = create_simple_demo_files()
        
        if created_files:
            print(f"\n✅ Successfully created {len(created_files)} demo EDF files!")
            print("\n📋 Files created:")
            for file_path in created_files:
                if os.path.exists(file_path):
                    size = os.path.getsize(file_path) / (1024 * 1024)
                    print(f"  • {file_path} ({size:.1f} MB)")
            
            print("\n🎯 How to use these files:")
            print("1. Upload any of these files in your DreamCrafter dashboard")
            print("2. Click 'Decode Dream Patterns'")
            print("3. Wait for the AI to analyze and generate dream description")
            print("4. View the results and analysis report")
        else:
            print("❌ No files were created. Check error messages above.")
        
    except Exception as e:
        print(f"❌ Fatal Error: {str(e)}")
        print("\nTry running:")
        print("pip install --upgrade mne")
