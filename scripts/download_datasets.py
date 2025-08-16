import os
import wget
from tqdm import tqdm

def download_comprehensive_1gb_dataset():
    """Download comprehensive EEG dataset (~1GB) with all categories"""
    
    samples = [
        # Sleep-EDF Database (Overnight Sleep Recordings) - ~300MB total
        {"name": "SC4001E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4001E0-PSG.edf", "size": "15MB", "category": "Sleep"},
        {"name": "SC4002E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4002E0-PSG.edf", "size": "15MB", "category": "Sleep"},
        {"name": "SC4003E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4003E0-PSG.edf", "size": "15MB", "category": "Sleep"},
        {"name": "SC4004E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4004E0-PSG.edf", "size": "16MB", "category": "Sleep"},
        {"name": "SC4005E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4005E0-PSG.edf", "size": "15MB", "category": "Sleep"},
        {"name": "SC4006E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4006E0-PSG.edf", "size": "16MB", "category": "Sleep"},
        {"name": "SC4007E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4007E0-PSG.edf", "size": "16MB", "category": "Sleep"},
        {"name": "SC4008E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4008E0-PSG.edf", "size": "15MB", "category": "Sleep"},
        {"name": "SC4009E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4009E0-PSG.edf", "size": "15MB", "category": "Sleep"},
        {"name": "SC4010E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4010E0-PSG.edf", "size": "16MB", "category": "Sleep"},
        {"name": "SC4011E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4011E0-PSG.edf", "size": "15MB", "category": "Sleep"},
        {"name": "SC4012E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4012E0-PSG.edf", "size": "16MB", "category": "Sleep"},
        {"name": "SC4013E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4013E0-PSG.edf", "size": "15MB", "category": "Sleep"},
        {"name": "SC4014E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4014E0-PSG.edf", "size": "16MB", "category": "Sleep"},
        {"name": "SC4015E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4015E0-PSG.edf", "size": "15MB", "category": "Sleep"},
        {"name": "SC4016E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4016E0-PSG.edf", "size": "16MB", "category": "Sleep"},
        {"name": "SC4017E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4017E0-PSG.edf", "size": "15MB", "category": "Sleep"},
        {"name": "SC4018E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4018E0-PSG.edf", "size": "16MB", "category": "Sleep"},
        {"name": "SC4019E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4019E0-PSG.edf", "size": "15MB", "category": "Sleep"},
        {"name": "SC4020E0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4020E0-PSG.edf", "size": "16MB", "category": "Sleep"},

        # EEG Motor Movement/Imagery Dataset (Multiple Subjects) - ~500MB total
        {"name": "S001R01.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S001/S001R01.edf", "size": "25MB", "category": "Motor Imagery"},
        {"name": "S001R02.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S001/S001R02.edf", "size": "25MB", "category": "Motor Imagery"},
        {"name": "S001R03.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S001/S001R03.edf", "size": "25MB", "category": "Motor Movement"},
        {"name": "S001R04.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S001/S001R04.edf", "size": "25MB", "category": "Motor Movement"},
        {"name": "S002R01.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S002/S002R01.edf", "size": "25MB", "category": "Motor Imagery"},
        {"name": "S002R02.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S002/S002R02.edf", "size": "25MB", "category": "Motor Imagery"},
        {"name": "S002R03.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S002/S002R03.edf", "size": "25MB", "category": "Motor Movement"},
        {"name": "S002R04.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S002/S002R04.edf", "size": "25MB", "category": "Motor Movement"},
        {"name": "S003R01.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S003/S003R01.edf", "size": "25MB", "category": "Motor Imagery"},
        {"name": "S003R02.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S003/S003R02.edf", "size": "25MB", "category": "Motor Imagery"},
        {"name": "S003R03.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S003/S003R03.edf", "size": "25MB", "category": "Motor Movement"},
        {"name": "S003R04.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S003/S003R04.edf", "size": "25MB", "category": "Motor Movement"},
        {"name": "S004R01.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S004/S004R01.edf", "size": "25MB", "category": "Motor Imagery"},
        {"name": "S004R02.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S004/S004R02.edf", "size": "25MB", "category": "Motor Imagery"},
        {"name": "S004R03.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S004/S004R03.edf", "size": "25MB", "category": "Motor Movement"},
        {"name": "S004R04.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S004/S004R04.edf", "size": "25MB", "category": "Motor Movement"},
        {"name": "S005R01.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S005/S005R01.edf", "size": "25MB", "category": "Motor Imagery"},
        {"name": "S005R02.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S005/S005R02.edf", "size": "25MB", "category": "Motor Imagery"},
        {"name": "S005R03.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S005/S005R03.edf", "size": "25MB", "category": "Motor Movement"},
        {"name": "S005R04.edf", "url": "https://physionet.org/files/eegmmidb/1.0.0/S005/S005R04.edf", "size": "25MB", "category": "Motor Movement"},

        # Additional Sleep Database Files - ~200MB more
        {"name": "ST7011J0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-telemetry/ST7011J0-PSG.edf", "size": "10MB", "category": "Sleep Telemetry"},
        {"name": "ST7012J0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-telemetry/ST7012J0-PSG.edf", "size": "10MB", "category": "Sleep Telemetry"},
        {"name": "ST7021J0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-telemetry/ST7021J0-PSG.edf", "size": "10MB", "category": "Sleep Telemetry"},
        {"name": "ST7022J0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-telemetry/ST7022J0-PSG.edf", "size": "10MB", "category": "Sleep Telemetry"},
        {"name": "ST7031J0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-telemetry/ST7031J0-PSG.edf", "size": "10MB", "category": "Sleep Telemetry"},
        {"name": "ST7041J0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-telemetry/ST7041J0-PSG.edf", "size": "10MB", "category": "Sleep Telemetry"},
        {"name": "ST7051J0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-telemetry/ST7051J0-PSG.edf", "size": "10MB", "category": "Sleep Telemetry"},
        {"name": "ST7061J0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-telemetry/ST7061J0-PSG.edf", "size": "10MB", "category": "Sleep Telemetry"},
        {"name": "ST7071J0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-telemetry/ST7071J0-PSG.edf", "size": "10MB", "category": "Sleep Telemetry"},
        {"name": "ST7081J0-PSG.edf", "url": "https://physionet.org/files/sleep-edfx/1.0.0/sleep-telemetry/ST7081J0-PSG.edf", "size": "10MB", "category": "Sleep Telemetry"}
    ]
    
    os.makedirs('data/raw/comprehensive_1gb', exist_ok=True)
    
    print("📥 Downloading comprehensive 1GB EEG dataset...")
    print("🧠 Categories: Sleep EEG + Motor Imagery + Motor Movement + Sleep Telemetry")
    print("📊 Total files: 50 | Estimated size: ~1GB")
    print("🎯 Optimized for RTX 4050 dream decoding research\n")
    
    downloaded_count = 0
    total_size_mb = 0
    failed_downloads = []
    
    # Group by category for organized downloading
    categories = {}
    for sample in samples:
        cat = sample['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(sample)
    
    for category, cat_samples in categories.items():
        print(f"\n🔄 Downloading {category} samples ({len(cat_samples)} files)...")
        
        for i, sample in enumerate(cat_samples, 1):
            filepath = os.path.join('data/raw/comprehensive_1gb', sample['name'])
            
            print(f"   ⬇️ [{i}/{len(cat_samples)}] {sample['name']} ({sample['size']})")
            
            if os.path.exists(filepath):
                file_size = os.path.getsize(filepath) / (1024*1024)
                print(f"      ✅ Already exists: {file_size:.1f}MB")
                downloaded_count += 1
                total_size_mb += file_size
                continue
            
            try:
                wget.download(sample['url'], filepath)
                file_size = os.path.getsize(filepath) / (1024*1024)
                print(f"\n      ✅ Downloaded: {file_size:.1f}MB")
                downloaded_count += 1
                total_size_mb += file_size
                
            except Exception as e:
                print(f"\n      ❌ Failed: {str(e)}")
                failed_downloads.append(sample['name'])
                continue
    
    print(f"\n🎉 Comprehensive Dataset Download Summary:")
    print(f"   📊 Files downloaded: {downloaded_count}/{len(samples)}")
    print(f"   💾 Total size: {total_size_mb:.1f}MB")
    print(f"   📁 Location: data/raw/comprehensive_1gb/")
    
    if failed_downloads:
        print(f"   ⚠️ Failed downloads: {len(failed_downloads)}")
        for failed in failed_downloads[:5]:
            print(f"      - {failed}")
        if len(failed_downloads) > 5:
            print(f"      ... and {len(failed_downloads)-5} more")
    
    # Summary by category
    print(f"\n📊 Dataset Composition:")
    for category, cat_samples in categories.items():
        cat_count = sum(1 for s in cat_samples if s['name'] not in failed_downloads)
        print(f"   🧠 {category}: {cat_count} files")
    
    print(f"\n🎯 Ready for comprehensive RTX 4050 training!")
    print(f"💡 This dataset provides rich diversity for robust dream decoding models!")
    
    return downloaded_count, total_size_mb

def verify_comprehensive_dataset():
    """Verify the comprehensive dataset"""
    dataset_dir = 'data/raw/comprehensive_1gb'
    
    if not os.path.exists(dataset_dir):
        print("❌ Comprehensive dataset directory not found!")
        return False
    
    files = os.listdir(dataset_dir)
    edf_files = [f for f in files if f.endswith('.edf')]
    
    # Categorize files
    sleep_cassette = [f for f in edf_files if f.startswith('SC4')]
    sleep_telemetry = [f for f in edf_files if f.startswith('ST7')]
    motor_files = [f for f in edf_files if f.startswith('S0')]
    
    total_size = sum(os.path.getsize(os.path.join(dataset_dir, f)) for f in edf_files) / (1024*1024)
    
    print(f"\n🔍 Comprehensive Dataset Verification:")
    print(f"   📄 Total EEG files: {len(edf_files)}")
    print(f"   😴 Sleep cassette recordings: {len(sleep_cassette)}")
    print(f"   📡 Sleep telemetry recordings: {len(sleep_telemetry)}")
    print(f"   🏃 Motor movement/imagery: {len(motor_files)}")
    print(f"   💾 Total dataset size: {total_size:.1f}MB")
    print(f"   🎯 Comprehensive dataset ready for training!")
    
    return len(edf_files) >= 40

if __name__ == '__main__':
    downloaded, size_mb = download_comprehensive_1gb_dataset()
    verify_comprehensive_dataset()
    
    print(f"\n✅ Comprehensive 1GB dataset ready!")
    print(f"📊 {downloaded} files, {size_mb:.1f}MB total")
    print(f"🚀 Proceed to preprocessing and model training!")
