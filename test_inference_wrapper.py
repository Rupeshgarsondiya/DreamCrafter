import sys
import os
sys.path.append('.')

from backend.dream_decoding.ml_models.inference_wrapper import get_inference_engine

def test_inference_wrapper():
    """Test the inference wrapper with a demo EDF file"""
    try:
        print("🧠 Testing DreamCrafter Inference Wrapper...")
        
        # Get the inference engine
        print("Loading inference engine...")
        inference_engine = get_inference_engine()
        print("✅ Inference engine loaded successfully!")
        
        # Test with a demo EDF file
        demo_file = "demo_short_dream.edf"
        
        if os.path.exists(demo_file):
            print(f"Testing with demo file: {demo_file}")
            result = inference_engine.predict_dream_text(demo_file)
            
            print("\n🎯 Inference Results:")
            print(f"Success: {result['success']}")
            print(f"Dream Text: {result['dream_text']}")
            print(f"Confidence: {result['confidence']:.2f}")
            print(f"Processing Time: {result['processing_time']:.2f}s")
            print(f"Sleep Stage: {result['sleep_stage']}")
            
        else:
            print(f"Demo file {demo_file} not found. Creating one...")
            # Create a demo EDF file
            os.system("python demo.py")
            
            if os.path.exists(demo_file):
                print(f"Testing with newly created demo file: {demo_file}")
                result = inference_engine.predict_dream_text(demo_file)
                
                print("\n🎯 Inference Results:")
                print(f"Success: {result['success']}")
                print(f"Dream Text: {result['dream_text']}")
                print(f"Confidence: {result['confidence']:.2f}")
                print(f"Processing Time: {result['processing_time']:.2f}s")
                print(f"Sleep Stage: {result['sleep_stage']}")
            else:
                print("Failed to create demo file")
                
    except Exception as e:
        print(f"❌ Error testing inference wrapper: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_inference_wrapper()
