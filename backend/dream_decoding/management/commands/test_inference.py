from django.core.management.base import BaseCommand
from django.conf import settings
import os
import sys

class Command(BaseCommand):
    help = 'Test the EEG inference engine'

    def handle(self, *args, **options):
        try:
            self.stdout.write("🧠 Testing DreamCrafter Inference Engine...")
            
            # Add the ml_models directory to Python path
            ml_models_path = os.path.join(settings.BASE_DIR, 'dream_decoding', 'ml_models')
            sys.path.insert(0, ml_models_path)
            
            # Import and test the inference wrapper
            from inference_wrapper import get_inference_engine
            
            self.stdout.write("Loading inference engine...")
            inference_engine = get_inference_engine()
            self.stdout.write(self.style.SUCCESS("✅ Inference engine loaded successfully!"))
            
            # Test with an existing EDF file
            demo_file = os.path.join(settings.BASE_DIR, '..', 'data', 'raw', 'comprehensive_1gb', 'S001R01.edf')
            
            if os.path.exists(demo_file):
                self.stdout.write(f"Testing with existing EDF file: {demo_file}")
                result = inference_engine.predict_dream_text(demo_file)
                
                self.stdout.write("\n🎯 Inference Results:")
                self.stdout.write(f"Success: {result['success']}")
                self.stdout.write(f"Dream Text: {result['dream_text']}")
                self.stdout.write(f"Confidence: {result['confidence']:.2f}")
                self.stdout.write(f"Processing Time: {result['processing_time']:.2f}s")
                self.stdout.write(f"Sleep Stage: {result['sleep_stage']}")
                
            else:
                self.stdout.write(self.style.ERROR(f"EDF file not found: {demo_file}"))
                    
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error testing inference: {e}"))
            import traceback
            traceback.print_exc()
