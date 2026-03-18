use bb_proof_verification::{UltraHonkVerificationKey, UltraHonkZKProof, verify_honk_proof};

fn main(
    verification_key: UltraHonkVerificationKey,
    proof: UltraHonkZKProof,
    public_inputs: pub [Field; 1],
) {
    verify_honk_proof(
        verification_key,
        proof,
        public_inputs,
        0x26e361d28a1621a5534655d055110da5bbb288b0396a0edf4bf18843df6db484,
    );
}
