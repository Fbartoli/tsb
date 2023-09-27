import * as asn1js from "asn1js";
import * as util from "@ethereumjs/util";
import { createPrivateKey, createSign, createPublicKey } from "crypto";
import { FeeMarketEIP1559Transaction } from "@ethereumjs/tx";

const publickKeyDER_schema = new asn1js.Sequence({
  name: "block",
  value: [
    new asn1js.Sequence({
      name: "algorithmIdentifier",
      value: [],
    }),
    new asn1js.BitString({
      name: "publicKey",
    }),
  ],
});

const signature_schema = new asn1js.Sequence({
  name: "block",
  value: [
    new asn1js.Integer({
      name: "r",
    }),
    new asn1js.Integer({
      name: "s",
    }),
  ],
});

export const addressFromPubKey = (pkDER: string) => {
  const pkBuffer = Buffer.from(pkDER, "base64");
  const schema = asn1js.verifySchema(pkBuffer, publickKeyDER_schema);
  if (!schema.verified)
    throw new Error(
      "Impossible to decode DER format from string input. Public key is not in DER format"
    );
  const pkUintArray = (
    schema.result.publicKey as { valueBlock: { valueHexView: Uint8Array } }
  ).valueBlock.valueHexView;
  return Buffer.from(util.publicToAddress(pkUintArray, true)).toString("hex");
};

export const derivePubKeyFromPrivatePem = (privateKey: string): string => {
  // Private key in PEM format
  const pubKey = createPublicKey(privateKey);
  return pubKey.export({ format: "der", type: "spki" }).toString("base64");
};

// const EKA_OPERATION_TYPE = "3b00";
// const EKA_OPERATION_LEN = "0400";
// const EKA_OPERATION_SIGN = "01000000";
// const KEY_NAME_TYPE = "0210";
// const KEY_NAME_LEN = "0000";
// const PAYLOAD_TYPE = "5710";
// const EKA_METADATA =
//   EKA_OPERATION_TYPE +
//   EKA_OPERATION_LEN +
//   EKA_OPERATION_SIGN +
//   KEY_NAME_TYPE +
//   KEY_NAME_LEN +
//   PAYLOAD_TYPE;

// const PADDING_TO_BYTES = 4;
// const HEX_ZERO = "00";

// import * as elliptic from 'elliptic'
// const ec = new elliptic.ec('secp256k1')

export const sign = (
  textToSign: string | Buffer,
  privateKeyString: string
): string => {
  const privateKey = createPrivateKey(privateKeyString.replace(/\\n/g, "\n"));
  const signs = createSign("sha256");
  signs.write(textToSign);
  signs.end();
  return signs.sign(privateKey, "base64");
};

export const recomposeAndVerifySignedTransaction = (
  ethereumTx: FeeMarketEIP1559Transaction,
  senderAddress: string,
  signature: Buffer
): FeeMarketEIP1559Transaction => {
  const { r, s } = rsFromSignature(signature);
  console.log(r)
  console.log(s)
  const [v1, v2] = [0n, 1n];
  // console.log(util.fromRpcSig(`0x${signature.toString('hex')}`))

  // console.log(signature.length)
  console.log(signature.toString('hex'))

  const getTransactionFromValue = (
    v: bigint
  ): FeeMarketEIP1559Transaction | null => {
    const tx = FeeMarketEIP1559Transaction.fromTxData({
      ...ethereumTx,
      v,
      r,
      s,
    });
    // Check if v is the right one
    if (
      tx.verifySignature() &&
      tx.getSenderAddress().toString().toUpperCase() ===
        senderAddress.toUpperCase()
    ) {
      return tx;
    }
    return null;
  };

  const tx1 = getTransactionFromValue(v1);
  if (tx1) return tx1;

  const tx2 = getTransactionFromValue(v2);
  if (tx2) return tx2;

  // Throw error if neither v1 nor v2 returned the correct address
  throw new Error("Invalid Signature");
};

const rsFromSignature = (signature: Buffer) => {
  const schema = asn1js.verifySchema(signature, signature_schema);
  if (!schema.verified)
    throw new Error("Error while extracting R and S values");
  const r = (schema.result.r as { valueBlock: { valueHexView: Uint8Array } })
    .valueBlock.valueHexView;
  const s = (schema.result.s as { valueBlock: { valueHexView: Uint8Array } })
    .valueBlock.valueHexView;
  return { r, s };
};

// const sha256 = (msg: Buffer) => {
//   return createHash('sha256').update(msg).digest()
// }

// const derifySignature = (signature: Buffer): Buffer => {
//   const SIGN_ALGO = '1.2.840.10045.4.3.2'
//   const asn1Signature = new asn1js.Sequence({
//     value: [
//       new asn1js.Sequence({
//         name: 'signAlgorithm',
//         value: [
//           new asn1js.ObjectIdentifier({
//             value: SIGN_ALGO,
//           }),
//           new asn1js.Null(),
//         ],
//       }),
//       new asn1js.BitString({
//         valueHex: signature,
//       }),
//     ],
//   })
//   return Buffer.from(asn1Signature.toBER())
// }

// const rsvFromSignature = (signature: Buffer) => {
//   return fromRpcSig(`0x${Buffer.from(signature).toString("hex")}`);
// };

// TODO: Fix for sign challenge
// export const generateSigningTokenChallenge = (tx: Buffer) => {
//   const size = Buffer.allocUnsafe(4) // Init buffer without writing all data to zeros
//   size.writeInt32LE(tx.byteLength) // Little endian buffer
//   const paddingSize =
//     ((tx.byteLength % PADDING_TO_BYTES) + PADDING_TO_BYTES) % PADDING_TO_BYTES
//   const tokenChallenge = Buffer.concat([
//     Buffer.from(EKA_METADATA, 'hex'),
//     size,
//     tx,
//     Buffer.from(HEX_ZERO.repeat(paddingSize), 'hex'),
//   ])
//   const tokenChallengeSize = Buffer.allocUnsafe(4) // Init buffer without writing all data to zeros
//   tokenChallengeSize.writeInt32LE(tokenChallenge.byteLength)
//   const fullTokenChallenge = Buffer.concat([tokenChallengeSize, tokenChallenge])
//   return sha256(fullTokenChallenge)
// }

// TODO: Fix for sign challenge
// export const generateSignedApproval = (
//   msgHash: Buffer,
//   approvalKey: Buffer,
// ): Buffer => {
//   const pk = ec.keyFromPrivate(approvalKey)
//   // sign the message
//   const signature = ec.sign(msgHash, pk, {
//     canonical: true,
//   })
//   const der = signature.toDER('hex')
//   return derifySignature(Buffer.from(der, 'hex'))
// }

// TODO: Fix sign challenge
// public signChallenge(tx: Buffer): Buffer {
//   const challenge = generateSigningTokenChallenge(tx);
//   return generateSignedApproval(challenge, Buffer.from(this.privateKey));
// }
