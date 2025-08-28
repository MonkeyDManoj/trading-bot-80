#!/usr/bin/env python3
import joblib, sys, numpy as np, pandas as pd
if len(sys.argv)<3:
    print('Usage: eval_model.py model.pkl data.csv')
    sys.exit(1)
m = joblib.load(sys.argv[1])
df = pd.read_csv(sys.argv[2])
X = df[[c for c in df.columns if c.startswith('f')]].values
probs = m.predict_proba(X)[:,1] if hasattr(m,'predict_proba') else m.predict(X)
print('probs:', probs[:5])
