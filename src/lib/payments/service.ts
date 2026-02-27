import crypto from "crypto";

interface PaymentConfig {
    merchantId: string;
    password?: string;
    salt?: string;
    hashKey?: string;
    isSandbox: boolean;
}

export class PaymentService {
    /**
     * Generates a JazzCash Secure Hash
     */
    static generateJazzCashHash(params: Record<string, string>, salt: string) {
        const sortedKeys = Object.keys(params).sort();
        let hashString = salt;

        for (const key of sortedKeys) {
            if (params[key] !== "") {
                hashString += `&${params[key]}`;
            }
        }

        return crypto.createHmac("sha256", salt).update(hashString).digest("hex").toUpperCase();
    }

    /**
     * Verifies JazzCash Response Hash
     */
    static verifyJazzCashHash(response: Record<string, string>, salt: string) {
        const receivedHash = response["pp_SecureHash"];
        const params = { ...response };
        delete params["pp_SecureHash"];

        const calculatedHash = this.generateJazzCashHash(params, salt);
        return calculatedHash === receivedHash;
    }

    /**
     * Generates Easypaisa Hash
     */
    static generateEasypaisaHash(params: string, key: string) {
        const hmac = crypto.createHmac("sha256", key);
        return hmac.update(params).digest("hex");
    }

    /**
     * Sandbox Payment Simulation
     */
    static async simulatePayment(amount: number) {
        // Randomly succeed or fail
        const isSuccess = Math.random() > 0.2;
        const transactionRef = `SANDBOX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        return {
            success: isSuccess,
            transactionRef,
            status: isSuccess ? "SUCCESS" : "FAILED",
            message: isSuccess ? "Payment successful (Sandbox)" : "Payment failed (Sandbox)",
        };
    }
}
