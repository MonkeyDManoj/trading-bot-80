AI Validator Retraining Pipeline

This pipeline demonstrates the recommended workflow for retraining the validator:

1. Backtest & collect labeled trades into a CSV (data/trades.csv)
2. Run the training script to fit a model and export a .pkl file
3. Validate the model via backtest/equity simulations and export metrics
4. Deploy the model by replacing the validator model file and restarting the validator worker

Notes:
- The training script is a lightweight scikit-learn example (GradientBoostingClassifier).
- In production, replace feature engineering and hyperparameters with your real pipeline.
- The script is intentionally simple so it runs in most dev environments.
