import { addressFromPubKey } from "./util";
import {
  DigestAlgorithm,
  SignatureAlgorithm,
  PayloadType,
  TsbClient,
  SortOrder,
} from "./api";
// @ts-expect-error
import { isBase64 } from "validator";

export class TsbService {
  constructor(private readonly tsbApi: TsbClient) {}

  public async getMasterKeyAddress(signKeyName: string): Promise<string> {
    const {
      json: { publicKey },
    } = await this.tsbApi.getMasterKeyAddress(signKeyName);
    return addressFromPubKey(publicKey);
  }

  public async createSignRequest(request: {
    payload: string;
    signatureAlgorithm: SignatureAlgorithm;
    payloadType: PayloadType;
    signKeyName: string;
  }) {
    if (!isBase64(request.payload))
      throw new Error("The transaction should be base64 formatted");
    const { signRequestId } = await this.tsbApi.signTransaction(request);

    return signRequestId;
  }

  public async getApprovalTasks(request: {
    timestamp: string;
    timestampSignature: string;
    approverPublicKey?: string;
    timestampDigestAlgorithm: DigestAlgorithm;
    id?: string;
    detailLevel?: string;
    paging?: {
      pageNumber?: number;
      pageSize: number;
      sortOrder: SortOrder;
    };
  }) {
    
    if (request.paging && request.paging?.pageSize < 1) throw new Error('pageSize should be 1 minimum')
    const data = await this.tsbApi.getApprovalTasks(request);
    return data;
  }

  public async signApprovalTask(request: {
    id: string;
    approvalToBeSigned: string;
    signature: string;
    approvalDigestAlgorithm: DigestAlgorithm;
    approverPublicKey: string;
  }) {
    await this.tsbApi.signApprovalTask(request);
  }

  public async getSignResult(signRequestId: string) {
    return await this.tsbApi.getSignResult(signRequestId)
  }
}
