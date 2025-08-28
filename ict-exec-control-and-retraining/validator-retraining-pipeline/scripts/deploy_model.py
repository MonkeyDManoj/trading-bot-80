#!/usr/bin/env python3
import argparse, shutil, os
ap = argparse.ArgumentParser()
ap.add_argument('--src', required=True)
ap.add_argument('--dest', required=True)
args = ap.parse_args()
os.makedirs(os.path.dirname(args.dest), exist_ok=True)
shutil.copy2(args.src, args.dest)
print('Copied', args.src, 'to', args.dest)
