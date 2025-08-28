#!/usr/bin/env python3
import argparse, os, sys, json
import pandas as pd
import numpy as np

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--data', required=True)
    ap.add_argument('--out', required=True)
    args = ap.parse_args()

    try:
        from sklearn.ensemble import GradientBoostingClassifier
        from sklearn.model_selection import train_test_split
        import joblib
    except Exception as e:
        print('Missing Python deps. Install scikit-learn and joblib to run training. Exiting.')
        sys.exit(1)

    df = pd.read_csv(args.data)
    # Expected columns: features named f0..f6 and label column 'label' (1=good trade, 0=bad trade)
    feature_cols = [c for c in df.columns if c.startswith('f')]
    if 'label' not in df.columns:
        print('Data must include a label column named "label"')
        sys.exit(1)

    X = df[feature_cols].values
    y = df['label'].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    clf = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3)
    clf.fit(X_train, y_train)
    preds = clf.predict_proba(X_test)[:,1]
    auc = None
    try:
        from sklearn.metrics import roc_auc_score
        auc = roc_auc_score(y_test, preds)
    except Exception:
        pass

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    joblib.dump(clf, args.out)
    print('Model trained and saved to', args.out)
    if auc is not None:
        print('Test AUC:', auc)

if __name__ == '__main__':
    main()
