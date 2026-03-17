# Noir Recursion Example


### Setup

```bash
bbup -v 4.1.0-nightly.20260317
```

### Run
```bash
# Build circuits and generate solidity verifier
(cd circuits && ./build.sh)   

# Generate recursive proof in JS
(cd js && yarn)
(cd js && yarn generate-proof)

# Verify the recursive proof in Solidity
(cd contract && forge test --optimize --optimizer-runs 5000 --gas-report -vvvvv)
```


### Notes

To test with a different version of bb

- `bbup -v 4.0.0-nightly.20260131`
- Change to same version in js/package.json
- Change to same version in circuits/recursive/Nargo.toml