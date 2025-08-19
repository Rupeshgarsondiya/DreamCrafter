
```
DreamCrafter
├─ README.md
├─ backend
│  ├─ authentication
│  │  ├─ __init__.py
│  │  ├─ admin.py
│  │  ├─ apps.py
│  │  ├─ migrations
│  │  │  ├─ 0001_initial.py
│  │  │  └─ __init__.py
│  │  ├─ models.py
│  │  ├─ serializers.py
│  │  ├─ tests.py
│  │  ├─ urls.py
│  │  └─ views.py
│  ├─ backend
│  │  ├─ __init__.py
│  │  ├─ asgi.py
│  │  ├─ settings.py
│  │  ├─ urls.py
│  │  └─ wsgi.py
│  ├─ dream_decoding
│  │  ├─ __init__.py
│  │  ├─ admin.py
│  │  ├─ apps.py
│  │  ├─ migrations
│  │  │  └─ __init__.py
│  │  ├─ ml_models
│  │  │  ├─ create_missing_annotations.py
│  │  │  ├─ eeg_dataset.py
│  │  │  ├─ eeg_to_text_model.py
│  │  │  ├─ flexible_eeg_preprocessing.py
│  │  │  ├─ gpu_accelerated_features.py
│  │  │  ├─ inference_eeg_text.py
│  │  │  ├─ inference_wrapper.py
│  │  │  └─ train_eeg_text.py
│  │  ├─ models.py
│  │  ├─ serializers.py
│  │  ├─ tests.py
│  │  ├─ urls.py
│  │  └─ views.py
│  └─ manage.py
├─ data
│  ├─ processed
│  │  ├─ annotations
│  │  │  ├─ subject_001_annotations.json
│  │  │  ├─ subject_002_annotations.json
│  │  │  ├─ subject_003_annotations.json
│  │  │  ├─ subject_004_annotations.json
│  │  │  ├─ subject_005_annotations.json
│  │  │  ├─ subject_006_annotations.json
│  │  │  ├─ subject_007_annotations.json
│  │  │  ├─ subject_008_annotations.json
│  │  │  ├─ subject_009_annotations.json
│  │  │  ├─ subject_010_annotations.json
│  │  │  ├─ subject_011_annotations.json
│  │  │  ├─ subject_012_annotations.json
│  │  │  ├─ subject_013_annotations.json
│  │  │  ├─ subject_014_annotations.json
│  │  │  ├─ subject_015_annotations.json
│  │  │  ├─ subject_016_annotations.json
│  │  │  ├─ subject_017_annotations.json
│  │  │  ├─ subject_018_annotations.json
│  │  │  ├─ subject_019_annotations.json
│  │  │  ├─ subject_020_annotations.json
│  │  │  ├─ subject_021_annotations.json
│  │  │  ├─ subject_022_annotations.json
│  │  │  ├─ subject_041_annotations.json
│  │  │  ├─ subject_051_annotations.json
│  │  │  ├─ subject_061_annotations.json
│  │  │  ├─ subject_071_annotations.json
│  │  │  └─ subject_081_annotations.json
│  │  ├─ comprehensive_features
│  │  │  ├─ S001R01_features.h5
│  │  │  ├─ S001R02_features.h5
│  │  │  ├─ S001R03_features.h5
│  │  │  ├─ S001R04_features.h5
│  │  │  ├─ S002R01_features.h5
│  │  │  ├─ S002R02_features.h5
│  │  │  ├─ S002R03_features.h5
│  │  │  ├─ S002R04_features.h5
│  │  │  ├─ S003R01_features.h5
│  │  │  ├─ S003R02_features.h5
│  │  │  ├─ S003R03_features.h5
│  │  │  ├─ S003R04_features.h5
│  │  │  ├─ S004R01_features.h5
│  │  │  ├─ S004R02_features.h5
│  │  │  ├─ S004R03_features.h5
│  │  │  ├─ S004R04_features.h5
│  │  │  ├─ S005R01_features.h5
│  │  │  ├─ S005R02_features.h5
│  │  │  ├─ S005R03_features.h5
│  │  │  ├─ S005R04_features.h5
│  │  │  ├─ SC4001E0-PSG_features.h5
│  │  │  ├─ SC4002E0-PSG_features.h5
│  │  │  ├─ SC4011E0-PSG_features.h5
│  │  │  ├─ SC4012E0-PSG_features.h5
│  │  │  ├─ ST7011J0-PSG_features.h5
│  │  │  ├─ ST7012J0-PSG_features.h5
│  │  │  ├─ ST7021J0-PSG_features.h5
│  │  │  ├─ ST7022J0-PSG_features.h5
│  │  │  ├─ ST7041J0-PSG_features.h5
│  │  │  ├─ ST7051J0-PSG_features.h5
│  │  │  ├─ ST7061J0-PSG_features.h5
│  │  │  ├─ ST7071J0-PSG_features.h5
│  │  │  └─ ST7081J0-PSG_features.h5
│  │  └─ vocab_info.json
│  └─ raw
│     ├─ comprehensive_1gb
│     │  ├─ S001R01.edf
│     │  ├─ S001R02.edf
│     │  ├─ S001R03.edf
│     │  ├─ S001R04.edf
│     │  ├─ S002R01.edf
│     │  ├─ S002R02.edf
│     │  ├─ S002R03.edf
│     │  ├─ S002R04.edf
│     │  ├─ S003R01.edf
│     │  ├─ S003R02.edf
│     │  ├─ S003R03.edf
│     │  ├─ S003R04.edf
│     │  ├─ S004R01.edf
│     │  ├─ S004R02.edf
│     │  ├─ S004R03.edf
│     │  ├─ S004R04.edf
│     │  ├─ S005R01.edf
│     │  ├─ S005R02.edf
│     │  ├─ S005R03.edf
│     │  ├─ S005R04.edf
│     │  ├─ SC4001E0-PSG.edf
│     │  ├─ SC4002E0-PSG.edf
│     │  ├─ SC4011E0-PSG.edf
│     │  ├─ SC4012E0-PSG.edf
│     │  ├─ ST7011J0-PSG.edf
│     │  ├─ ST7012J0-PSG.edf
│     │  ├─ ST7021J0-PSG.edf
│     │  ├─ ST7022J0-PSG.edf
│     │  ├─ ST7041J0-PSG.edf
│     │  ├─ ST7051J0-PSG.edf
│     │  ├─ ST7061J0-PSG.edf
│     │  ├─ ST7071J0-PSG.edf
│     │  └─ ST7081J0-PSG.edf
│     ├─ dreams_db
│     │  ├─ excerpt1.edf
│     │  ├─ excerpt2.edf
│     │  ├─ excerpt3.edf
│     │  ├─ visual_scoring1_excerpt1.txt
│     │  ├─ visual_scoring1_excerpt2.txt
│     │  └─ visual_scoring1_excerpt3.txt
│     └─ sleep_edf
│        ├─ SC4001E0-PSG.edf
│        ├─ SC4001EH-Hypnogram.edf
│        ├─ SC4002E0-PSG.edf
│        ├─ SC4002EH-Hypnogram.edf
│        ├─ SC4011E0-PSG.edf
│        ├─ SC4011EH-Hypnogram.edf
│        ├─ SC4012E0-PSG.edf
│        ├─ SC4012EH-Hypnogram.edf
│        ├─ ST7011J0-PSG.edf
│        ├─ ST7011JM-Hypnogram.edf
│        ├─ ST7012J0-PSG.edf
│        ├─ ST7012JM-Hypnogram.edf
│        ├─ ST7021J0-PSG.edf
│        ├─ ST7021JM-Hypnogram.edf
│        ├─ ST7022J0-PSG.edf
│        └─ ST7022JM-Hypnogram.edf
├─ dreamcrafter-app
│  ├─ README.md
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ public
│  │  ├─ favicon.ico
│  │  ├─ index.html
│  │  └─ output.css
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.js
│  │  ├─ components
│  │  │  ├─ layout
│  │  │  │  ├─ FloatingElement.js
│  │  │  │  ├─ Footer.js
│  │  │  │  ├─ Footer.module.css
│  │  │  │  ├─ Navbar.js
│  │  │  │  └─ Navbar.module.css
│  │  │  └─ pages
│  │  │     ├─ Dashboard.js
│  │  │     ├─ Dashboard.module.css
│  │  │     ├─ Featurepage.module.css
│  │  │     ├─ FeaturesPage.js
│  │  │     ├─ HomePage.js
│  │  │     ├─ HomePage.module.css
│  │  │     ├─ LandingPage.js
│  │  │     ├─ LandingPage.module.css
│  │  │     ├─ LoginPage.js
│  │  │     ├─ LoginPage.module.css
│  │  │     ├─ NewsPage.js
│  │  │     ├─ SignUpPage.js
│  │  │     └─ SignUpPage.module.css
│  │  ├─ data
│  │  │  └─ dreamData.js
│  │  ├─ hooks
│  │  │  └─ useFloatingElements.js
│  │  ├─ index.css
│  │  ├─ index.js
│  │  ├─ logo.svg
│  │  ├─ services
│  │  │  ├─ auth.js
│  │  │  └─ dreamAPI.js
│  │  └─ utils
│  │     └─ axios.js
│  └─ tailwind.config.js
├─ models
│  ├─ checkpoints
│  │  ├─ checkpoint_epoch_1.pth
│  │  ├─ checkpoint_epoch_2.pth
│  │  ├─ checkpoint_epoch_3.pth
│  │  ├─ checkpoint_epoch_4.pth
│  │  └─ eeg_text_best.pth
│  └─ eeg_text_best.pth
├─ requirements.txt
└─ scripts
   └─ download_datasets.py

```