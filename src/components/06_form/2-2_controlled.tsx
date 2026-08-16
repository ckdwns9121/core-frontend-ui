// #2-1(비제어)과 같은 폼을 제어 컴포넌트로 만든 것입니다. 두 방식의 차이는 '값을 누가 소유하는가'입니다.
//
//   비제어(#2-1)  값은 DOM이 소유. 필요할 때 FormData로 긁어옴. React는 값을 모름.
//   제어(#2-2)    값은 React state가 소유. DOM은 state를 비추기만 함.
//
// 그래서 #2-1은 form 하나에 onInput을 걸어 위임 처리가 가능하지만,
// 제어 컴포넌트는 value를 넘기는 모든 입력에 onChange가 있어야 합니다(없으면 React가 경고합니다).

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

type FormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

type FormState = {
  __id: string;
  __name: string;
  __gender: string;
  __password: string;
  __password_confirm: string;
  __photo?: File;
  __salary: string;
  __agree: boolean;
};

const defaultFormState: FormState = {
  __id: '',
  __name: '',
  __gender: '',
  __password: '',
  __password_confirm: '',
  __photo: undefined,
  __salary: '',
  __agree: false,
};

// 모든 분기에서 name을 키로 씁니다. 라디오는 name을 공유해야 그룹으로 묶이므로
// id로 키를 잡으면 __gender_male / __gender_female로 갈라져 버립니다.
// 타입에 따라 달라지는 것은 '어떤 값을 읽느냐'뿐입니다.
const formReducer = (state: FormState, $el: FormElement): FormState => {
  const { type, name } = $el;
  switch (type) {
    case 'checkbox':
      return { ...state, [name]: ($el as HTMLInputElement).checked };
    case 'file':
      return { ...state, [name]: ($el as HTMLInputElement).files?.[0] };
    case 'text':
      // 연봉은 화면에는 구분 기호를 넣어 보여주고, state에는 숫자만 저장합니다.
      // #1에서 겪은 문제(표시 문자열과 값이 섞여 왕복하다 깨지는 것)를 구조로 피하는 방식입니다.
      if (name === '__salary') {
        return { ...state, [name]: $el.value.replace(/[^\d]/g, '') };
      }
      return { ...state, [name]: $el.value };
    default:
      // 라디오는 선택된 항목의 value가 그대로 들어옵니다.
      return { ...state, [name]: $el.value };
  }
};

const validationKeys: (keyof ValidityState)[] = [
  'badInput',
  'patternMismatch',
  'rangeOverflow',
  'rangeUnderflow',
  'stepMismatch',
  'tooLong',
  'tooShort',
  'typeMismatch',
  'valueMissing',
];

type FormItem = keyof FormState;

// #2-1은 값이 DOM에 있어 FormData를 넘겨받았지만, 제어 폼은 state가 곧 값이므로 formState를 받습니다.
// onInput(사진 미리보기)과 transformData(연봉 변환)는 #2-2에서 각각 useMemo와 리듀서가 담당하므로 뺐습니다.
type FormControl = Partial<
  Record<keyof ValidityState, string> & {
    additionalValidator: ($el: FormElement, formState: FormState) => boolean;
  }
>;

// Record<string, _>이 아니라 Partial<Record<FormItem, _>>으로 잡으면
// 키를 잘못 적었을 때(_id 처럼) 타입 검사에서 걸립니다.
const formController: Partial<Record<FormItem, FormControl>> = {
  __id: {
    valueMissing: '아이디를 입력하세요.',
    patternMismatch: '아이디는 영어나 숫자 또는 _ 만 입력할 수 있습니다.',
    tooShort: '아이디는 네 글자 이상 입력해 주세요.',
  },
  __name: {
    valueMissing: '이름을 입력하세요.',
    patternMismatch: '띄어쓰기 없이 한글만 입력하세요.',
    tooShort: '이름을 두 글자 이상 입력하세요.',
  },
  __gender: { valueMissing: '성별을 선택하세요.' },
  __password: { valueMissing: '비밀번호를 입력하세요.' },
  __password_confirm: {
    additionalValidator: ($el, formState) => $el.value === formState.__password,
    customError: '비밀번호가 일치하지 않습니다.',
  },
  __photo: { valueMissing: '프로필 사진을 선택하세요.' },
  __agree: { valueMissing: '약관에 동의해야 가입할 수 있습니다.' },
};

