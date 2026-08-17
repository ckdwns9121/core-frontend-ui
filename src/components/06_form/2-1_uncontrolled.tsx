import type { FormEvent } from 'react';
import { DigitSeperatedInput } from './1_digitSeperatedInput';

type FormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

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

type FormControl = Partial<
  Record<keyof ValidityState, string> & {
    additionalValidator: ($el: FormElement, formData: FormData) => boolean;
    onInput: ($el: FormElement, formData: FormData) => void;
    transformData: (formData: FormData) => string | File;
  }
>;

const formController: Record<string, FormControl> = {
  _id: {
    valueMissing: '아이디를 입력하세요.',
    patternMismatch: '아이디는 영어나 숫자 또는 _ 만 입력할 수 있습니다.',
    tooShort: '아이디는 네 글자 이상 입력해 주세요.',
  },
  _name: {
    valueMissing: '이름을 입력하세요.',
    patternMismatch: '띄어쓰기 없이 한글만 입력하세요.',
    tooShort: '이름을 두 글자 이상 입력하세요.',
  },
  password_confirm: {
    additionalValidator: ($el, formData) =>
      $el.value === formData.get('password'),
    customError: '비밀번호가 일치하지 않습니다.',
  },
  photo: {
    onInput($el, formData) {
      const photo = formData.get('photo') as File;
      const $img = $el.parentElement?.querySelector('img');
      if ($img) {
        $img.src = photo ? URL.createObjectURL(photo) : '';
      }
    },
  },
  salary: {
    transformData: formData =>
      (formData.get('salary') as string).replace(/,/g, ''), // 1
  },
};

const handleInput = (e: FormEvent) => {
  e.preventDefault();
  const $el = e.target as FormElement;
  const formData = new FormData($el.form!);
  const inputController = formController[$el.id];
  const { additionalValidator, customError = '[custom error]' } =
    inputController || {};
  if (additionalValidator && !additionalValidator($el, formData)) {
    $el.setCustomValidity(customError);
  } else {
    const invalidKey = validationKeys.find(k => $el.validity[k]);
    const errorText = (invalidKey && inputController?.[invalidKey]) || '';
    $el.setCustomValidity(errorText);
  }
  inputController?.onInput?.($el, formData);
  $el.reportValidity();
};

const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  const $form = e.target as HTMLFormElement;
  const data = new FormData($form);
  console.log(data);
  for (const [key] of data) {
    if (formController[key]?.transformData) {
      data.set(key, formController[key].transformData(data));
    }
  }
  console.log(Object.fromEntries(data));
};

const Form1 = () => {
  return (
    <>
      <h3>
        #2-1. React<sub>비제어 폼</sub>
      </h3>
      <sub>{}</sub>
      <form id="registerForm" onInput={handleInput} onSubmit={handleSubmit}>
        <fieldset>
          <legend>회원가입</legend>
          <p>
            <label htmlFor="_id">아이디: </label>
            <input
              id="_id"
              name="id"
              type="text"
              required // 1
              pattern="^[A-z_0-9]{1,}$"
              minLength={4}
              maxLength={12}
            />
          </p>
          <p>
            <label htmlFor="_name">이름: </label>
            <input
              id="_name"
              name="name"
              type="text"
              required
              pattern="^([가-힣]){1,}$"
              minLength={2}
            />
          </p>
          <p>
            <label>성별: </label>
            <input
              id="gender_male"
              name="gender"
              type="radio"
              value="남"
              required
            />{' '}
            <label htmlFor="gender_male">남</label>
            <input id="gender_female" name="gender" type="radio" value="여" />
            <label htmlFor="gender_female">여</label>
          </p>
          <p>
            <label htmlFor="password">비밀번호: </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="off"
            />
          </p>
          <p>
            <label htmlFor="password_confirm">비밀번호 확인: </label>
            <input
              id="password_confirm"
              type="password"
              required
              autoComplete="off"
            />
          </p>
          <div>
            <label htmlFor="photo">프로필사진: </label>
            <input
              id="photo"
              name="photo"
              type="file"
              required
              accept="image/png, image/jpeg"
            />
            <div>
              <img alt="" />
            </div>
          </div>
          <p>
            <label htmlFor="salary">(선택) 연봉: </label>
            <DigitSeperatedInput name="salary" id="salary" /> 원
          </p>
          <p>
            <input id="agree" name="agree" type="checkbox" required />
            <label htmlFor="agree">약관에 동의합니다</label>
          </p>
        </fieldset>
      </form>
      <button type="submit" form="registerForm">
        제출
      </button>{' '}
    </>
  );
};

export default Form1;
