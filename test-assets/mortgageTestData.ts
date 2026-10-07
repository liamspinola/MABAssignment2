export const mortgageTestData = {
    LowValueAndDeposit:
    {
        propertyValue: 350_000,
        deposit: 70_000,
        income: 80_000,
        mortgageTerm: 25,
    },

    HighValueAndDeposit:
    {
        propertyValue: 1_000_000,
        deposit: 150_000,
        income: 160_000,
        mortgageTerm: 35,
    },

    filters: {
        fixedTerm: {
            label: '2 years',
            value: 24,
        },

        paymentMethod: {
            label: 'Interest Only',
            value: 3
        }
    },
}