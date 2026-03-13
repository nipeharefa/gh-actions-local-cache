Github Action Local Cache
==========================

## Overview
This GitHub Action enables you to cache dependencies (such as node_modules, packages, etc.) and persist them on local disk storage during CI/CD workflows. It's particularly useful for self-hosted GitHub Actions runners where you want to reduce build times by avoiding repeated downloads of dependencies.

## Usage
Basic Example
Add this step to your GitHub Actions workflow:


Restore and Saving cache to local disk.
```yaml
on: push

jobs:
  deploy:
    runs-on: self-hosted
    steps:
      - name: Checkout
        uses: actions/checkout@v6
      - uses: actions/setup-node@v3
        with:
          node-version: 16
      - name: Cache
        uses: nipeharefa/gh-actions-local-cache@main
        with:
          path: |
            node_modules
          key: npm-feature-${{ hashFiles('package-lock.json') }}
          storage: /home/ubuntu
      - run: |
          npm install
```
