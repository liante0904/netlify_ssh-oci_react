// src/components/CompanySelect.jsx
import './CompanySelect.css';
const firm_names = [
    "LS증권", "신한증권", "NH투자증권", "하나증권", "KB증권", "삼성증권",
    "상상인증권", "신영증권", "미래에셋증권", "현대차증권", "키움증권", "DS투자증권",
    "유진투자증권", "한국투자증권", "다올투자증권", "토스증권", "리딩투자증권", "대신증권",
    "IM증권", "DB금융투자", "메리츠증권", "한화투자증권", "한양증권", "BNK투자증권",
    "교보증권", "IBK투자증권", "SK증권"
  ];
  
  function CompanySelect({ value, onChange }) {
    return (
      <select className="search-input" value={value} onChange={onChange}>
        <option value="">증권사 선택...</option>
        {firm_names.map((name, idx) => (
          <option key={idx} value={idx}>
            {name}
          </option>
        ))}
      </select>
    );
  }
  
  export default CompanySelect;
  