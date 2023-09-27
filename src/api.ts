import axios, { AxiosInstance } from "axios";

export interface ApprovalTask {
  id: string;
  approvalToBeSigned: string;
  approverPublicKey: string;
}

export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  EXECUTED = "EXECUTED",
  FAILED = "FAILED",
  EXPIRED = "EXPIRED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export interface ApprovalRequest {
  status: ApprovalStatus;
  result: string;
}

export enum SignatureAlgorithm {
  NONE_WITH_ECDSA = "NONE_WITH_ECDSA",
}

export enum DigestAlgorithm {
  SHA256 = "SHA-256",
}

export enum PayloadType {
  ETH = "ETH",
}

export enum SortOrder {
  CREATION_DATE_ASC = 'CREATION_DATE_ASC',
  CREATION_DATE_DESC = 'CREATION_DATE_DESC',
  LAST_FETCHED_DATE_ASC = 'LAST_FETCHED_DATE_ASC',
  LAST_FETCHED_DATE_DESC = 'LAST_FETCHED_DATE_DESC'
}

export class TsbClient {
  private httpClient: AxiosInstance;

  constructor(url: string) {
    // Initialize the HTTP client with a base URL and API key if needed
    this.httpClient = axios.create({
      baseURL: url,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  public async getMasterKeyAddress(keyName: string) {
    const response = await this.httpClient.get<{ json: { publicKey: string } }>(
      `/key/${keyName}/attributes`
    );
    return response.data;
  }

  public async signTransaction(request: {
    payload: string;
    signatureAlgorithm: SignatureAlgorithm;
    payloadType: PayloadType;
    signKeyName: string;
  }) {
    const response = await this.httpClient.post<{ signRequestId: string }>(
      "/sign",
      {
        signRequest: request,
      }
    );
    return response.data;
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
      pageSize?: number;
      sortOrder: SortOrder;
    };
  }) {
    const response = await this.httpClient.post(
      "filteredSignApprovalTask",
      request
    );
    return response.data;
  }

  public async signApprovalTask(request: {
    id: string;
    approvalToBeSigned: string;
    signature: string;
    approvalDigestAlgorithm: DigestAlgorithm;
    approverPublicKey: string;
  }): Promise<void> {
    return await this.httpClient.post("/approval", request);
  }

  public async getSignResult(signRequestId: string) {
    const response = await this.httpClient.get<ApprovalRequest>(
      `/request/${signRequestId}`
    );
    return response.data;
  }
}
