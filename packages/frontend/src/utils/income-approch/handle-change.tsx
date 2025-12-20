export const handleVacancyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    handleChange: (e: React.ChangeEvent<any>) => void,
    totalAnnualIncome: number,
    handleInputChange: (handleChange: any, field: string, value: any) => void,
    setVacancy: (value: number) => void,
  ) => {
    const input = e.target.value;
    const input_vacancy: any = e.target.value.replace(/%/g, '');
    const replace_vacancy = parseFloat(input_vacancy) || 0;
    const calculatedVacancy = (totalAnnualIncome * replace_vacancy) / 100;  
    setVacancy(calculatedVacancy);
    handleInputChange(handleChange, 'vacancy', input.replace(/%/g, ''));
  };
  