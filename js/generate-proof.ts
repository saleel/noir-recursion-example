import { BackendType, Barretenberg, deflattenFields, UltraHonkBackend } from "@aztec/bb.js";
import fs from 'fs';
import innerCircuit from "../circuits/inner/target/inner.json" assert { type: "json" };
import recursiveCircuit from "../circuits/recursive/target/recursive.json" assert { type: "json" };
import { CompiledCircuit, Noir } from "@noir-lang/noir_js";

(async () => {
  try {
    const innerCircuitNoir = new Noir(innerCircuit as CompiledCircuit);
    const bb = await Barretenberg.new({ threads: 8, backend: BackendType.Wasm });
    const innerBackend = new UltraHonkBackend(innerCircuit.bytecode, bb);

    // Generate proof for inner circuit
    const inputs = { x: 3, y: 3 }
    const { witness } = await innerCircuitNoir.execute(inputs);
    const { proof: innerProof, publicInputs: innerPublicInputs } = await innerBackend.generateProof(witness, { verifierTarget: 'noir-recursive' });

    const innerVErifier = await innerBackend.verifyProof({ proof: innerProof, publicInputs: innerPublicInputs }, { verifierTarget: 'noir-recursive' });
    console.log("Inner proof verified: ", innerVErifier);

    // Get verification key for inner circuit as fields
    const innerCircuitVerificationKey = await innerBackend.getVerificationKey({ verifierTarget: 'noir-recursive' });
    const vkAsFields = await bb.vkAsFields({ verificationKey: innerCircuitVerificationKey });
    const vkAsFieldsHex = vkAsFields.fields.map(field => '0x' + Buffer.from(field).toString('hex'));

    // Generate proof of the recursive circuit
    const recursiveCircuitNoir = new Noir(recursiveCircuit as CompiledCircuit);
    const recursiveBackend = new UltraHonkBackend(recursiveCircuit.bytecode, bb);

    const proofHex = deflattenFields(innerProof);
    const recursiveInputs = { proof: proofHex, public_inputs: innerPublicInputs, verification_key: vkAsFieldsHex };
    const { witness: recursiveWitness } = await recursiveCircuitNoir.execute(recursiveInputs as any);
    const { proof: recursiveProof, publicInputs: recursivePublicInputs } = await recursiveBackend.generateProof(recursiveWitness, { verifierTarget: 'evm-no-zk' });

    // Verify recursive proof locally (sanity check)
    const verified = await recursiveBackend.verifyProof({ proof: recursiveProof, publicInputs: recursivePublicInputs }, { verifierTarget: 'evm-no-zk' });
    console.log("Recursive proof verified: ", verified);


    // Write proof to file (to read in .sol test)
    fs.writeFileSync('recursive_proof', recursiveProof);

    process.exit(verified ? 0 : 1);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
