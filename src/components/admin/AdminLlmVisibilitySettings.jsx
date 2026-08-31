import React from 'react';

function AdminLlmVisibilitySettings({
  llmVisibility,
  updatingLlm,
  feedback,
  onChange
}) {
  const options = [
    {
      value: 'admin',
      title: '관리자만 보기 (Admin Only)',
      description: '오직 텔레그램 관리자(Admin) 권한을 가진 계정에게만 AI 요약 영역이 노출됩니다. (보안 극대화)'
    },
    {
      value: 'telegram',
      title: '텔레그램 로그인 사용자 모두 보기',
      description: '텔레그램으로 로그인한 모든 사용자에게 AI 요약 보기 기능이 노출됩니다. 비로그인 유저에게는 완벽히 숨겨집니다.'
    }
  ];

  return (
    <div className="section-card llm-visibility-settings">
      <div className="section-title">
        🧠 LLM 핵심 요약 노출 설정
        <span className="badge">Global Policy</span>
      </div>
      <p className="llm-visibility-description">
        증권사 리포트 카드 하단에 노출되는 <strong>AI 요약(Gemini/DeepSeek 핵심 요약)</strong>의 공개 대상을 설정합니다.
        이 설정은 전역적으로 적용되며 즉각적으로 화면에 반영됩니다.
      </p>
      <div className="llm-visibility-options">
        {options.map((option) => (
          <label className={`llm-visibility-option ${llmVisibility === option.value ? 'selected' : ''}`} key={option.value}>
            <input
              type="radio"
              name="llmVisibility"
              value={option.value}
              checked={llmVisibility === option.value}
              onChange={() => onChange(option.value)}
              disabled={updatingLlm}
            />
            <span>
              <span className="llm-visibility-option-title">{option.title}</span>
              <span className="llm-visibility-option-description">{option.description}</span>
            </span>
          </label>
        ))}
      </div>
      {feedback && (
        <div className={`llm-visibility-feedback ${feedback.includes('✅') ? 'success' : 'error'}`}>
          {feedback}
        </div>
      )}
    </div>
  );
}

export default AdminLlmVisibilitySettings;
