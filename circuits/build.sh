set -e

cd inner
nargo compile --force
bb write_vk -t noir-recursive -b ./target/inner.json -o ./target
cd ..

cd recursive
nargo compile --force
bb write_vk -t evm-no-zk -b ./target/recursive.json -o ./target
bb write_solidity_verifier -t evm-no-zk -k ./target/vk -o ../../contract/Verifier.sol --optimized
cd ..

echo "Done"
