import { UltraHonkBackend } from "@aztec/bb.js";
import innerCircuit from "../circuits/inner/target/inner.json" assert { type: "json" };
import recursiveCircuit from "../circuits/recursive/target/recursive.json" assert { type: "json" };
import { CompiledCircuit, Noir } from "@noir-lang/noir_js";

(async () => {
  try {
    const innerCircuitNoir = new Noir(innerCircuit as CompiledCircuit);
    const innerBackend = new UltraHonkBackend(innerCircuit.bytecode, { threads: 1 }, { recursive: true });

    // Generate proof for inner circuit
    const inputs = { x: 3, y: 3 }
    const { witness } = await innerCircuitNoir.execute(inputs);
    const { proof, publicInputs } = await innerBackend.generateProof(witness);
    const { proofAsFields, vkAsFields } = await innerBackend.generateRecursiveProofArtifacts(
      proof,
      publicInputs
    );

    // Generate proof of the recursive circuit
    const recursiveCircuitNoir = new Noir(recursiveCircuit as CompiledCircuit);
    const recursiveBackend = new UltraHonkBackend(recursiveCircuit.bytecode, { threads: 1 });

    const recursiveInputs = { proof: proofAsFields, public_inputs: publicInputs, verification_key: vkAsFields };
    const { witness: recursiveWitness } = await recursiveCircuitNoir.execute(recursiveInputs);
    const { proof: recursiveProof, publicInputs: recursivePublicInputs } = await recursiveBackend.generateProof(recursiveWitness);

    // Verify recursive proof
    const verified = await recursiveBackend.verifyProof({ proof: recursiveProof, publicInputs: recursivePublicInputs });
    console.log("Recursive proof verified: ", verified);

    process.exit(verified ? 0 : 1);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
