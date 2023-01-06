export type BuxferTransactions = { 
    numTransactions: number, 
    transactions: [{
        id: number,
        description: string,
        date: Date,
        type: string,
        amount: number,
        accountId: string,
        tags: string 
    }]
}

export type BuxferAccounts = { 
    acounts: { 
        id: number, 
        name: string, 
        bank: string, 
        balance: number 
    }
} 