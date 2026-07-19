export const summarize = (rows) =>
  rows.reduce(
    (acc, row) => {
      const amount = Number(row.dAmount) || 0;
      if (row.cType === "I") {
        acc.income += amount;
      } else if (row.cType === "S") {
        acc.savings += amount;
      } else {
        acc.expense += amount;
      }
      return acc;
    },
    { income: 0, expense: 0, savings: 0 },
  );