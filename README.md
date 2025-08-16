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
│  │  └─ ml_models
│  │     ├─ eeg_dataset.py
│  │     ├─ eeg_to_text_model.py
│  │     ├─ flexible_eeg_preprocessing.py
│  │     ├─ inference_eeg_text.py
│  │     └─ train_eeg_text.py
│  └─ manage.py
├─ data
│  ├─ processed
│  │  ├─ annotations
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
│  │  │  └─ S005R04_features.h5
│  │  ├─ features
│  │  └─ metadata
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
│     │  ├─ ST7012J0-PSG.edf8yrx6bmc.tmp
│     │  ├─ ST7021J0-PSG.edf
│     │  ├─ ST7022J0-PSG.edf
│     │  ├─ ST7041J0-PSG.edf
│     │  ├─ ST7051J0-PSG.edf
│     │  ├─ ST7061J0-PSG.edf
│     │  ├─ ST7071J0-PSG.edf
│     │  └─ ST7081J0-PSG.edf
│     ├─ dream_donders.zip7oy8u17m.tmp
│     ├─ large_samples
│     │  └─ sleep_sample_1.edfy5r9row9.tmp
│     └─ small_samples
│        └─ sleep_sample_1.edf1h6k75ou.tmp
├─ dreamcrafter-app
│  ├─ README.md
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ public
│  │  ├─ favicon.ico
│  │  ├─ index.html
│  │  ├─ logo192.png
│  │  ├─ logo512.png
│  │  ├─ manifest.json
│  │  ├─ output.css
│  │  └─ robots.txt
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.js
│  │  ├─ App.test.js
│  │  ├─ components
│  │  │  ├─ layout
│  │  │  │  ├─ FloatingElement.js
│  │  │  │  ├─ Footer.js
│  │  │  │  ├─ Footer.module.css
│  │  │  │  ├─ Navbar.js
│  │  │  │  └─ Navbar.module.css
│  │  │  └─ pages
│  │  │     ├─ Dashboard.js
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
│  │  ├─ reportWebVitals.js
│  │  ├─ services
│  │  │  └─ auth.js
│  │  ├─ setupTests.js
│  │  └─ utils
│  │     └─ axios.js
│  └─ tailwind.config.js
├─ models
│  └─ eeg_text_best.pth
├─ requirements.txt
└─ scripts
   └─ download_datasets.py

```