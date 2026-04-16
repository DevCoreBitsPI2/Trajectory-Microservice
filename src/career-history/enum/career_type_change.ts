export enum career_type_change {
    promotion = 'promotion',
    transfer = 'transfer',
    contract_modification = 'contract_modification',
    salary_change = 'salary_change',
    evaluation = 'evaluation',
}

export const CareerTypeChangeListDto = [
    career_type_change.contract_modification,
    career_type_change.evaluation,
    career_type_change.promotion,
    career_type_change.salary_change,
    career_type_change.transfer,
]