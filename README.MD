Github Action Local Cache
==========================


## Example


Restore and Saving cache to local disk.
```yaml
on: push

jobs:
  deploy:
    runs-on: self-hosted
    steps:
      - name: Checkout
        uses: actions/checkout@v4
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