// 다른 필드를 참조하는 검증(additionalValidator)만 따로 다시 돌립니다.
//
// handleInvalid는 이벤트가 발생한 요소 하나만 보기 때문에 이런 구멍이 생깁니다.
//   1. 비밀번호 "abc" 입력
//   2. 확인란에 "abc" 입력 → 일치 판정 → setCustomValidity('') → 유효
//   3. 비밀번호를 "xyz"로 수정 → 확인란에는 이벤트가 가지 않음
//   4. 확인란은 여전히 '유효' 상태 → 네이티브 검증도 통과 → 그대로 제출됨
//
// 그래서 제출 직전에 폼 전체를 한 번 훑어 다시 판정해야 합니다.
const checkAdditionalValidity = ($el: FormElement, formState: FormState) => {
  const inputController = formController[$el.name as FormItem];
  const { additionalValidator, customError = '[custom error]' } =
    inputController || {};

  // 추가 검증이 없는 필드는 네이티브 검증이 이미 처리했으므로 통과로 봅니다.
  if (!additionalValidator) return true;

  const isValid = additionalValidator($el, formState);
  $el.setCustomValidity(isValid ? '' : customError);
  return isValid;
};

export const Form2 = () => {
  const [formState, dispatch] = useReducer(formReducer, defaultFormState);

  // 이벤트가 가리키는 요소의 검증 상태를 formController에 맞춰 갱신하고, 그 요소를 돌려줍니다.
  // 반환값이 있어야 호출부에서 reportValidity()나 dispatch()로 이어 붙일 수 있습니다.
  // onChange(값이 바뀔 때)와 onInvalid(제출 시 브라우저가 검증할 때) 양쪽에서 씁니다.
  const handleInvalid = (e: FormEvent, formState: FormState): FormElement => {
    const $el = e.target as FormElement;
    // id가 아니라 name으로 찾습니다. 라디오는 id가 __gender_male / __gender_female로 갈라지지만
    // name은 __gender 하나로 공유하기 때문입니다(리듀서 키와도 일치).
    const inputController = formController[$el.name as FormItem];

    const { additionalValidator, customError = '[custom error]' } =
      inputController || {};

    const isValid = !additionalValidator || additionalValidator($el, formState);

    if (!isValid) $el.setCustomValidity(customError);
    else {
      // 통과했으면 errorText가 ''가 되어 이전 에러까지 함께 풀립니다.
      // setCustomValidity는 빈 문자열로만 해제되므로 이 else 분기가 해제 담당입니다.
      const invalidKey = validationKeys.find(k => $el.validity[k]);
      const errorText = (invalidKey && inputController?.[invalidKey]) || '';
      $el.setCustomValidity(errorText);
    }

    return $el;
  };

  // 값이 바뀔 때마다 검증을 다시 돌립니다. #2-1의 handleInput과 같은 흐름입니다.
  // formState는 dispatch 이전 값이라, 지금 고치는 요소가 아닌 다른 필드의 값을 볼 때는
  // 한 박자 늦습니다. 다른 필드를 참조하는
  // 검증은 제출 시점의 checkAdditionalValidity가 마무리합니다.
  const handleChange = useCallback(
    (e: FormEvent) => {
      const $el = handleInvalid(e, formState);
      $el.reportValidity();
      dispatch($el);
    },
    [formState],
  );

  // invalid 이벤트는 DOM에서 버블링되지 않습니다. React도 위임하지 않고 요소에 직접 붙이므로
  // form 하나에 걸 수 없고 입력마다 달아야 합니다(#2-1의 onInput 위임과 대비되는 지점).
  const handleInvalidEvent = useCallback(
    (e: FormEvent) => handleInvalid(e, formState),
    [formState],
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const $form = e.currentTarget;

      // every()만 쓰면 첫 실패에서 순회가 멈춰 뒤쪽 필드의 setCustomValidity가 실행되지 않습니다.
      // map()으로 전부 돌려 상태를 갱신한 뒤 결과를 모읍니다.
      const results = Array.from($form.elements).map($el =>
        checkAdditionalValidity($el as FormElement, formState),
      );

      if (!results.every(Boolean)) {
        // 방금 건 커스텀 에러를 말풍선으로 보여주고 제출을 멈춥니다.
        $form.reportValidity();
        return;
      }

      // 비제어와 달리 FormData를 만들 필요가 없습니다. state가 이미 제출할 값 그 자체입니다.
      console.log(formState);
    },
    [formState],
  );

  // 파일은 File 객체라 그대로 <img>에 넣을 수 없어 임시 URL을 만듭니다.
  // 렌더마다 새로 만들면 메모리가 새므로 useMemo로 묶고 교체 시 해제합니다.
  const photoUrl = useMemo(
    () => (formState.__photo ? URL.createObjectURL(formState.__photo) : ''),
    [formState.__photo],
  );
  useEffect(
    () => () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    },
    [photoUrl],
  );

  // 제어 컴포넌트의 이점: 두 값의 비교를 렌더 중에 바로 파생시킬 수 있습니다.
  // 비제어(#2-1)에서는 이걸 위해 FormData를 다시 읽고 setCustomValidity를 호출해야 했습니다.
  const passwordMismatch =
    formState.__password_confirm !== '' &&
    formState.__password !== formState.__password_confirm;

  return (
    <>
      <h3>
        #2-2. React<sub>제어 폼</sub>
      </h3>
      <form id="registerForm2" onSubmit={handleSubmit}>
        <fieldset>
          <legend>회원가입</legend>
          <p>
            <label htmlFor="__id">아이디: </label>
            <input
              id="__id"
              name="__id"
              type="text"
              required
              pattern="^[A-z_0-9]{1,}$"
              minLength={4}
              maxLength={12}
              value={formState.__id}
              onChange={handleChange}
              onInvalid={handleInvalidEvent}
            />
          </p>
          <p>
            <label htmlFor="__name">이름: </label>
            <input
              id="__name"
              name="__name"
              type="text"
              required
              pattern="^([가-힣]){1,}$"
              minLength={2}
              value={formState.__name}
              onChange={handleChange}
              onInvalid={handleInvalidEvent}
            />
          </p>
          <p>
            <label>성별: </label>
            {/* 라디오는 value가 아니라 checked로 제어합니다.
                name이 같아야 한 그룹으로 묶이고, id는 label 연결용이라 서로 달라야 합니다. */}
            <input
              id="__gender_male"
              name="__gender"
              type="radio"
              value="남"
              required
              checked={formState.__gender === '남'}
              onChange={handleChange}
              onInvalid={handleInvalidEvent}
            />{' '}
            <label htmlFor="__gender_male">남</label>
            <input
              id="__gender_female"
              name="__gender"
              type="radio"
              value="여"
              checked={formState.__gender === '여'}
              onChange={handleChange}
              onInvalid={handleInvalidEvent}
            />
            <label htmlFor="__gender_female">여</label>
          </p>
          <p>
            <label htmlFor="__password">비밀번호: </label>
            <input
              id="__password"
              name="__password"
              type="password"
              required
              autoComplete="off"
              value={formState.__password}
              onChange={handleChange}
              onInvalid={handleInvalidEvent}
            />
          </p>
          <p>
            <label htmlFor="__password_confirm">비밀번호 확인: </label>
            <input
              id="__password_confirm"
              name="__password_confirm"
              type="password"
              required
              autoComplete="off"
              value={formState.__password_confirm}
              onChange={handleChange}
              onInvalid={handleInvalidEvent}
            />
            {passwordMismatch && (
              <span className="errorMsg"> 비밀번호가 일치하지 않습니다.</span>
            )}
          </p>
          <div>
            <label htmlFor="__photo">프로필사진: </label>
            {/* file은 제어할 수 없는 유일한 입력입니다. 스크립트로 value를 넣으면
                사용자 몰래 임의 파일을 업로드시킬 수 있어 브라우저가 막아 둡니다.
                따라서 value를 넘기지 않고 선택 결과(File)만 state에 담습니다. */}
            <input
              id="__photo"
              name="__photo"
              type="file"
              required
              accept="image/png, image/jpeg"
              onChange={handleChange}
              onInvalid={handleInvalidEvent}
            />
            <div>{photoUrl && <img src={photoUrl} alt="" />}</div>
          </div>
          <p>
            <label htmlFor="__salary">(선택) 연봉: </label>
            {/* state에는 숫자만, 화면에는 구분 기호를 넣어 보여줍니다.
                다만 React가 value를 다시 대입하므로 중간을 편집하면 커서가 끝으로 갑니다.
                제어 컴포넌트에서 이걸 막으려면 #1처럼 useLayoutEffect에서
                setSelectionRange로 커서를 복원해야 합니다. */}
            <input
              id="__salary"
              name="__salary"
              type="text"
              inputMode="numeric"
              value={
                formState.__salary
                  ? Number(formState.__salary).toLocaleString('en-US')
                  : ''
              }
              onChange={handleChange}
              onInvalid={handleInvalidEvent}
            />{' '}
            원
          </p>
          <p>
            {/* 체크박스는 checked로 제어하고, 읽을 때도 value가 아니라 checked를 봅니다. */}
            <input
              id="__agree"
              name="__agree"
              type="checkbox"
              required
              checked={formState.__agree}
              onChange={handleChange}
              onInvalid={handleInvalidEvent}
            />
            <label htmlFor="__agree">약관에 동의합니다</label>
          </p>
        </fieldset>
      </form>
      <button type="submit" form="registerForm2">
        제출
      </button>{' '}
    </>
  );
};

export default Form2;
