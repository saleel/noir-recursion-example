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
        0x24307603029bfc32dfe1542017de27f08dd1aa3e2546b804917fab0e0cb56cd9,
    );
}
